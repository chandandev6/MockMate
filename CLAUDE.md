# CLAUDE.md — rules for working on this project

## 👨‍🎓 How we work (MOST IMPORTANT — follow every time)
I am a student. I am building this project to **learn**, not just to get working code.

1. **Explain first, code later.** Before writing/editing any file, installing packages, or running anything that changes the project:
   - explain **what** we are building in this step,
   - **why** we need it (what problem it solves),
   - **how** it works (concepts, which files, how pieces connect, order of flow).
2. **Wait for my "go"** (go / start / haan kar do / fix it) before changing anything. Reading files and running checks (lint, build, tests) is fine without asking.
3. **One step at a time.** Don't jump ahead to the next PRD step or add extra features I didn't ask for.
4. **While coding, explain what you did** — short explanation per file/change. Beginner-friendly language; Hinglish is fine.
5. **After a step:** show how to test it yourself, then update the PRD tracker.
6. **If you make a mistake or skip something, say so honestly.**

## 📍 Where we are
- Progress lives in **`PRD.md` §0 (Project Tracker)**. On "start from where we left": read §0 → tell me the current step → explain it → wait for go.
- Step details are in `PRD.md` §10. Update §0 (step board, stage progress, work log, blockers) at the end of every session.

## 🏗️ Project
**MockMate** (formerly InterviewIQ.AI) — AI mock interview platform: Google login → upload resume + choose role/experience/mode → AI avatar asks questions by voice, user answers by voice → AI evaluates → scored report + PDF. Interviews cost credits.

- `client/` — React 19 + Vite, Tailwind, Redux Toolkit, react-router, Firebase (Google popup), `motion`. Run: `npm run dev` (port 5173).
- `server/` — Node + Express 5 (ES modules), MongoDB/Mongoose, JWT in httpOnly cookie, Firebase Admin (verifies Google ID token), OpenRouter for AI, multer (PDF in memory). Run: `npm run dev` (port 8000).

## ✍️ Code conventions
- Server is split into feature modules: `server/src/modules/<feature>/` → `*.routes.js`, `*.controller.js`, `*.service.js`, `*.model.js`. New feature = new module + one line in `app.js`.
- Request validation: zod schemas in `modules/<feature>/<feature>.schema.js`, applied with `validate({ body, params, query })` in routes.
- Config: import `env` from `config/env.js` — never read `process.env` elsewhere. New env var = add to env.js schema + `.env.example`.
- Every API response: `{ success, message, data }` (use `sendSuccess` from `utils/response.js`).
- Errors: `throw new AppError(status, message, code?)` (`code` = stable name the frontend can check, e.g. `EMAIL_NOT_VERIFIED`) — no try/catch in controllers (Express 5 forwards async errors to `errorHandler`).
- Client: never call axios in components — add a function in `client/src/api/<feature>.api.js` (uses the shared `api` instance from `api/axios.js`). API functions return the server body, so components read `const res = await loginUser(...)` → `res.data.user`, `res.message`. Errors → `getErrorMessage(error)` from `utils/`.
- Client: private pages go inside `<ProtectedRoute>` in `App.jsx`; new pages are `lazy()` imports.
- Comments are short, in Hinglish, explaining **why** — match the existing style.
- Never commit `.env` files; add new env vars to `.env.example` too.
- Commit only when I ask.

## ✅ Checks before saying "done"
- From the root: `npm run check` (Prettier check + ESLint client & server + client build)
- From the root: `npm test` (server + client tests; needs `docker compose up -d` for Redis). New feature = add tests next to the existing ones (`server/test/`, `client/src/**/*.test.jsx`)
- Server starts (`cd server && npm run dev`) and `/health` returns ok
- Formatting: Prettier (root `.prettierrc.json`: 4 spaces, 120 cols). Run `npm run format` on files you change.
- UI checks: headless `google-chrome` + a CDP script works; the user usually has dev servers running on 8000/5173. `server/.env` has real Gmail SMTP — set `SMTP_HOST=` empty for test processes so no real mail is sent.
