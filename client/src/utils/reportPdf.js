// report → PDF, poora browser me (server par zero load). jspdf bhaari hai (~400 kB) — isliye
// button dabane par hi download hota hai (dynamic import), report page ke saath nahi
import { CRITERIA, MODE_LABEL } from "../constants/interview.js";

// jsPDF ke default fonts sirf Latin-1 jaante hai. AI ke text me ‑ ’ “ … jaise characters aate hai
// jo PDF me kachra ban jaate — unhe simple wale se badlo, baaki anjaan characters hata do
const REPLACEMENTS = [
    [/[‐-―−]/g, "-"],
    [/[‘’‛]/g, "'"],
    [/[“”‟]/g, '"'],
    [/…/g, "..."],
    [/[^\S\n]/g, " "], // har ajeeb space (non-breaking, thin...) → normal space; newline rehne do
    [/•/g, "-"],
];
const clean = (text = "") =>
    REPLACEMENTS.reduce((out, [pattern, value]) => out.replace(pattern, value), String(text)).replace(
        /[^\x20-\x7E\xA0-\xFF\n]/g,
        "",
    );

const scoreRgb = (outOf10) => (outOf10 >= 7 ? [22, 163, 74] : outOf10 >= 4 ? [217, 119, 6] : [220, 38, 38]);

const MARGIN = 15;

export const downloadReportPdf = async (interview) => {
    const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const { report } = interview;
    const date = new Date(interview.completedAt || interview.createdAt);

    // ---- header ----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("MOCKMATE · INTERVIEW REPORT", MARGIN, 18);

    doc.setFontSize(20);
    doc.setTextColor(0);
    // lamba role score ke upar na chadhe — ek line me jitna aaye, baaki "..."
    const roleLines = doc.splitTextToSize(clean(interview.role), pageWidth - 2 * MARGIN - 45);
    doc.text(roleLines.length > 1 ? `${roleLines[0]}...` : roleLines[0], MARGIN, 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
        `${MODE_LABEL[interview.mode] ?? interview.mode} interview  |  ${clean(interview.experience)}  |  ${date.toLocaleDateString()}`,
        MARGIN,
        35,
    );

    // overall score — right side, rang score ke hisaab se
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(...scoreRgb(report.overallScore / 10));
    doc.text(String(report.overallScore), pageWidth - MARGIN - 14, 30, { align: "right" });
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("/100", pageWidth - MARGIN, 30, { align: "right" });

    // ---- skill averages ----
    autoTable(doc, {
        startY: 44,
        margin: { left: MARGIN, right: MARGIN },
        head: [["Skill", "Average score"]],
        body: CRITERIA.map(({ key, label }) => [label, `${report.averages[key]} / 10`]),
        theme: "grid",
        headStyles: { fillColor: [17, 17, 17] },
        columnStyles: { 1: { halign: "right", cellWidth: 40 } },
        didParseCell: (data) => {
            if (data.section === "body" && data.column.index === 1) {
                data.cell.styles.textColor = scoreRgb(report.averages[CRITERIA[data.row.index].key]);
                data.cell.styles.fontStyle = "bold";
            }
        },
    });

    // ---- strengths / weaknesses / improvements ----
    const insights = [
        ["Strengths", report.strengths, [22, 163, 74]],
        ["Weaknesses", report.weaknesses, [220, 38, 38]],
        ["How to improve", report.improvements, [217, 119, 6]],
    ];
    for (const [title, items, color] of insights) {
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 8,
            margin: { left: MARGIN, right: MARGIN },
            head: [[title]],
            body: items.map((item) => [`- ${clean(item)}`]),
            theme: "plain",
            headStyles: { textColor: color, fontSize: 12 },
            bodyStyles: { fontSize: 10, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 } },
        });
    }

    // ---- har question ----
    interview.questions.forEach((item, index) => {
        const scores = item.scores
            ? CRITERIA.map(({ key, label }) => `${label} ${item.scores[key]}/10`).join("   ")
            : "Not scored";
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 8,
            margin: { left: MARGIN, right: MARGIN },
            head: [[`Q${index + 1} (${item.difficulty})`, clean(item.question)]],
            body: [
                ["Your answer", clean(item.answer) || "No answer"],
                ["Scores", scores],
                ["Feedback", clean(item.feedback) || "-"],
            ],
            theme: "grid",
            headStyles: { fillColor: [243, 244, 246], textColor: 0 },
            columnStyles: { 0: { cellWidth: 30, fontStyle: "bold" } },
            rowPageBreak: "avoid", // ek row do page me na kate
        });
    });

    // ---- footer: page number ----
    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page++) {
        doc.setPage(page);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${page} of ${pages}`, pageWidth - MARGIN, doc.internal.pageSize.getHeight() - 8, {
            align: "right",
        });
        doc.text("MockMate - AI mock interviews", MARGIN, doc.internal.pageSize.getHeight() - 8);
    }

    // "Frontend Developer" → mockmate-report-frontend-developer-2026-10-04.pdf
    const slug = clean(interview.role)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    // local date (toISOString UTC deta hai — raat ko interview diya to naam me kal/parso ki date aa jaati)
    const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    doc.save(`mockmate-report-${slug || "report"}-${day}.pdf`);
};
