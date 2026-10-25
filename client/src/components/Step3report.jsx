// completed interview ki report — /report/:id page isse dikhata hai
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { BsChevronDown, BsDownload } from "react-icons/bs";
import { CRITERIA, MODE_LABEL } from "../constants/interview.js";
import { downloadReportPdf } from "../utils/reportPdf.js";

// score ke hisaab se rang — ek hi jagah taaki number, bars, badges sab match karein (design tokens jaise hi)
const scoreColor = (outOf10) => (outOf10 >= 7 ? "#23704f" : outOf10 >= 4 ? "#9a5b00" : "#b42318");

// ek line ka faisla — number ke saath matlab bhi
const verdict = (score) =>
    score >= 70 ? "Strong round." : score >= 40 ? "Getting there." : "Worth another rehearsal.";

function InsightList({ title, items }) {
    return (
        <div className="pt-6">
            <h3 className="eyebrow !text-ink mb-4">{title}</h3>
            <ol className="space-y-3">
                {items.map((item, i) => (
                    <li key={item} className="grid grid-cols-[1.75rem_1fr] text-sm leading-relaxed">
                        <span className="font-mono text-xs text-muted pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                        {item}
                    </li>
                ))}
            </ol>
        </div>
    );
}

function QuestionItem({ item, index }) {
    const [open, setOpen] = useState(false);
    const avg = item.scores ? Object.values(item.scores).reduce((a, b) => a + b, 0) / 4 : 0;
    return (
        <li className="border-b border-line">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="w-full grid grid-cols-[3.25rem_1fr_auto] items-center gap-4 py-5 text-left group"
            >
                <span
                    className="w-12 h-12 rounded-full flex items-center justify-center font-mono text-sm font-medium text-paper"
                    style={{ backgroundColor: scoreColor(avg) }}
                >
                    {avg.toFixed(1)}
                </span>
                <span className="font-semibold leading-snug group-hover:underline underline-offset-4">
                    <span className="font-mono text-xs text-muted mr-2">Q{index + 1}</span>
                    {item.question}
                </span>
                <BsChevronDown className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="pb-6 sm:pl-[4.25rem] grid gap-5 text-sm">
                    <div>
                        <p className="eyebrow mb-1.5">Your answer</p>
                        <p className="whitespace-pre-wrap leading-relaxed">
                            {item.answer || <em className="text-muted">No answer</em>}
                        </p>
                    </div>
                    {item.scores && (
                        <div className="flex flex-wrap gap-2">
                            {CRITERIA.map(({ key, label }) => (
                                <span
                                    key={key}
                                    className="font-mono text-xs bg-ground border border-line rounded-full px-3 py-1"
                                >
                                    {label}: {item.scores[key]}/10
                                </span>
                            ))}
                        </div>
                    )}
                    {item.feedback && (
                        <div className="border-l-2 border-ink pl-4">
                            <p className="eyebrow mb-1.5">Feedback</p>
                            <p className="leading-relaxed">{item.feedback}</p>
                        </div>
                    )}
                </div>
            )}
        </li>
    );
}

function Step3report({ interview }) {
    const navigate = useNavigate();
    const { report } = interview;
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadReportPdf(interview);
        } catch (error) {
            console.error("PDF failed:", error);
            toast.error("Could not create the PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
            {/* summary — bada number, role, verdict */}
            <section className="grid lg:grid-cols-12 gap-8 items-end pb-10 border-b border-ink animate-rise">
                <div className="lg:col-span-7">
                    <p className="eyebrow mb-4">
                        Report · {MODE_LABEL[interview.mode]} interview · {interview.experience} ·{" "}
                        {new Date(interview.completedAt || interview.createdAt).toLocaleDateString()}
                    </p>
                    <h1 className="text-[clamp(2.5rem,1rem+4.5vw,5rem)] font-black tracking-[-0.05em] leading-[0.92]">
                        {interview.role}
                    </h1>
                    <p className="mt-4 text-xl text-muted">{verdict(report.overallScore)}</p>
                </div>
                <div className="lg:col-span-5 lg:text-right">
                    <p
                        className="font-black tracking-[-0.07em] leading-[0.8] text-[clamp(7rem,4rem+9vw,12rem)]"
                        style={{ color: scoreColor(report.overallScore / 10) }}
                    >
                        <span>{report.overallScore}</span>
                        <span className="text-2xl font-semibold tracking-normal text-muted">/100</span>
                    </p>
                    {/* 0–100 ki scale par apni jagah */}
                    <div className="relative h-1.5 bg-line rounded-full mt-6">
                        <motion.span
                            className="absolute -top-1.5 w-1 h-4.5 rounded-full bg-ink"
                            initial={{ left: "0%" }}
                            animate={{ left: `${report.overallScore}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-muted mt-2">
                        <span>0</span>
                        <span>40</span>
                        <span>70</span>
                        <span>100</span>
                    </div>
                </div>
            </section>

            {/* 4 criteria */}
            <section className="grid grid-cols-2 lg:grid-cols-4 border-b border-line">
                {CRITERIA.map(({ key, label }, i) => (
                    <div
                        key={key}
                        className={`py-8 pr-4 ${i % 2 ? "pl-4 lg:pl-6" : ""} ${i > 0 ? "border-l border-line" : ""} ${i === 2 ? "border-l-0 lg:border-l" : ""} ${i > 1 ? "border-t lg:border-t-0 border-line" : ""} ${i === 2 ? "lg:pl-6" : ""}`}
                    >
                        <p className="eyebrow mb-2">{label}</p>
                        <p className="text-3xl font-extrabold tabular-nums tracking-[-0.03em] mb-3">
                            <span>{report.averages[key]}/10</span>
                        </p>
                        <div className="h-1.5 bg-line rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: scoreColor(report.averages[key]) }}
                                initial={{ width: 0 }}
                                animate={{ width: `${report.averages[key] * 10}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                ))}
            </section>

            {/* AI insights */}
            <section className="grid md:grid-cols-3 gap-x-10 gap-y-4 py-10 border-b border-line">
                <InsightList title="Strengths" items={report.strengths} />
                <InsightList title="Weaknesses" items={report.weaknesses} />
                <InsightList title="How to improve" items={report.improvements} />
            </section>

            {/* per question */}
            <section className="py-10">
                <h2 className="text-3xl font-extrabold tracking-[-0.03em] mb-4">Question by question</h2>
                <ol className="border-t border-ink">
                    {interview.questions.map((item, index) => (
                        <QuestionItem key={index} item={item} index={index} />
                    ))}
                </ol>
            </section>

            <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => navigate("/interview")} className="btn btn-signal">
                    New interview
                </button>
                <button type="button" onClick={handleDownload} disabled={downloading} className="btn btn-ink">
                    <BsDownload /> {downloading ? "Creating PDF…" : "Download PDF"}
                </button>
                <button type="button" onClick={() => navigate("/history")} className="btn btn-line">
                    View history
                </button>
            </div>
        </div>
    );
}

export default Step3report;
