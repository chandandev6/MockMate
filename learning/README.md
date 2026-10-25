# learning/ — study material for MockMate

| File | What it is |
|---|---|
| `01-MockMate-Main-Guide.pdf` | The whole project with diagrams: journey, architecture, request pipeline, data model, state machine, end-to-end sequence, queue, AI layer, security, reliability, frontend, deployment, testing |
| `02-MockMate-Feature-Guide.pdf` | 19 features, one chapter each: what/why, files, flow diagram, real code, edge cases, how to test, how to explain |
| `03-MockMate-Interview-Questions.pdf` | 93 interview questions with model answers + rapid-fire revision table |
| `resume/` | Resume `.tex` + PDF (git-ignored — has phone/email) |
| `src/` | HTML sources, shared `style.css`, `render.js` (Mermaid setup) and `build.mjs` |

## Rebuild the PDFs

```
node learning/src/build.mjs          # all three
node learning/src/build.mjs 02       # only the feature guide
```

Needs `google-chrome`. Mermaid is downloaded to `src/vendor/` on the first run (git-ignored).

Resume: `cd learning/resume && pdflatex Chandan_Kumar_Resume.tex` (needs the `fullpage` and babel `english`
LaTeX packages — on Fedora: `sudo dnf install texlive-preprint texlive-babel-english`), or upload the `.tex` to Overleaf.
