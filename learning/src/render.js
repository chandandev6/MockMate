// har learning page ke end me load hota hai: Mermaid diagrams banao, phir build.mjs ko "ready" signal do
/* global mermaid */
mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    fontFamily: "Noto Sans, Arial, sans-serif",
    securityLevel: "loose",
    themeVariables: {
        fontSize: "14px",
        primaryColor: "#e8efff",
        primaryBorderColor: "#1d4ed8",
        primaryTextColor: "#0f172a",
        secondaryColor: "#e9f7ee",
        secondaryBorderColor: "#15803d",
        tertiaryColor: "#fff5e6",
        tertiaryBorderColor: "#b45309",
        lineColor: "#475569",
        textColor: "#0f172a",
        noteBkgColor: "#fff5e6",
        noteBorderColor: "#b45309",
        actorBkg: "#e8efff",
        actorBorder: "#1d4ed8",
        signalColor: "#334155",
        labelBoxBkgColor: "#e8efff",
        clusterBkg: "#f6f8fa",
        clusterBorder: "#94a3b8",
        edgeLabelBackground: "#ffffff",
    },
    flowchart: { curve: "basis", htmlLabels: true, padding: 12, nodeSpacing: 34, rankSpacing: 42 },
    sequence: { actorMargin: 95, messageMargin: 34, mirrorActors: false, noteMargin: 10, wrap: true, width: 165, boxTextMargin: 6 },
    er: { layoutDirection: "TB", minEntityWidth: 120 },
    state: { padding: 8 },
});

mermaid
    .run({ querySelector: ".mermaid" })
    .then(() => document.fonts.ready)
    .then(() => {
        // Mermaid har SVG ko apni "natural" width par rok deta hai — chhote dikhte hai. Page me fit karo:
        // poori width (182 mm) ya figure ki max height, jo pehle aaye. Text bahut bada na ho, isliye max 1.45x
        const MM = 96 / 25.4;
        document.querySelectorAll("figure .mermaid svg").forEach((svg) => {
            const box = svg.viewBox.baseVal;
            if (!box || !box.width) return;
            const fig = svg.closest("figure");
            const maxH = (fig.classList.contains("tall") ? 212 : fig.classList.contains("mid") ? 150 : 110) * MM;
            const scale = Math.min((182 * MM) / box.width, maxH / box.height, 1.45);
            svg.removeAttribute("style");
            svg.setAttribute("width", String(box.width * scale));
            svg.setAttribute("height", String(box.height * scale));
        });
    })
    .then(() => {
        window.__READY = true;
    })
    .catch((error) => {
        window.__ERROR = String(error && error.message ? error.message : error);
    });
