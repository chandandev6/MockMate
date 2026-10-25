// learning/ ki PDFs banata hai: HTML (+ Mermaid diagrams) → headless Chrome → PDF.
// Chalao (project root se):  node learning/src/build.mjs
// Zarurat: google-chrome installed. Mermaid pehli baar CDN se vendor/ me download hota hai.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(SRC, "..");
const MERMAID = path.join(SRC, "vendor", "mermaid.min.js");
const MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";

const DOCS = [
    { html: "01-main-guide.html", pdf: "01-MockMate-Main-Guide.pdf", title: "MockMate — Main Guide" },
    { html: "02-feature-guide.html", pdf: "02-MockMate-Feature-Guide.pdf", title: "MockMate — Feature Guide" },
    {
        html: "03-interview-questions.html",
        pdf: "03-MockMate-Interview-Questions.pdf",
        title: "MockMate — Interview Questions",
    },
];

// `node build.mjs 01` = sirf wahi document (jaldi check karne ke liye)
const only = process.argv.slice(2);
const selected = only.length ? DOCS.filter((doc) => only.some((prefix) => doc.html.startsWith(prefix))) : DOCS;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!existsSync(MERMAID)) {
    console.log("Downloading Mermaid…");
    const res = await fetch(MERMAID_URL);
    if (!res.ok) throw new Error(`Mermaid download failed: ${res.status}`);
    writeFileSync(MERMAID, Buffer.from(await res.arrayBuffer()));
}

// Chrome ko debugging port ke saath kholo — port 0 = koi bhi khaali port, Chrome file me likh deta hai
const profile = mkdtempSync(path.join(tmpdir(), "learning-pdf-"));
const chrome = spawn(
    "google-chrome",
    ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "about:blank"],
    { stdio: "ignore" },
);

const portFile = path.join(profile, "DevToolsActivePort");
for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
const port = readFileSync(portFile, "utf8").split("\n")[0];

// ek page (tab) kholo aur uske WebSocket se CDP commands bhejo
const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));

let nextId = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
});
const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
    });

const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, returnByValue: true })).result.value;

const footer = (title) => `
<div style="width:100%;font-family:'Noto Sans',sans-serif;font-size:7.5px;color:#6b7280;padding:0 14mm;display:flex;justify-content:space-between">
  <span>${title}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
</div>`;

try {
    for (const doc of selected) {
        const file = path.join(SRC, doc.html);
        await send("Page.navigate", { url: pathToFileURL(file).href });
        // page apne aap window.__READY = true karta hai jab saare diagrams ban jaaye
        let state = null;
        for (let i = 0; i < 300; i++) {
            await sleep(200);
            state = await evaluate("window.__READY ? 'ready' : window.__ERROR || null").catch(() => null);
            if (state) break;
        }
        if (state !== "ready") throw new Error(`${doc.html}: ${state || "timed out waiting for diagrams"}`);

        const { data } = await send("Page.printToPDF", {
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: true,
            headerTemplate: "<span></span>",
            footerTemplate: footer(doc.title),
        });
        writeFileSync(path.join(OUT, doc.pdf), Buffer.from(data, "base64"));
        console.log(`✓ ${doc.pdf}`);
    }
} finally {
    ws.close();
    chrome.kill();
    await sleep(300);
    rmSync(profile, { recursive: true, force: true });
}
