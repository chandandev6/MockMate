# PRD — AI Interview Agent (InterviewIQ.AI)

> Last updated: 2026-09-29 · Status: **Early MVP (≈25% built)**. Progress tracker is in **§0**; detailed steps are in **§10**.

---

## 0. 📊 Project Tracker  ← start here

> **This section is the single source of truth for progress.** Both of us update it:
> - When you start a step, set its status to 🟡 and fill in **Started**.
> - When a step's **✅ Done when** check passes (see §10), tick its boxes, set ✅, fill in **Done**, and add a line to the **Work Log** (§0.4).
> - Stuck? Set ⛔ and add a row to **Blockers & Decisions** (§0.5).
> - Claude updates this tracker at the end of every working session.
>
> **Status key:** ⬜ Todo · 🟡 In progress · ✅ Done · ⛔ Blocked · ⏭️ Skipped

### 0.1 Current focus
| | |
|---|---|
| **Now** | Step 26a — load balancer (plan approved, awaiting go): `server/Dockerfile` + `.dockerignore`, `nginx/nginx.conf` (round robin, max_fails / proxy_next_upstream), docker-compose profile `lb` (api ×3 via `--scale`, worker ×1, nginx :8080), `X-Instance` response header, `TRUST_PROXY_HOPS` honoured in dev when set (prod unchanged), test + README section |
| **Next** | Step 26b — autocannon load test (/health, current-user, history) → `docs/loadtest.md` → tick Step 25 (real URLs in README/render.yaml) → MockMate rename |
| **Milestone** | 🎯 MVP (end of Stage 4): target **2026-10-22** |
| **Last updated** | 2026-10-26 |

### 0.2 Stage progress
| Stage | Steps | Done | Progress | Target date | Status |
|-------|-------|------|----------|-------------|--------|
| 0. Foundation | — | ✅ | `██████████` 100% | 2026-09-29 | ✅ |
| 1. Setup for growth | 1–4 (+2b) | 5/5 | `██████████` 100% | 2026-10-02 | ✅ |
| 2. Interview backend | 5–9 | 5/5 | `██████████` 100% | 2026-10-09 | ✅ |
| 3. Interview frontend | 10–14 | 5/5 | `██████████` 100% | 2026-10-17 | ✅ |
| 4. History & reports 🎯 MVP | 15–17 | 3/3 | `██████████` 100% | 2026-10-22 | ✅ |
| 5. Payments | 18–20 | 3/3 | `██████████` 100% | 2026-10-28 | ✅ |
| 6. Production & scale | 21–26 | 4/6 | `███████░░░` 67% | 2026-11-06 | 🟡 |
| 7. Differentiators | 27–33 | 0/7 | `░░░░░░░░░░` 0% | after launch | ⬜ |
| **Total (Steps 1–26 + 2b)** | | **25/27** | `█████████░` 93% | | |

### 0.3 Step board
| # | Step | Area | Est. | Status | Started | Done | Notes |
|---|------|------|------|--------|---------|------|-------|
| 1 | Restructure server into feature modules | 🖥️ | 0.5d | ✅ | 2026-09-29 | 2026-09-29 | `server/src/` layout; API shape `{success,message,data}` |
| 2 | Security & validation (helmet, zod, rate limit) | 🖥️ | 0.5d | ✅ | 2026-09-30 | 2026-09-30 | env.js, validate.js, rateLimit.js, app.js order + trust proxy |
| 2b | Email/password login (bcrypt + email verification + forgot password) | 🖥️🎨 | 2d | ✅ | 2026-09-30 | 2026-09-30 | Committed `742ea00` (incl. forgot password, Gmail SMTP) |
| 3 | Client API layer + ProtectedRoute + lazy pages | 🎨 | 0.5d | ✅ | 2026-09-30 | 2026-09-30 | `src/api/`, interceptor, `loading`, ProtectedRoute, lazy pages; 10/10 headless-Chrome checks |
| 4 | Dev tooling (git, prettier, compress assets, README) | 🎨🖥️ | 0.5d | ✅ | 2026-09-30 | 2026-09-30 | Committed `d2f2c78` (incl. Prettier run) |
| 5 | Interview model + MODES + prompts | 🖥️ | 0.5d | ✅ | 2026-09-30 | 2026-09-30 | model, modes, prompts, AI schemas, `askAiJson`; all prompts reviewed live on the free model |
| 6 | Resume upload & parsing | 🖥️ | 1d | ✅ | 2026-10-01 | 2026-10-01 | `POST /api/interview/resume`; pdf-parse v2, first 5 pages, 12k chars; AI fail → 503. Committed `3a133a5` |
| 7 | Start interview (atomic credits + questions) | 🖥️ | 1d | ✅ | 2026-10-03 | 2026-10-03 | `POST /api/interview/start`; idempotency key (`requestId` + unique index) → double-click charges once; refund on AI fail. Committed `3a133a5` |
| 8 | Submit & evaluate answer | 🖥️ | 1d | ✅ | 2026-10-04 | 2026-10-04 | `POST /api/interview/:id/answer`; claim answer atomically first → 409 on double submit; 404 for others' interviews; AI fail → claim undone + 503. Committed `062562d` |
| 9 | Finish + report + history API | 🖥️ | 1d | ✅ | 2026-10-04 | 2026-10-04 | finish (claim → `finishing`, scores in code, AI text), `GET /:id`, `GET /history` (paged, lean, projection); `docs/api.postman.json`. Committed `3d31f3b` |
| 10 | Interview Redux slice + API | 🎨 | 0.5d | ✅ | 2026-10-04 | 2026-10-04 | `interview.api.js`, `interviewSlice` (+ restore after refresh), `setCredit` |
| 11 | Step 1: Setup screen | 🎨 | 1d | ✅ | 2026-10-04 | 2026-10-04 | role suggestions, experience, mode cards, resume drop zone + chips, avatar, idempotent Start |
| 12 | Step 2: Live interview (voice, avatar, timer) | 🎨 | 2–3d | ✅ | 2026-10-04 | 2026-10-04 | TTS + STT + countdown hooks, `QuestionRound`, resume after refresh. Real-mic test pending (you) |
| 13 | Step 3: Report screen | 🎨 | 1d | ✅ | 2026-10-04 | 2026-10-04 | `/report/:id` page; PDF button → Step 17, History button → Step 15 |
| 14 | End-to-end polish | 🎨🖥️ | 1d | ✅ | 2026-10-04 | 2026-10-04 | react-hot-toast, skeleton, retry buttons, low-credit banner, mobile Navbar fix. Committed `584e6d4` |
| 15 | History page | 🎨 | 1d | ✅ | 2026-10-04 | 2026-10-04 | cards, mode tabs (server `?mode=`), Load more, Continue for in-progress, empty/skeleton/error. Committed `c75f76e` |
| 16 | Analytics (charts + stats API) | 🎨🖥️ | 1d | ✅ | 2026-10-04 | 2026-10-04 | `GET /stats` ($facet aggregation), KPI tiles + recharts trend (lazy) + skill bars + by mode on /history. Committed `b9fefd8` |
| 17 | Report page + PDF download | 🎨 | 1d | ✅ | 2026-10-04 | 2026-10-04 | `utils/reportPdf.js` (jspdf + autotable, lazy-loaded, Latin-1 text cleanup). Committed `c75f76e` |
| 18 | Transaction ledger | 🖥️ | 0.5d | ✅ | 2026-10-04 | 2026-10-04 | `modules/credit`: Transaction model, charge/add in a MongoDB transaction, signup bonus row, `GET /api/credits/transactions`. Committed `6920f01` |
| 19 | Pricing + payment gateway + webhook | 🖥️🎨 | 2d | ✅ | 2026-10-04 | 2026-10-04 | Razorpay: plans, order, verify (HMAC), idempotent webhook, `/pricing`. Real test payment ✅ 2026-10-05 (₹249 Pro → +1500). Webhook not set yet (needs public URL). Committed `6920f01` |
| 20 | Account page | 🎨 | 0.5d | ✅ | 2026-10-04 | 2026-10-04 | `/account`: profile, balance, credit history, logout. Committed `6920f01` |
| 21 | Logging & monitoring (pino, Sentry) | 🖥️ | 0.5d | ✅ | 2026-10-04 | 2026-10-04 | pino + pino-http (reqId, AsyncLocalStorage → `getLogger()`), Sentry server + client (optional DSN), `/ready`. Committed `a2e5cf7` |
| 22 | Redis (rate limit store, cache) | 🖥️ | 1d | ✅ | 2026-10-05 | 2026-10-05 | ioredis + rate-limit-redis, cache-aside for current-user (60s) + stats (10 min) with invalidation, fail open, Redis on 6380 via docker compose. Committed `a51347d` |
| 23 | Background queue (BullMQ worker) | 🖥️ | 1–2d | ✅ | 2026-10-05 | 2026-10-05 | `src/worker.js`; resume AI + final report as jobs (202 + jobId → `GET /api/jobs/:id`); 3 tries, exponential backoff; 1 AI job per user (Redis lock); cleanup job every minute fixes stuck starting/finishing. Committed `8c210ec` |
| 24 | Tests + CI | 🖥️🎨 | 1–2d | ✅ | 2026-10-05 | 2026-10-05 | 38 server tests (Vitest + Supertest + in-memory MongoDB, AI/email faked) + 11 client tests (Testing Library); GitHub Actions CI. Not committed |
| 25 | Deploy (Vercel + Render/Railway + Atlas) | 🚀 | 1d | 🟡 | 2026-10-07 | | **Live:** https://ai-interview-agent-roan.vercel.app (API https://ai-interview-agent-l1fe.onrender.com). Login, voice (Chrome) and reports work live. AI = Groq. Open: docs still show old URLs |
| 26 | Load test to 1,000 req/s & tune | 📈 | 1d | ⬜ | | | |

### 0.4 Work log
Newest first. Format: `date · who · step · what changed`.

| Date | Who | Step | What |
|------|-----|------|------|
| 2026-10-26 | Claude | — | 🎨 **Rename → MockMate + full UI redesign** (you: "make everything", front-skill). Direction: "rehearsal room" (broadcast studio × Swiss grid) — tokens in `client/src/index.css` `@theme`: ground #E5E9EE, ink navy #0F2540, muted #4A5A6E, ONE accent signal vermilion #F75C2F (fill only), good/warn/bad; fonts Schibsted Grotesk + Martian Mono (Google Fonts in `index.html`); shared classes `.btn-*/.field/.panel/.eyebrow/.lamp/.grid-rules`; `ui/Wordmark`, `ui/LevelMeter`; CSS entrance animation (no JS-hidden content), reduced-motion respected. Redone: Navbar (index nav 01/02/03, CR chip; auth modal moved outside header — backdrop-blur trapped the fixed modal), Footer (colophon + giant wordmark), Home (poster hero with visible grid + sample live session card, 4-beat format, 3 modes with real server weights — now in `constants/interview.js`, dark sample scorecard, CTA), Auth (split navy panel), Verify/Reset, Setup (numbered form + sticky session ticket), live room (camera-frame monitor, Q1–Q5 strip, ON AIR mic), Report (giant score + scale, criteria strip, insights, Q-by-Q), History (KPI strip, chart navy + latest dot red, logbook rows), Pricing (rate card), Account (balance card + ledger), loader, toasts, PDF header/footer/filename. Brand also in emails, Razorpay checkout, README (features + `docs/screenshots/`), Postman, CLAUDE.md, learning PDFs (renamed `0x-MockMate-*.pdf`, new design-system section, fixed CI figure 17→25 client tests) + resume. Infra names unchanged (Render `interviewiq-api`, docker `interviewiq-redis`, DB `ai_interview`, Firebase). Checked with screenshots 1440 + 390 using a temporary in-memory DB demo server (deleted). Old stock images now unused (not deleted). `npm run check` ✅, tests 58 + 25 ✅. Not committed |
| 2026-10-26 | Claude | — | 🔊 **Natural interviewer voice in Firefox/Brave** (you: "voice of agent not clear"). Cause: Linux Firefox/Brave only have robotic eSpeak voices (Google voices are Chrome-only). Fix, hybrid like the mic: `useSpeechSynthesis` uses the browser voice when `isNaturalVoice(best)` (Google/Microsoft/Samantha…), else fetches every sentence in parallel from new **`POST /api/tts`** (Groq Orpheus `canopylabs/orpheus-v1-english`, voices hannah/troy by avatar, raw `audio/wav`), plays them in order via one `<audio>`, caches blob URLs (Repeat = no new call), falls back to the browser voice on any error; waits ≤1 s for `voiceschanged`; run counter so `cancel()` stops old runs. Server: `modules/tts` (zod: text 1–600, gender), `ttsLimiter` 40/min/user, `lib/ai/whisper.js` → **`lib/ai/voice.js`** (Whisper + Orpheus), env `GROQ_TTS_MODEL` / `GROQ_TTS_VOICE_FEMALE` / `GROQ_TTS_VOICE_MALE`. You accepted the Orpheus terms in the Groq console (needed, else 400 `model_terms_required`). Real check: Orpheus female 2.4 s / male 0.7 s, Whisper read both back correctly. Tests: server 4 (`test/tts.test.js`) → 58/58, client 4 → 25/25; `npm run check` ✅. **Learning material updated** (you asked): Feature Guide F6 rewritten (hybrid diagram, files, code, browser table, careful box, how to test, say-it), limiter table; Main Guide numbers (24 endpoints, 8 modules, 5 limiters, 83 tests), stack/architecture rows, test table; Interview Questions Q1/Q7/Q8/Q53/Q66 (+ follow-up)/Q75/Q90, golden rules, cheat sheet; resume .tex numbers. All 3 PDFs rebuilt. **Not verified:** listening in a real Firefox/Brave session (please test). Not committed |
| 2026-10-26 | Claude | — | 🎤 **Voice typing in every browser** (you chose hybrid). Chrome/Edge/Safari keep the free live Web Speech API; Firefox, Brave and browsers whose speech service fails (`network` / `service-not-allowed` — Opera, Vivaldi, Linux Chromium, Safari with Siri off) switch automatically to **record → `POST /api/transcribe` → Groq Whisper** (`whisper-large-v3-turbo`, new env `GROQ_WHISPER_MODEL`, uses `GROQ_API_KEY`; no key → 503 `VOICE_UNAVAILABLE` → "please type"). **Server:** module `modules/transcribe`, `lib/ai/whisper.js` (multipart, `language=en`), `audioUpload` (audio/* only, 10 MB, memory — never saved), `voiceLimiter` (20/min per user, separate from AI limit). **Client:** `api/transcribe.api.js`; `useSpeechRecognition` = browser hook + recorder hook (MediaRecorder webm/ogg/mp4, silent recordings not sent — Whisper invents text on silence, mic tracks stopped), `stop()` waits for the text so Submit includes it; QuestionRound shows Recording / "Converting your voice to text…". Tests: server 4 (`test/transcribe.test.js`, Whisper mocked in `setup.js`) → 54/54; client 4 → 21/21. Real Groq check: espeak sentence as ogg + webm → transcribed word for word. `npm run check` ✅, server boots, `/health` ok. **Not verified:** a real Firefox/Brave mic session (please test). Not committed |
| 2026-10-22 | Claude | — | 📚 Study PDFs: Groq shown as the live AI, OpenRouter as a kept backup (`AI_PROVIDER=openrouter`, code unchanged — you chose option A). PDF 01: tech-stack row, folder tree, ch. 11 lead + diagram (solid = Groq, dotted = backup) + new Groq-vs-OpenRouter table, why/careful (default is still `openrouter` in `env.js`)/say boxes, test row; PDF 02 F14 lead; PDF 03 Q56. Rebuilt all 3 PDFs |
| 2026-10-08 | Claude | — | 📚 **Study material** (`learning/`, you asked): resume updated — InterviewIQ.AI added as the first project (4 bullets, numbers checked in code: 22 endpoints, 67 tests, races 10→1 / verify+webhook once), Redis/BullMQ/GitHub Actions/Groq added to skills, VS Code dropped to keep 1 page; `learning/resume/` git-ignored (phone/email). 3 PDFs built from HTML + Mermaid with headless Chrome (`node learning/src/build.mjs`): 01 Main Guide (30 pages, 17 chapters, 14 diagrams), 02 Feature Guide (36 pages, 19 features), 03 Interview Questions (26 pages, 93 Q&A + rapid-fire). `learning/` added to `.prettierignore`. `npm run check` ✅. Next: load balancer |
| 2026-10-08 | You + Claude | 25 | 🐞 **Live fixes.** **Voice:** console showed only eSpeak voices → you were on Firefox (Linux), which has no speech-to-text and only robotic voices; Brave exposes the API but blocks Google speech. `useSpeechSynthesis`: voices now scored (Google/Microsoft/Natural +4, eSpeak `+variant` −4, gender +2, en-US/GB/IN +1) and text spoken sentence by sentence (Chrome Google voices stop after ~15 s); `useSpeechRecognition`: Brave = unsupported → "please type" message. 6 client tests. Committed `3f60f12` (push pending — no GitHub login in Claude’s shell). **Report stuck 20+ min:** Render service was made by hand, not from the Blueprint → `RUN_WORKER_IN_API` missing → no worker → jobs never ran, and the client’s auto-retry on `INTERVIEW_FINISHING` has no limit. You set the env vars on Render. **AI → Groq:** new env `AI_PROVIDER` (openrouter/groq, default openrouter), `GROQ_API_KEY`, `GROQ_MODEL` (default `openai/gpt-oss-120b`); `env.js` requires only the chosen provider’s key; `lib/ai/openRouter.js` picks URL/key/models from a `PROVIDERS` map (Groq gets one `model`, no backup list). `llama-3.3-70b-versatile` no longer exists on Groq; tried gpt-oss-120b 1.4 s, gpt-oss-20b 1.2 s, qwen3.8-27b 0.8 s → chose gpt-oss-120b (old free Nemotron: 3.4 s+ on a small prompt). `.env.example`, `render.yaml`, README updated. Tests: `test/ai.test.js` (2) + 3 env tests → server 50/50, `npm run check` ✅, server boots with Groq, `/ready` ok. Confirmed by you: everything works live. Groq change not committed |
| 2026-10-07 | You + Claude | 25 | 🚀 **Deployed.** Render web service (manual, free, Singapore) + Render Key Value + Atlas; Vercel (root `client`). Fixed live: missing `NODE_ENV`/`NODE_VERSION` (pino-pretty crash), `CLIENT_URL` (https check), `REDIS_URL` pointed at localhost, `vercel.json` URL broken across 2 lines by the GitHub web editor, git remote moved to `chandandev6`, Firebase authorized domain missing. Google + email login work live. Found: voice input/output not working well |
| 2026-10-07 | Claude | 25 | 🟡 Deploy config (you chose Render free + Vercel proxy). **Server:** `jobs/startWorkers.js` (BullMQ workers + cleanup schedule in one function, returns `close()`); `worker.js` uses it; `server.js` also starts it when new env `RUN_WORKER_IN_API=true` (shutdown waits 25 s for running AI jobs). New env `TRUST_PROXY_HOPS` (app.js `trust proxy`; Vercel + Render = 2). Production now refuses a non-`https://` `CLIENT_URL`. `env.js` exports `parseEnv()` → `test/env.test.js` (7 tests). **Client:** `config/server.js` → in a production build with no `VITE_SERVER_URL` the API is same-site `/api`; `client/vercel.json` proxies `/api/*` to `interviewiq-api.onrender.com` + SPA fallback. **Root:** `render.yaml` (free web service, Singapore, `npm ci --omit=dev`, `/health` check, secrets `sync: false`, `JWT_SECRET` auto-generated, free Key Value with `noeviction`; paid worker commented out). README "🌍 Deploy" guide. Checks: `npm run check` ✅, tests server 45/45 + client 11/11 ✅, production-mode smoke run (workers in API, `/ready` ok, clean SIGTERM, http CLIENT_URL refused) ✅ |
| 2026-10-05 | Claude | 24 | ✅ Tests + CI (built while you slept — you said "go implement"). **Server** (`npm i -D vitest supertest mongodb-memory-server`): `vitest.config.js` (fake env values, files run one after another, 30 s test timeout), `test/globalSetup.js` (MongoMemoryReplSet — replica set because credits/payments use transactions; URI passed with `provide`/`inject`), `test/setup.js` (fake `askAiJson` + `sendMail` via `vi.mock`, connect, `model.init()` so unique indexes exist, wipe every collection + Redis **DB 1** before each test), helpers (`createUser` + JWT cookie, `startInterview`, `answerAll`, `fakeAi` answers per schema, test BullMQ worker + `waitForJob`). **App changes for testability:** `env.js` skips loading `.env` when `NODE_ENV=test` (tests can never hit Atlas / Gmail / Razorpay; dotenv now `quiet`); job processors moved from `worker.js` to `src/jobs/processors.js` (worker + tests share them). **38 server tests / 6 files:** health (4), auth (8: register → verify → login, lowercase email, one signup bonus, link single-use, same 401 for wrong password/unknown email, 400 before DB, 409, protected routes, logout), interview (11: charge + ledger, 402, **RACE 10 parallel starts with 50 credits → 1×201 + 9×402, credit 0**, same requestId → charged once, AI down → refund, 400 no AI call, answer + 409, empty answer = 0 without AI, time capped, **ownership: other user answer/read/finish → 404 and nothing changed**, history only own), jobs (6: resume 202 → pending → worker → result, bad PDF 400, 2nd job 429, other user's job 404, finish 202 → 409 while running → report with code-computed score + stats cache cleared → 200 after, AI always failing → 3 tries → failed + in_progress + lock released), cleanup (3: refund once + delete, never refund uncharged, finishing reset / recent untouched), payment (6: verify +1500 once, fake signature 400, someone else's order 404, webhook bad signature/valid/retry, smaller amount ignored, **RACE 3 verify + 3 webhooks → credited once**). **Proved the race test works:** temporarily broke `chargeCredits` into "check then subtract" → test failed (10×201), restored. **Client** (`npm i -D vitest @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event jsdom`): `vitest.config.js` (merges vite config, jsdom), `renderWithProviders` (real Redux slices + MemoryRouter); 11 tests: Setup (role required, not enough credits → warning + disabled, start sends trimmed role/mode/UUID + updates credit + saves active interview, server error shown, resume chips, non-PDF refused), Report (score/role/strengths/8/10, Download PDF), `waitForJob` with fake timers (polls until completed, failed → axios-shaped error, gives up after 3 min). **CI:** `.github/workflows/ci.yml` — ubuntu, Node 22, Redis 7 service, npm cache, MongoDB binary cache, format → lint → server tests → client tests → build; root `npm test`. **Verified:** server suite 4 runs in a row 38/38 (no flaky race tests); client 11/11, no warnings; **simulated CI on a clean copy** (git-tracked files only, no `.env`, fresh `npm ci` ×3, MongoDB downloaded from scratch) → every step green. **Not verified:** the real GitHub Actions run (needs your push). Test mistakes fixed while writing: expected 8 AI calls (forgot the start's question call → 9), raw `collection.updateOne` with a string id matched nothing (needs ObjectId). README "Tests & CI" section, CLAUDE.md checks include `npm test`. `npm run check` passes. Not committed. |
| 2026-10-05 | Claude | 23 | ✅ Background queue. `npm i bullmq` (v6). **Queues** (`lib/queue/queues.js`): `ai` (3 attempts, exponential backoff 2 s → 4 s, completed kept 1 h, failed 1 day) and `maintenance`; job names in one `JOB` object. **Per-user lock** (`lib/queue/aiJobs.js`): `SET ai-lock:<user> <jobId> NX EX 300` before adding → second AI job = 429 `AI_JOB_RUNNING`; released by the worker with a compare-and-delete Lua script; Redis down → 503 `QUEUE_UNAVAILABLE`; API reqId stored in job data. **Resume:** API still extracts PDF text (fast, bad PDF → instant 400) and queues only the text (≤12k chars, no 5 MB PDF in Redis) → 202 `{ jobId }`; worker `parseResumeText`. **Finish:** API claims `in_progress → finishing` then queues → 202 `{ jobId }` (already completed → 200 + report; 409s unchanged; queue fails → claim reverted); worker `completeFinish`: already completed → done (crash after save), not finishing → `UnrecoverableError`, saves report + clears stats cache, reverts to `in_progress` only on the **last** attempt. Jobs call `askAiJson` with `retries: 0` (BullMQ retries); in-request calls (start, answer) now use exponential backoff 1 s → 2 s + jitter. **`GET /api/jobs/:id`** (`modules/job`, UUID param, owner check → 404): `pending` / `completed` + result / `failed` + message. **`src/worker.js`:** own Redis connection (`maxRetriesPerRequest: null`), AI worker (concurrency `WORKER_CONCURRENCY`=10) + maintenance worker (1); per-job child logger (jobId, reqId, attempt) via `runWithRequestLogger`; only our own error messages reach the client (others → generic + `cause`); graceful shutdown (25 s, unfinished jobs are re-run as stalled). **Cleanup** every 60 s (`upsertJobScheduler`): `starting` > 10 min → `refundInterviewIfCharged` (ledger check → refund at most once) then delete; `finishing` > 15 min → `in_progress`. New index `{status, updatedAt}`. Env: `REDIS_URL` now **required**, `WORKER_CONCURRENCY`. Scripts `worker` / `dev:worker`. **Client:** `api/job.api.js` (`waitForJob`: poll every 2 s, give up after 3 min, errors shaped like axios errors); `uploadResume` / `finishInterview` poll internally and return the same shape as before → no component changes. README (3 processes), Postman (jobId saved automatically + 2 "Job status" requests). **Bugs found & fixed in testing:** worker logged ~10 "Worker error" lines/s while Redis was down → only logged while Redis is up. **Verified (real AI):** resume → 202 in 0.11 s, completed after ~6 s with correct skills; 2nd upload while running → 429; other user's job → 404; bad id → 400; lock released. Finish → 202 in 0.06 s, 2nd click 409, completed ~16 s, averages 6.2/6.4/6.6/6.8 = hand calc, overall 65, stats cache cleared (0 → 1), finish again → 200 same report. Wrong API key → retries at +2 s / +4 s → failed "AI is busy… click Finish again", interview back to in_progress, lock released. **`kill -9` worker mid-job → new worker re-ran the stalled job → completed** (~70 s). Cleanup: stuck start refunded once (ledger −50/+50, credit back to 500) + deleted, stuck finish → in_progress, fresh 2-min `starting` untouched. Redis stopped → upload 503 in 15 ms, API + worker stay up, jobs work again after restart. Headless Chrome (real UI): resume skills shown after 3.5 s; restored finished interview → "Preparing your report…" → /report page with 65, no console errors. Test data + Redis keys deleted. `npm run check` passes. Not committed. |
| 2026-10-05 | Claude | 22 | ✅ Redis. **Infra:** root `docker-compose.yml` → `interviewiq-redis` (redis:7-alpine) on **6380** (6379 = Pulse's Redis), volume + healthcheck. `npm i ioredis rate-limit-redis`. Env `REDIS_URL` (empty in dev → in-memory limits, no cache; **required in production**). **`config/redis.js`:** one client (maxRetriesPerRequest 1, connectTimeout 2s, reconnect backoff max 2s), `isRedisReady()`, "down" logged once / "reconnected" once, `connectRedis()` awaited in `server.js` like MongoDB (exit if unreachable at boot — rate-limit-redis loads its Lua scripts at startup and would stay broken), `quit()` on shutdown. **Rate limits:** each limiter gets its own `RedisStore` (`rl:global:` / `rl:auth:` / `rl:ai:`), `passOnStoreError` (fail open), commands fail instantly when Redis isn't ready, limiter errors only logged while Redis is up (no log flood). **Cache (`lib/cache.js`):** `cached(key, ttl, load)` cache-aside + `clearCache(...keys)`, both skip Redis when it's down; key names in one place (`cacheKeys`). current-user cached 60 s (`getCurrentUserCached`); stats cached 10 min. **Invalidation (after commit, not inside the transaction):** `chargeCredits`, `addCredits`, payment `fulfillOrder`, verify email, reset password, Google login fixing an unverified account → user key; interview completed → stats key. credit.service imports `lib/cache` directly to avoid a circular import with user.service. `/ready` reports `redis: ok/down/disabled` but does **not** fail on Redis (all servers share one Redis → 503 everywhere would take the whole app down). README run steps + env table updated. **Verified:** `/ready` ok; cache hit proven (credit changed directly in DB → API still showed cached 500), `addCredits` → key deleted → fresh 827; TTLs 60/600; 100 requests allowed then 429, counter key in Redis; **server restart → still 429**; Redis stopped mid-run → `/ready` 200 `redis: down`, requests pass (fail open), current-user from MongoDB in 68 ms, 1 log line for 20 requests; Redis started → "Redis reconnected", limits work again; boot with Redis down → FATAL + exit 1; `REDIS_URL` empty → `redis: disabled`, in-memory limits. **Not tested:** stats key cleared on a real finish (needs the AI) — code path only. Test user + Redis keys deleted. `npm run check` passes. Not committed. |
| 2026-10-05 | You + Claude | 19 | ✅ **Real Razorpay test payment.** Test keys in server/.env (webhook secret empty). First try failed: card 4111… counts as *international* (disabled on the account) → used an Indian test card. Order `order_TjvynjBjEwWBpf` (Pro, ₹249): Razorpay shows order paid + 1 captured payment (3 earlier failed attempts on the same order → no credit). DB: Payment row created → paid with paymentId + paidAt, exactly one `purchase` ledger row +1500, balance 450 → 1950. Ledger sum (1450) ≠ balance (1950) only because this account's 500 signup bonus (2026-08-31) predates the ledger (Step 18) — expected. Webhook still to set up after deploy. |
| 2026-10-04 | Claude | 21 | ✅ Logging & monitoring. **Server:** `npm i pino pino-http @sentry/node` + dev `pino-pretty`. `lib/logger.js` (pino, level from new env `LOG_LEVEL`, pretty in development / JSON otherwise, redacts cookie/authorization) + `AsyncLocalStorage` → `getLogger()` gives the request's logger (with reqId) anywhere in services. `middlewares/requestLogger.js` (pino-http, first in `app.js`): reqId = incoming `X-Request-Id` if short+clean else UUID, echoed in `X-Request-Id` header; one line per request (method, url, status, time, userId), 4xx warn / 5xx error, `/health` + `/ready` not logged. `errorHandler` sets `res.err` (5xx stack lands on the request line, no double log) and adds `requestId` to error responses. All `console.*` replaced (only `env.js` left, it runs before the logger exists). `GET /ready`: readyState check then `db.admin().ping()` → 200 / 503. Sentry: `src/instrument.js` loaded via `node --import` in start/dev scripts, env `SENTRY_DSN` optional (empty → off), `setupExpressErrorHandler` before our handler (only 5xx sent), no PII. **Client:** `npm i @sentry/react`; `config/sentry.js` dynamic-imports Sentry only when `VITE_SENTRY_DSN` is set (empty → removed from the build entirely; set → own chunk, main bundle +0.3 KB). **Bug found & fixed:** `/^…$/.test(undefined)` is true ("undefined" string) → every request without the header got id "undefined" → setHeader threw → 500 everywhere; added `typeof` check. **Verified:** `/ready` 200 and 503 (no DB); 401/400/404 carry `X-Request-Id` + `requestId`; bad incoming id replaced; service log after an `await` keeps reqId; 500 line has reqId + stack; fake local Sentry ingest received the 500 but not the 401; `npm run dev` boots; `npm run check` passes. **Not tested:** real Sentry dashboard (needs your DSNs). Not committed. |
| 2026-10-04 | You | 18–20 | ✅ Committed Stage 5 (`6920f01`). Session ended — next: Stage 6, Step 21 (logging & monitoring). |
| 2026-10-04 | Claude | 18–20 | ✅ Stage 5 Payments (you chose Razorpay, no keys yet → tested with self-made signatures). **Ledger (Step 18):** `modules/credit/` — `Transaction` {userId, type signup_bonus/interview/refund/purchase, amount ±, balanceAfter, interviewId?, paymentId?, note}; indexes {userId, createdAt}, unique paymentId (partial), one signup_bonus per user (partial unique). `credit.service`: `chargeCredits` ($gte/$inc + ledger row) and `addCredits` in `mongoose.connection.transaction()` (Atlas); `recordSignupBonus` on Google signup + register; `GET /api/credits/transactions` (paged). Interview start/refund now use it. **Razorpay (Step 19):** `npm i razorpay`; env RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET optional (empty → payments disabled, 503 PAYMENTS_DISABLED; placeholders appended to server/.env); `lib/payment/razorpay.js` (HMAC-SHA256 + timingSafeEqual); `modules/payment/`: plans in code (Starter 500/₹99, Pro 1500/₹249, Max 4000/₹599 — server sets price), `Payment` model (one row per order, status created/paid/failed), `GET /plans` (public), `POST /order`, `POST /verify` (signature of order_id|payment_id + owner check), `POST /webhook` (raw body before express.json, signature header, payment.captured/order.paid with amount check, payment.failed). Single `fulfillOrder` used by both: claim order `status ≠ paid → paid` + $inc credit + purchase row in one transaction → idempotent. **Client:** `/pricing` (plan cards, per-interview price, Razorpay checkout script lazy-loaded, verify → setCredit → /account; verify failure → "credits in a minute" because webhook covers it), `/account` (profile, balance + refresh, credit history with Load more, logout), Navbar "Account & credits" link, Buy-more popup closes. **Bug fixed:** logout on a private page went to /auth (React Router applies navigation in a transition, Redux null renders first) → new `logout` action + `loggedOut` flag, ProtectedRoute sends to home. **Verified (fake keys):** plans on/off; order 401/400/502 (fake keys)/503 (disabled); verify bad sig 400, other user 404, ok +1500, repeat → alreadyProcessed; webhook no/wrong sig 400, ok, duplicate → no credit, then verify → alreadyProcessed; **6 parallel verify+webhook → credited once**; amount mismatch ignored; failed → later captured → paid; AI-down start → ledger −50/+50, 402 → no row; register → one signup_bonus row (retry → none); balance 100+1500+500+4000+500 = 6600 ✓. Browser (Razorpay stubbed, order API intercepted, real verify): Navbar → Pricing → Buy Pro → credits 30→1530 in Navbar + Account row, mobile OK, logout → home, no console errors. Server boots with real .env (payments disabled). **Not tested:** real Razorpay popup / real webhook (needs your keys + public URL). Test data deleted. `npm run check` passes. Not committed. |
| 2026-10-04 | You | 16 | ✅ Committed (`b9fefd8`). |
| 2026-10-04 | Claude | 16 | ✅ Analytics → **MVP feature-complete**. **Backend:** `GET /api/interview/stats` (isAuth, before `/:id`): one aggregation — `$match` userId (manual `new ObjectId()` because aggregate() doesn't cast like find()) + completed → `$facet` {summary: count/avg/best + 4 skill avgs, byMode: count/avg/best per mode, trend: last 20 by completedAt}, `$round` to 1 decimal in DB; code reverses trend and adds latestScore + change vs previous. **Client:** `npm i recharts`; `components/history/Analytics.jsx` on top of /history (skeleton, hidden for 0 completed, silently hidden if API fails): 4 KPI tiles (latest with ↑/↓ + sign), trend card (lazy `ScoreTrendChart.jsx` → recharts in its own chunk; single-series area, 2px line, 10% wash, 8px dots with white ring, recessive grid, 0–100 axis, hover tooltip value-first, last value labelled, "View as table"; <2 points → "complete one more"), skill bars (one hue) + focus area (weakest skill), by-mode tiles. Accent #2a78d6 passed the dataviz palette validator. **Bug found:** dots inherited the area's fillOpacity 0.1 → almost invisible → `fillOpacity: 1` on dot/activeDot. **Verified:** API with known data (40/60/80 → avg 60, skills 6/5/6.5/4, tech avg 50, change +20; other user + in-progress excluded; new user → zeros/empty; no login 401); browser 12 interviews: avg 70.4, +28, tech 66 match hand calc, 12 dots, tooltip on dot 3 = Role 3 · 80 · HR, mobile no overflow, new user → analytics hidden, no console errors. Not browser-tested: the 1-interview "complete one more" state. Test data deleted. `npm run check` passes. Not committed. |
| 2026-10-04 | You | 15, 17 | ✅ Committed (`c75f76e`). |
| 2026-10-04 | Claude | 15, 17 | ✅ History page + PDF (Step 16 analytics not done yet). **Backend:** `historyQuerySchema` gets optional `mode` (enum → 400 otherwise), `getHistory` filters by it. **Client:** `pages/History.jsx` + protected lazy `/history` route: 9 cards per page (role, mode, experience, date, colour score or status badge), All/Technical/HR/Confidence tabs, Load more (appends next page), Continue on an in-progress card (saves it as the active interview → /interview resumes it), skeleton, empty state, error + Try again. `MODE_LABEL` moved to constants. `npm i jspdf jspdf-autotable`; `utils/reportPdf.js` (dynamic import → separate chunks, nothing extra on page load): header with role (cut to 1 line) + coloured score, skill table, strengths/weaknesses/improvements, one table per question, page numbers, local-date filename; AI text cleaned to Latin-1 (‑ ’ “ … → - ' " ...) because jsPDF fonts can't draw them. Report gets Download PDF + View history buttons. **Verified:** API all/hr/technical page 2/bad mode; headless Chrome: 12 interviews (starting hidden), 9 cards → Load more → 12, HR tab → 5 all HR, report → PDF downloaded (2 pages, clean text, checked with pdftotext + rendered image), View history works, Continue → "question 1 of 5" resume screen, mobile no overflow, empty user → empty state, no console errors. Test data deleted. `npm run check` passes. Not committed. |
| 2026-10-04 | You | 10–14 | ✅ Committed Steps 10–14 (`584e6d4`). |
| 2026-10-04 | Claude | 10–14 | ✅ Stage 3 interview frontend (user asked to do it all in one go, no backend change needed). **API/state:** `api/interview.api.js` (6 endpoints), `redux/interviewSlice.js` (setup → in_progress; `interviewRestored` from GET /:id = first unscored question; `resumed` gate), `userSlice.setCredit`, `utils/activeInterview.js` (sessionStorage id → refresh resumes, credits not wasted), `constants/interview.js`. **Setup (Step1setup):** role + datalist, experience enum, mode cards with cost, PDF drop zone (type/5 MB check → chips), avatar videos (`#t=0.5` preview), Start keeps the same `requestId` on network failure / INTERVIEW_STARTING and makes a new one after a server answer; low-credit banner. **Live (Step2interview + interview/QuestionRound keyed by index):** hooks `useSpeechSynthesis` (voice by avatar, safety timeout), `useSpeechRecognition` (en-IN, continuous, interim, auto-restart, fatal errors → type; `stop()` waits for last chunk), `useCountdown` (Date.now based, auto-submit at 0). Avatar video plays while speaking; Repeat/Skip/Submit; ALREADY_ANSWERED → reads saved score; 503 → keep text + retry; beforeunload warning; finish auto-retries on 409 evaluating/finishing, else Try again button; StrictMode-safe (one finish request per attempt). **Report:** `/report/:id` (state passed from finish, else GET; skeleton; not found / not finished states), `Step3report` (animated ring, 4 bars, strengths/weaknesses/improvements, per-question accordion). Toaster in App.jsx, Navbar mobile padding/truncate. `npm i react-hot-toast`. **Verified in headless Chrome (test servers 8100/5174):** setup → Start (credits 100→50 in Navbar) → Q1–Q5 typed (Q3 skipped) → reload mid-interview → "Welcome back, question 3 of 5" → Continue → finish → /report/:id, sessionStorage cleared, report survives reload, unknown id → not found, no console errors, no horizontal overflow at 390 px. AI gave 0 because my scripted answers didn't match its new questions (correct anti-off-topic behaviour). **Not tested:** real microphone / real voices (headless has none), 503 retry UI, low-credit banner in browser. Test data deleted. `npm run check` passes. Not committed. |
| 2026-10-04 | You | 8, 9 | ✅ Committed Steps 8 + 9 (`062562d`, `3d31f3b`). |
| 2026-10-04 | Claude | 9 | ✅ Step 9: new status `finishing`. `POST /:id/finish` (isAuth → aiLimiter → validate params): atomic claim `in_progress → finishing` only if no answer is claimed-but-unscored (`$not $elemMatch {answer string, scores missing}`); failed claim → 404 / completed → same report (200) / 409 `INTERVIEW_FINISHING` / 409 `ANSWER_BEING_EVALUATED` / 409 `INTERVIEW_NOT_ACTIVE`. `calculateScores`: per-criterion averages (unanswered = 0, 1 decimal) + weighted overall ×10 with mode weights. Zero answers → fixed text, no AI; else `askAiJson(reportPrompt)`. Any fail → back to `in_progress` (503). `GET /:id` owner-only (hides userId/requestId). `GET /history?page&limit` (limit ≤50): excludes `starting`, `.lean()`, light projection, sort createdAt desc, `Promise.all` with count. Route `/history` before `/:id`. `docs/api.postman.json` (login → resume → start (saves interviewId) → 5 answers → finish → get → history). Verified: 401/400; other user 404 (finish + get); `starting` → 409; pending answer → 409; zero answers → fixed report; finish again → same report; AI down → 503 + back to in_progress; full flow overall 43 = hand calc (4.4/4.0/4.4/4.4, technical weights); 2 parallel finish → 200 + 409; answer after complete → 409; history order/paging/no questions/limit=100, page=0, page=abc → 400; other user empty list. aiLimiter 429 seen during testing (expected). Test data deleted. `npm run check` passes. Not committed. |
| 2026-10-04 | Claude | 8 | ✅ Step 8: `POST /api/interview/:id/answer` (isAuth → aiLimiter → validate params+body). Schemas: `interviewIdParamsSchema` (24-hex id), `submitAnswerSchema` (index 0–4, answer ≤5000 chars, empty allowed, timeTakenSec ≥0). Service `submitAnswer`: 1) atomic claim `findOneAndUpdate({_id,userId,status:in_progress, q.i exists, q.i.answer not a string})` 2) empty answer → all 0, no AI; else `askAiJson(evaluationPrompt)`; AI fail → undo claim + 503 3) save scores/feedback/timeTaken (capped at limit). Failed claim → `explainAnswerConflict` gives 404 / 409 `INTERVIEW_NOT_ACTIVE` / 409 `ALREADY_ANSWERED`. **Bug found in testing:** filter `"questions.3.answer": null` always matched (MongoDB reads `3` as index AND as a field name on each element → missing = null) → switched to `$not: {$type: "string"}`. Verified: 401, bad id/index/type/too long → 400; other user + random id → 404; completed → 409; empty → 0s; resubmit → 409; 2 parallel same question → one 200 + one 409; bad API key → 503 and answer reset, retry → 200; timeTakenSec 9999 → 60. Test users deleted. `npm run check` passes. Not committed. |
| 2026-10-04 | You | 6, 7 | ✅ Committed Steps 6 + 7 (`31936b4`, `3a133a5`). |
| 2026-10-03 | Claude | 7 | ✅ Step 7: `POST /api/interview/start` (isAuth → aiLimiter → validate). New `interview.schema.js` (role, experience enum, mode enum, optional resume, `requestId` UUID). Model: `requestId` + unique index `{userId, requestId}`, new status `starting` (default). Service order: 1) create interview (reserve; E11000 → duplicate: `starting` → 409 `INTERVIEW_STARTING`, done → same interview, no charge) 2) atomic `$gte`/`$inc` credit (none → delete reserve, 402 `NOT_ENOUGH_CREDITS`) 3) `askAiJson` questions, difficulty/time from `QUESTION_PLAN` 4) save `in_progress` → 201. Any fail after charge → refund + delete reserve (503 `AI_UNAVAILABLE`). Verified on test servers: 401/400s; double click same requestId → 201 + 409, credit 100→50, 1 interview; replay → same id; 0 credits → 402; 50 credits + 2 parallel different ids → one 201, one 402; bad API key → 503 + full refund, then retry same requestId → 201. Test users deleted. `npm run check` passes. Not committed. |
| 2026-10-01 | Claude | 6 | ✅ Step 6: `npm i pdf-parse` (v2), `interview.service.js` (`parseResume`: text from first 5 pages, <50 chars → 400 `RESUME_NO_TEXT`, unreadable → 400 `INVALID_PDF`, trim 12k, `askAiJson` → AI fail = 503 `AI_UNAVAILABLE`), controller (no file → 400 `RESUME_MISSING`), `interview.routes.js` (isAuth → aiLimiter → upload.single), mounted `/api/interview`. Verified with a fake test resume: no login 401, no file / .docx / 6 MB / broken PDF / docx renamed as PDF / wrong field → 400; real PDF → 200 with correct skills + 2 projects (~20 s on free model; once got 3× OpenRouter 504 → clean 503). `npm run check` passes. Not committed. |
| 2026-09-30 | Claude | 5 | ✅ Step 5: `interview.modes.js` (MODES with focus, rubric, weights; plan; time limits; experience levels), `interview.model.js`, `interview.prompts.js` (4 prompts, data-in-tags anti-injection), `interview.ai-schemas.js`, `askAiJson` + fallback models (env `OPENROUTER_FALLBACK_MODELS`). Live review on free model: resume parse ignored injected line; questions used candidate's projects; good/weak/cheat answers scored 8/2/0; report specific; model validates. `npm run check` passes. Not committed. |
| 2026-09-30 | You | 3, 4 | ✅ Committed Step 3 (`183fa00`) and Step 4 (`d2f2c78`, incl. Prettier format). **Stage 1 complete.** |
| 2026-09-30 | Claude | 4 | Root Prettier + scripts, server ESLint (3 fixes), WebP images (−88%), README. Verified: lint clean both apps, client build, all 8 WebP load in Chrome, Prettier dry run on a copy keeps lint/build/server working. Format run left to user so Step 3 commit stays readable. |
| 2026-09-30 | Claude | 3 | ✅ Step 3: `api/axios.js` (instance + 401 interceptor, ignores `/api/auth/*` and current-user), `auth.api.js`, `user.api.js`, `utils/getErrorMessage.js`; `userSlice.loading` + `finishLoading`; `ProtectedRoute` + `PageLoader`; lazy pages + lazy login popup; Navbar placeholders while loading; login returns to `from` page. Headless Chrome: redirect when logged out, back to /interview after login, survives refresh, no "0 credits" flash, logout works, no console errors. Interceptor's session-expired path not exercised yet (no protected API besides current-user). Not committed. |
| 2026-09-30 | You | 2b | ✅ Step 2b committed (`a7d62e8`, `742ea00`). |
| 2026-09-30 | Claude | 2b | Forgot password: model `passwordResetToken/Expires`, schemas, `requestPasswordReset` (background send → no slow-response leak) + `resetPassword`, 2 routes, `passwordResetEmail`, Auth.jsx "forgot" screen, `ResetPassword.jsx` + route. Verified 13 scenarios (unknown/known email same reply, bad/expired/reused link, short password, old pw rejected, Google-only user adds a password, unverified → verified). Found Gmail SMTP already configured; test sent 2 mails to @example.com (may bounce). Test users deleted. |
| 2026-09-30 | Claude | 2b | Task 5 (frontend): `Auth.jsx` rebuilt (Login/Sign up tabs, show-password, inline errors, loading, resend on EMAIL_NOT_VERIFIED, check-inbox screen, Google kept), new `VerifyEmail.jsx` + `/verify-email` route, App.jsx 401 race fix. Lint + build pass. Not yet clicked through in a browser. |
| 2026-09-30 | Claude | 2b | Tasks 2–4 (backend): `lib/mail/mailer.js` (SMTP or terminal fallback; SMTP required in production via env.js), `auth.emails.js`, schemas, service (register/verify/login/resend, sha256 link tokens, 24h expiry, dummy-hash timing guard, Google login wipes unverified password), `AppError` gets `code`, routes + `authLimiter` 10/15min. Verified 15 scenarios incl. takeover attempt and timing (316 vs 312 ms); test users deleted. |
| 2026-09-30 | Claude | 2b | Task 1: installed `bcryptjs`, `nodemailer`; User model gets `password` (select:false), `isVerified`, `verificationToken(+Expires)`, lowercase/trim email. DB has 3 existing Google users without `isVerified` (handled in Task 3). |
| 2026-09-30 | Claude | 2 | ✅ Step 2 done. Task 4: `app.js` wired — trust proxy (prod only) → helmet → cors → compression → /health → globalLimiter → json → cookies → routes. Verified: helmet headers + no `X-Powered-By`, gzip on >1 kB, bad body → 400, request 101 → 429 with CORS header, /health still 200 while limited. |
| 2026-09-30 | Claude | 2 | Task 3: `middlewares/rateLimit.js` (`globalLimiter` 100/min per IP, `aiLimiter` 10/min per user, our `{success,message}` shape, `RateLimit` headers). Verified on a throwaway app: request 101 → 429; user A's 11th AI call → 429 while user B on the same IP → 200. Not wired into app.js yet. |
| 2026-09-30 | Claude | 2 | Task 2: `middlewares/validate.js` + `modules/auth/auth.schema.js`; `POST /api/auth/google` validated. Verified: `{}`, no body, number, empty string → 400 with clear message; broken JSON → 400; extra fields stripped. |
| 2026-09-30 | Claude | 2 | Task 1: `config/env.js` (zod) — server exits with a list of bad vars; switched app.js, cookie, db, token, isAuth, firebaseAdmin, openRouter, server.js to `env.X`. Verified all endpoints + JWT sign/verify. |
| 2026-09-30 | Claude | 0 | Health check: server syntax/boot/Mongo/endpoints OK, client build OK. Fixed 4 lint errors (unused props in Step1/2/3 stubs → TODOs). Added missing env vars to `server/.env` and `client/.env`. Added `CLAUDE.md` with working rules (explain first, wait for go). Installed `helmet compression express-rate-limit zod` for Step 2. |
| 2026-09-29 | Claude | 1 | Server moved to `server/src/` (app.js, server.js with graceful shutdown, `modules/auth`, `modules/user` with controller/service/routes, `AppError`, `sendSuccess`, `notFound` + `errorHandler`). All responses are now `{ success, message, data }`; client updated to read `result.data.data.user`. Verified: health, current-user (valid, missing cookie), Google token checks, logout, 404, bad JSON → 400, SIGTERM shutdown. |
| 2026-09-29 | Claude | 0 | Merged the step plan into this PRD as a tracker (§0, §10) |
| 2026-09-29 | Claude | 0 | Wrote the PRD and 26-step execution plan |
| 2026-09-29 | Claude | 0 | Full code review: fixed the auth takeover (Firebase ID token verified on the server), the `openRouter.service.js` syntax error, broken Interviewpage imports, missing `/interview` route, isAuth 500→401, DB-before-listen, port 8000, circular import, multer, cookies/CORS from env, Home/Navbar UI typos, lint errors. Added `.env.example` files. |

### 0.5 Blockers & decisions
| Date | Type | Item | Status / Decision |
|------|------|------|-------------------|
| 2026-10-07 | Bug | Live interview voice: (1) speaking does not appear as text (speech-to-text, `hooks/useSpeechRecognition.js`), (2) AI voice sounds weird (`hooks/useSpeechSynthesis.js`). Suspects: voice picker grabs robotic eSpeak voices on Linux; speech-to-text only works in Google Chrome / Edge and fails silently. Real-mic test was never done before | ✅ Fixed 2026-10-08 — cause was the browser (Firefox/Brave). Works in Chrome; voice picker + Brave detection improved (`3f60f12`) |
| 2026-10-08 | Decision | AI provider: **Groq** (`openai/gpt-oss-120b`) — ~1–1.5 s replies vs slow/flaky free OpenRouter models. Free tier has per-minute/day limits (429 → our retries); OpenRouter still works with `AI_PROVIDER=openrouter` | ✅ Decided |
| 2026-10-08 | Action | Groq API key was pasted in chat → create a new key on console.groq.com, delete the old one, update `server/.env` + Render | ⬜ Owner: you |
| 2026-10-08 | Known gap | `Step2interview.jsx` auto-retries Finish every 3 s on `INTERVIEW_FINISHING` / `ANSWER_BEING_EVALUATED` with no limit — if the worker is down the spinner never stops. Add a ~3 min cap + Try again button | ⬜ Later |
| 2026-10-07 | Decision | Hosting: Render **free** web service with the BullMQ workers inside the API process (`RUN_WORKER_IN_API=true`) — Render Background Workers are paid (~$7/mo). Trade-off: sleeps after 15 min idle (~50 s cold start). Move to a separate worker when there are real users | ✅ Decided |
| 2026-10-07 | Decision | Cookies: `vercel.app` and `onrender.com` are different sites → Safari blocks the cookie as third-party. Fix: Vercel proxies `/api/*` to Render (cookie becomes first-party). Redis = Render Key Value (free) instead of Upstash, because BullMQ's constant polling eats Upstash's free command quota | ✅ Decided |
| 2026-10-07 | Known gap | With `TRUST_PROXY_HOPS=2`, someone calling `onrender.com` directly (skipping Vercel) can fake `X-Forwarded-For` and dodge the IP rate limit. Login/credits are not affected. Verify after deploy that Render logs show your real IP; a custom domain or a secret proxy header fixes it later | ⏭️ Accepted for now |
| 2026-09-29 | Action | Add the new env vars (`CLIENT_URL`, `FIREBASE_PROJECT_ID`, `OPENROUTER_MODEL`, `NODE_ENV`, `VITE_SERVER_URL`) | ✅ Done 2026-09-30 |
| 2026-09-29 | Action | Rotate `JWT_SECRET` and API keys if `.env` was ever pushed to GitHub | ⬜ Owner: you |
| 2026-09-29 | Action | Run `npm audit` in client and server | ⬜ |
| 2026-09-29 | Decision | Speech-to-text and text-to-speech run in the browser (Web Speech API) to keep server load and cost near zero | ✅ Decided |
| 2026-09-29 | Decision | Resume PDFs are parsed in memory; only the text is stored | ✅ Decided |
| 2026-09-29 | Decision | No `asyncHandler` wrapper: Express 5 forwards rejected promises to the error middleware, so controllers just `throw new AppError(...)` | ✅ Decided |
| 2026-09-29 | Action | Commit the foundation + Step 1 work | ✅ Done 2026-09-30 |
| 2026-09-30 | Decision | Email/password login uses our own bcrypt + MongoDB (not Firebase email auth), with email verification required | ✅ Decided (learning bcrypt) |
| 2026-09-30 | Action | Create a Gmail App Password and add `SMTP_*` vars to `server/.env` | ✅ Done — Gmail accepted test mails |
| 2026-09-30 | Known gap | Password reset does not log out other devices (JWT is stateless, 7-day cookie stays valid). Fix later with a `tokenVersion` on the user checked in `isAuth` | ⏭️ Later (Stage 6) |
| 2026-10-04 | Decision | Payment gateway: **Razorpay** (India: UPI/cards/netbanking, ₹ plans) | ✅ Decided |
| 2026-10-04 | Action | Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (Test Mode) and create a webhook (`/api/payment/webhook`, events payment.captured + payment.failed, secret → `RAZORPAY_WEBHOOK_SECRET`). Webhooks need a public URL → test with ngrok / after deploy | ⬜ Owner: you |
| 2026-10-04 | Known gap | Users created before Step 18 have no ledger rows for their old credits (balance is right, history starts now) | ⏭️ Accepted |
| 2026-09-30 | Decision | AI: free models for now — `nvidia/nemotron-3-super-120b-a12b:free` + fallbacks `google/gemma-4-31b-it:free`, `google/gemma-4-26b-a4b-it:free` (OpenRouter account is free tier). Switch `OPENROUTER_MODEL` to a paid model before real users. | ⏭️ Replaced by Groq (2026-10-08) |
| 2026-09-30 | Decision | Interview: 50 credits (all modes), 5 questions (easy, easy, medium, medium, hard), time limits 60/90/120 s, resume optional, follow-up questions later (Stage 7) | ✅ Decided |
| 2026-10-03 | Decision | Double-click on Start: server idempotency key (`requestId` UUID per attempt + unique index, reserve → charge → AI → refund on fail). Frontend disabled button in Step 11. "One active interview per user" later (Stage 7) | ✅ Decided |
| 2026-10-03 | Known gap | If the server crashes mid-start (after charging, before refund), the interview stays `starting` and credits are lost. Fix later: cleanup job refunds `starting` interviews older than ~5 min (Stage 6, with the queue) | ✅ Fixed in Step 23 (cleanup job, 10 min, refund only if charged and not yet refunded) |
| 2026-10-04 | Known gap | Same as start: crash during finish leaves the interview stuck in `finishing`. Same cleanup job (Stage 6) should reset `finishing` older than ~5 min back to `in_progress` | ✅ Fixed in Step 23 (finish is now a job — a crashed worker's job is re-run automatically; cleanup resets `finishing` after 15 min as a safety net) |
| 2026-09-30 | Action | Fix `MAIL_FROM` in `server/.env` to `InterviewIQ <you@gmail.com>` format | ⬜ Owner: you |

---

## 1. Product Overview

**What it is:** A web platform where a candidate signs in, uploads a resume (PDF), picks a role / experience level / interview mode, and is interviewed **live by an AI interviewer** (avatar video + voice). Every answer is evaluated, and at the end the user gets a scored report (downloadable as PDF) and can track progress over time. Interviews cost **credits**.

**Target users:** Students and job seekers preparing for HR and technical interviews.

**Core value:** Realistic, resume-aware, timed mock interviews with instant, structured feedback.

---

## 2. Feature List (derived from the frontend) & Current Status

| # | Feature | Where it's promised | Status |
|---|---------|---------------------|--------|
| F1 | Google Sign-In (Firebase popup → server JWT cookie) | Auth page / Auth modal | ✅ Done (fixed & secured, see §4) |
| F2 | Session restore (`/api/user/current-user`) | `App.jsx` | ✅ Done |
| F3 | Logout | Navbar | ✅ Done |
| F4 | Credits wallet (500 free on signup, shown in Navbar) | Navbar, Home "Credit Based" | 🟡 Balance shown; **no deduction, no purchase** |
| F5 | Landing page (hero, 3 steps, capabilities, modes) | `Home.jsx` | ✅ Done |
| F6 | **Step 1 – Setup:** role, experience, mode, resume upload | `Step1setup.jsx` | ❌ Empty stub |
| F7 | **Resume-based questions** (projects/skills from PDF) | Home "Resume Based Interview" | ❌ Not started (multer ready, no parser) |
| F8 | **Step 2 – Live interview:** AI avatar video (`male-ai.mp4`, `female-ai.mp4`), voice question (TTS), voice answer (STT), timer per question | `Step2interview.jsx`, Home "Voice Recognition", "Timer Based" | ❌ Empty stub |
| F9 | Dynamic follow-up questions based on previous answers | Home Step 2 | ❌ Not started |
| F10 | **AI answer evaluation** — communication, content, technical accuracy, confidence | Home "AI Answer Evaluation" | ❌ Not started (`askAi` service now implemented) |
| F11 | Interview modes: HR, Technical, Confidence | Home "Multiple Interview Modes" | ❌ Not started |
| F12 | **Step 3 – Report:** scores, strengths, weaknesses, improvements | `Step3report.jsx`, `Interviewreport.jsx` | ❌ Empty stub |
| F13 | Downloadable PDF report | Home | ❌ Not started |
| F14 | Interview history + analytics (progress over time) | `/history` link in Home & Navbar | ❌ Page/route doesn't exist |
| F15 | Pricing / buy credits (payment gateway) | `/pricing` link in Navbar | ✅ Razorpay (Step 19) |

**Where you are right now:** see the **§0 Project Tracker**. Foundation (auth, landing UI, AI service) is done, and the next milestone is the end-to-end interview loop (F6 → F8 → F10 → F12).

---

## 3. Tech Stack (current)

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 8, Tailwind v4, Redux Toolkit, React Router 7, `motion`, react-icons, Firebase Auth (client) |
| Backend | Node 22, Express 5 (ESM), Mongoose 9, JWT (httpOnly cookie), multer, axios, firebase-admin |
| AI | OpenRouter (`services/openRouter.service.js`, model configurable via `OPENROUTER_MODEL`) |
| DB | MongoDB |

```
Ai_interview_Agent/
├── client/src/
│   ├── config/server.js        # serverUrl (VITE_SERVER_URL)
│   ├── pages/                  # Home, Auth, Interviewpage, Interviewreport
│   ├── components/             # Navbar, Footer, Authmodel, Step1/2/3
│   ├── redux/                  # store.js, userSlice.js
│   └── utils/firebase.js
└── server/src/
    ├── app.js                  # express app: CORS, routes, /health, 404 + error handler
    ├── server.js               # DB connect, listen, graceful shutdown
    ├── config/                 # db, token, cookie, firebaseAdmin
    ├── middlewares/            # isAuth, upload (multer), errorHandler
    ├── utils/                  # AppError, response (sendSuccess)
    ├── lib/ai/openRouter.js    # askAi()
    └── modules/
        ├── auth/               # auth.routes / controller / service
        └── user/               # user.routes / controller / service / model
```

---

## 4. Code Review — Errors Found & Fixed (this review)

### 🔴 Critical
| Issue | Fix |
|-------|-----|
| **Account takeover:** `/api/auth/google` trusted `name`/`email` from the request body. Anyone could `curl` any email and get a valid session for that user. | Client now sends Firebase **ID token**; server verifies it with `firebase-admin` (`config/firebaseAdmin.js`) and reads email from the verified token (also requires `email_verified`). |
| `services/openRouter.service.js` had a **syntax error** (unclosed braces) — server would crash as soon as it's imported. | Implemented `askAi(messages, { json })` with timeout, JSON mode, error propagation. |

### 🟠 Bugs
| Issue | Fix |
|-------|-----|
| `Interviewpage.jsx` imported `./Step1setup` etc. from `pages/` — files live in `components/` (would fail when route added). | Fixed import paths. |
| `/interview` route missing — "Get Started" led to a blank page. | Added `/interview` and `/report/:id` routes. |
| `isAuth` returned **500** for expired/invalid JWT. | Now returns **401**. |
| `genToken` swallowed errors → cookie could be set to `undefined`. | Throws; made synchronous. |
| DB connected *after* `listen`, and failure was only logged → server ran without DB. | Connect first, `process.exit(1)` on failure. |
| Default server port `6000` is blocked by browsers (unsafe port) and didn't match client (`8000`). | Default `8000`. |
| Circular import: `Navbar`/`Auth` imported `serverUrl` from `App.jsx` (breaks Vite fast-refresh). | Moved to `client/src/config/server.js`, env-driven. |
| `Auth.jsx` logged the full Firebase response (tokens) to console; standalone `/auth` page never redirected after login. | Removed log; redirects to `/` when not in modal. |
| Navbar `userData?.name.slice` crashes if name missing; "Interview History" button did nothing. | Optional chaining; button navigates to `/history`. |
| multer wrote to a non-existent `public/` dir, accepted any file type. | `memoryStorage` + PDF-only filter + central error handler (400 on bad upload). |
| Token was returned in JSON body (defeats httpOnly cookie). | Removed from body; password stripped from user. |
| Cookie `secure:false` / CORS origin hard-coded. | `config/cookie.js` (secure + `sameSite:none` in production), CORS from `CLIENT_URL`. |

### 🟡 Cleanup
- Tailwind typos in `Home.jsx`: `bg-white-border`, stray `f`, `tracking-order`, `hover shadow-2xl`; hero badge text was outside its pill. Fixed.
- Conflicting classes in Navbar (`shadow-lg … shadow-sm`, `rounded … rounded-xl`). Fixed.
- `redux/sotre.js` → `redux/store.js`. Removed unused `React` imports (11 ESLint errors). `useEffect` deps fixed.
- `nodemon` moved to devDependencies. Added `.env.example` for client and server.
- Remaining lint: 4 "unused prop" errors in the empty Step1/2/3 stubs — disappear once implemented.

### ⚠️ Action required by you
1. **Rotate secrets if this code was ever pushed with `.env`** (`.gitignore` covers it, but verify on GitHub). Use a long random `JWT_SECRET`.
2. Add new env vars from `server/.env.example` (`CLIENT_URL`, `FIREBASE_PROJECT_ID`, `OPENROUTER_MODEL`, `NODE_ENV`) and `VITE_SERVER_URL` in client.
3. Run `npm audit` in `server/` and `client/`.

---

## 5. Data Model (target)

```js
User {                       // exists
  name, email (unique), password?, credit (default 500),
  plan?: "free" | "pro",     // future
  timestamps
}

Interview {                  // NEW — Phase 1
  userId: ObjectId (index),
  role: String, experience: String,          // "Frontend Developer", "0-1 yrs"
  mode: "hr" | "technical" | "confidence",
  resumeText: String,                        // parsed from PDF (don't store the file)
  status: "in_progress" | "completed" | "abandoned",
  questions: [{
    question, difficulty: "easy"|"medium"|"hard", timeLimitSec,
    answer, answeredInSec,
    scores: { communication, content, technical, confidence },  // 0-10
    feedback
  }],
  report: { overallScore, strengths[], weaknesses[], improvements[] },
  creditsUsed: Number,
  timestamps
}
// indexes: { userId: 1, createdAt: -1 }, { status: 1 }

Transaction {                // Phase 3 — credits ledger
  userId, type: "signup_bonus"|"interview"|"purchase"|"refund",
  amount (+/-), balanceAfter, paymentId?, timestamps
}
```

---

## 6. API Spec (target)

| Method | Route | Auth | Purpose | Status |
|--------|-------|------|---------|--------|
| POST | `/api/auth/google` | – | `{ idToken }` → set cookie | ✅ |
| POST | `/api/auth/logout` | – | clear cookie | ✅ |
| GET | `/api/user/current-user` | ✅ | current user | ✅ |
| GET | `/health` | – | liveness probe | ✅ |
| POST | `/api/interview/resume` | ✅ | multipart PDF → `{ resumeText, skills, projects }` | ❌ |
| POST | `/api/interview/start` | ✅ | `{ role, experience, mode, resumeText }` → deduct credits, generate questions, return `{ interviewId, questions }` | ❌ |
| POST | `/api/interview/:id/answer` | ✅ | `{ questionIndex, answer, timeTaken }` → score + feedback (+ optional follow-up) | ❌ |
| POST | `/api/interview/:id/finish` | ✅ | build final report | ❌ |
| GET | `/api/interview/history` | ✅ | paginated list (`?page=&limit=`) | ❌ |
| GET | `/api/interview/:id` | ✅ | full report (owner only) | ❌ |
| GET | `/api/payment/plans` · POST `/api/payment/order` · POST `/api/payment/verify` | ✅ | buy credits (Razorpay/Stripe) | ❌ |

---

## 7. Interview Flow (Phase 1 design)

```
Step1setup ──► POST /resume (optional) ──► POST /start
   │                                         │ atomic credit deduction:
   │                                         │ User.findOneAndUpdate({_id, credit:{$gte:COST}}, {$inc:{credit:-COST}})
   │                                         │ askAi(system prompt: role+exp+mode+resume) → 5 questions JSON
   ▼                                         ▼
Step2interview: for each question
   - play AI avatar video (male/female-ai.mp4) + speak question (browser speechSynthesis)
   - listen with browser SpeechRecognition (Web Speech API) → live transcript, editable
   - countdown timer (timeLimitSec by difficulty), auto-submit at 0
   - POST /:id/answer → scores + feedback
   ▼
POST /:id/finish → report  ──► Step3report (charts + "Download PDF") ──► saved in history
```

**Why speech in the browser:** STT/TTS on the client costs nothing and adds zero server load, which is key for the scale target. Upgrade path: Whisper / Deepgram streaming for browsers without `SpeechRecognition` (Firefox).

**AI prompt rules:** always request strict JSON (`askAi(messages, { json: true })`), validate shape with `zod`, retry once on invalid JSON, refund credits if generation fails.

---

## 8. Non-Functional Requirements — Scaling to 1,000 req/s

### 8.1 Honest capacity math
- **Plain API requests** (auth, history, reports) at 1,000 req/s: easy. One Node process handles roughly 2–5k simple req/s. With 4–8 instances behind a load balancer there's plenty of headroom.
- **LLM calls are the real bottleneck.** Each takes 2–15 s and costs money. 1,000 LLM calls per second is about 60k per minute. No provider rate limit or budget allows that, and you don't need it. **1,000 req/s of total traffic means roughly 10–50 concurrent LLM calls**, because users spend most of their time speaking and not calling the API.
- Design goal: **stateless API + async/queued AI work + caching + rate limits.**

### 8.2 Target architecture
```
            ┌──────────── CDN (Vercel/Cloudflare) ── React static build
Browser ────┤
            └── Load Balancer (Nginx / ALB / Render / Railway)
                    │
          ┌─────────┼─────────┐
       API #1    API #2 ...  API #N     (stateless Express, PM2 cluster / containers)
          │         │          │
          ├── Redis ──────────────── rate-limit store, cache, BullMQ queues, sessions blacklist
          ├── MongoDB Atlas (replica set, indexes, pool 50/instance)
          └── BullMQ workers ─────── resume parsing, report generation, PDF, emails
                    │
                 OpenRouter (with retries, timeouts, fallback model)
```

### 8.3 Checklist
| Area | What to do | Phase |
|------|-----------|-------|
| Stateless | JWT cookie (done), no local disk (done: multer memory), no in-memory sessions | ✅ |
| Process | `pm2 start index.js -i max` or Docker replicas; graceful shutdown on SIGTERM | 2 |
| Security headers / compression | `helmet`, `compression` | 1 |
| Rate limiting | `express-rate-limit` + `rate-limit-redis`: global 100 req/min/IP; AI endpoints 10/min/user | 1–2 |
| Input validation | `zod` schemas on every body | 1 |
| DB | Indexes (§5), `.lean()` on reads, projection, pagination, `maxPoolSize` (done) | 1 |
| Atomic credits | `findOneAndUpdate` with `$gte` guard + ledger; refund on AI failure | 1 |
| Queue | BullMQ for resume parsing (CPU) and final report; client polls or uses SSE | 2 |
| AI resilience | timeout (done, 60s), retry with backoff, fallback model, per-user concurrency = 1, streaming for question text | 2 |
| Cache | Redis: `current-user` (60 s), history pages, role question banks | 2 |
| Observability | `pino` logs, request IDs, Sentry, `/health` (done) + `/ready` (DB ping), Prometheus metrics | 2 |
| Load test | `autocannon` / `k6`: 1,000 rps on `/health`, `/current-user`, `/history`; p95 < 200 ms | 2 |
| Frontend | Code-split routes (`React.lazy`), bundle is 540 kB now; compress the PNGs (≈150–250 kB each) and MP4s, serve from CDN | 1 |

---

## 9. Extensibility — how to add features easily

Adopt a **feature-module** structure on the server so each new feature is one folder and one line in `index.js`:

```
server/src/
├── app.js                 # express app (no listen) → testable with supertest
├── server.js              # connect DB, listen, graceful shutdown
├── config/                # env (validated with zod), db, redis, firebase
├── middlewares/           # isAuth, validate(schema), rateLimit, errorHandler, upload
├── lib/                   # ai/ (askAi, prompts/), pdf/, logger
└── modules/
    ├── auth/        { auth.routes.js, auth.controller.js, auth.service.js, auth.schema.js }
    ├── user/
    ├── interview/   { routes, controller, service, model, schema, prompts.js }
    ├── payment/
    └── report/
```

Rules:
1. **Controller** handles only HTTP (req/res). **Service** holds business logic (callable from routes, workers, and tests). **Model** is the DB layer.
2. Throw `AppError(status, message)`. One error middleware formats all responses as `{ success, message, data }`.
3. Every route gets a `zod` schema through `validate()`.
4. Prompts live in `modules/*/prompts.js`, versioned, and never inline in controllers.
5. Interview modes are a **strategy map**, so adding a mode is config and not code:
   ```js
   export const MODES = {
     hr:         { cost: 50,  questions: 5, systemPrompt: HR_PROMPT,   rubric: [...] },
     technical:  { cost: 100, questions: 6, systemPrompt: TECH_PROMPT, rubric: [...] },
     confidence: { cost: 50,  questions: 5, systemPrompt: CONF_PROMPT, rubric: [...] },
   };
   ```
6. Client: one `api/` layer (axios instance with `baseURL` + `withCredentials` + 401 interceptor → logout). Use one Redux slice per domain (`user`, `interview`). Protect pages with a `<ProtectedRoute>` wrapper instead of repeating `if (!userData)` in each page.
7. Tests: `vitest` + `supertest` (server), `vitest` + Testing Library (client). CI on GitHub Actions: lint → test → build.

---

## 10. Execution Plan — detailed steps

> Work top to bottom. Don't start a step until the previous step's **✅ Done when** checks pass. Tick `[x]` here, then update the board in §0.3.
> **Legend:** 🖥️ server · 🎨 client · ⏱️ rough effort (1 day ≈ 4–6 focused hours)

### Stage 0 — Foundation ✅ (done)
- [x] Google login (Firebase ID token verified on the server), logout, session restore
- [x] User model with 500 free credits
- [x] Landing page, Navbar, Footer, Auth modal
- [x] `askAi()` OpenRouter service, multer (PDF-only, memory), central error handler, `/health`
- [x] Code review fixes (see §4)

---

### Stage 1 — Setup for growth (do this first; cheap now, painful later)

#### Step 1 🖥️ Restructure the server into feature modules ⏱️ 0.5 day
- [x] Split `index.js` into `src/app.js` (the Express app) and `src/server.js` (DB connect + listen + graceful shutdown on `SIGTERM`)
- [x] Move code into `src/modules/auth/`, `src/modules/user/` (routes, controller, service)
- [x] Add `src/utils/AppError.js`, so controllers don't need `try/catch` everywhere (`asyncHandler` not needed: Express 5 catches async errors)
- [x] All responses use the shape `{ success, message, data }`
- [x] Update `package.json` scripts to `src/server.js`

**✅ Done when:** login, logout and current-user still work, and `/health` returns ok.

#### Step 2 🖥️ Security & validation basics ⏱️ 0.5 day
- [x] `npm i helmet compression express-rate-limit zod`
- [x] `src/config/env.js`: validate all env vars with zod at startup, so the server crashes early if one is missing (all files now use `env.X`, no `process.env` outside env.js)
- [x] `middlewares/validate.js`: `validate(schema)` for body, params and query (first use: `modules/auth/auth.schema.js` → `POST /api/auth/google`)
- [x] `middlewares/rateLimit.js`: global rate limit of 100 req/min per IP, plus an `aiLimiter` of 10 req/min per user (used from Step 6 on) — `globalLimiter` keyed by IP, `aiLimiter` keyed by `req.userId` (IP fallback); in-memory store until Step 22
- [x] Wire `helmet` + `compression` + global limiter into `app.js` (order: trust proxy → helmet → cors → compression → /health → limiter → json → cookies → routes)

**✅ Done when:** a bad request body returns 400 with a clear message, and the 101st request in a minute returns 429.

#### Step 2b 🖥️🎨 Email/password login ⏱️ 1.5 days  _(added 2026-09-30, not in the original plan)_
Own passwords with bcrypt (not Firebase email auth) — chosen to learn hashing. Google login keeps working; same JWT cookie after login.
- [x] `npm i bcryptjs nodemailer`; User model: `password` (select:false), `isVerified`, `verificationToken` (sha256 hash) + `verificationTokenExpires`, email lowercase
- [x] `lib/mail/mailer.js`: nodemailer over SMTP (Gmail App Password); if SMTP not set, print the link in the terminal (dev)
- [x] `auth.schema.js` + `auth.service.js`: register, verifyEmail, login, resendVerification; Google login sets `isVerified` and wipes an unverified password (pre-account-takeover fix)
- [x] Controller + routes (`/register`, `/verify-email`, `/login`, `/resend-verification`) + strict `authLimiter` on login/register
- [x] Frontend: new `Auth.jsx` (Login / Sign up tabs, show password, errors, loading, Google button) + `/verify-email` page (`pages/VerifyEmail.jsx`); App.jsx no longer dispatches null on 401 (race fix)
- [x] Forgot password: `POST /forgot-password` (same response for any email, email sent in background) + `POST /reset-password` (1h link, one-time, sets `isVerified`, logs in); "Forgot password?" screen in `Auth.jsx` + `pages/ResetPassword.jsx`. Google-only users can use it to add a password.
- [x] You: Gmail SMTP in `server/.env` (confirmed working 2026-09-30)
- [x] You: tested in the browser and committed (`a7d62e8`, `742ea00`)

**✅ Done when:** sign up → link (email or terminal) → click → logged in; wrong password → "Invalid email or password"; unverified login → "verify your email" + resend; forgot password → email → new password → logged in, old password rejected; Google login still works.

#### Step 3 🎨 Client API layer + protected routes ⏱️ 0.5 day
- [x] `src/api/axios.js`: an axios instance with `baseURL: serverUrl`, `withCredentials: true`, and an interceptor that clears the user on 401
- [x] `src/api/auth.api.js`, `user.api.js`: move the calls out of the components (+ `utils/getErrorMessage.js`)
- [x] Add `loading` to `userSlice` so the app doesn't flash "logged out" while fetching the current user
- [x] `components/ProtectedRoute.jsx`: wrap `/interview`, `/report/:id` (`/history` when the page exists); login sends you back to the page you came from
- [x] Lazy-load pages with `React.lazy` + `Suspense` (fixes the 540 kB bundle warning) — main 540 → 445 kB, login popup + Firebase (107 kB) load only when opened

**✅ Done when:** opening `/interview` while logged out shows the login modal or redirects, and after refresh a logged-in user stays on the page.

#### Step 4 🎨🖥️ Dev tooling ⏱️ 0.5 day
- [x] `git init` at `Ai_interview_Agent/` (if not already a repo) and first commit; confirm `.env` is **not** committed (repo existed; `.env` is gitignored)
- [x] Prettier config shared by client and server; ESLint for the server — root `package.json` (`format`, `format:check`, `lint`, `check`), `.prettierrc.json` (4 spaces, 120 cols, JSON 2 spaces), `.prettierignore` (md, lockfiles, dist); `server/eslint.config.js` (fixed 3 unused-var errors)
- [x] You: run `npm run format` once (after committing Step 3) — dry run on a copy: 43 files, lint/build/server boot all fine
- [x] Compress images in `client/src/assets` (use WebP, target < 60 kB each) and videos (target < 2 MB each) — 8 PNGs 1283 kB → 157 kB WebP (11–28 kB each, PSNR 40–45 dB); videos already 1.1/1.3 MB; `MM.png` unused, left as is
- [x] Root `README.md` with the run instructions (copy §12) — plus features, stack, structure, env tables, scripts, API list

**✅ Done when:** `npm run lint` passes in both apps and the repo is committed.

---

### Stage 2 — Interview backend

#### Step 5 🖥️ Interview model + mode config ⏱️ 0.5 day
- [x] `modules/interview/interview.model.js` (schema in §5) with index `{ userId: 1, createdAt: -1 }` — stores the resume **AI summary** (`resume: {skills, projects, experienceSummary}`), not the raw text; questions have `answer: null` until answered
- [x] `modules/interview/interview.modes.js`: the `MODES` map (`hr`, `technical`, `confidence`), each with `cost`, `questionCount`, time limits by difficulty, and a rubric
- [x] `modules/interview/interview.prompts.js`: system prompts for question generation, per-answer evaluation, and the final report. Every prompt asks for **strict JSON**.
- [x] Zod schemas for the AI outputs (questions, evaluation, report) — `interview.ai-schemas.js` (+ resume); `lib/ai/openRouter.js` gains `askAiJson(messages, schema)` (JSON extraction, zod check, 2 retries with backoff, fallback models, error-in-200 handling)

**✅ Done when:** the model imports cleanly and the prompts are reviewed.

#### Step 6 🖥️ Resume upload & parsing ⏱️ 1 day
- [x] `npm i pdf-parse` (v2: `new PDFParse({ data })`, only first 5 pages)
- [x] `POST /api/interview/resume` with `isAuth`, `aiLimiter`, `upload.single("resume")`
- [x] Extract the text (reject if empty, e.g. a scanned image PDF) and trim it to about 12k characters
- [x] `askAi` returns `{ skills[], projects[{name, tech[], summary}], experienceSummary }`
- [x] Return the parsed data. Don't store the PDF file.

**✅ Done when:** uploading your own resume returns sensible skills and projects, a `.docx` returns 400, and a 6 MB file returns 400.

#### Step 7 🖥️ Start interview (credits + questions) ⏱️ 1 day
- [x] `POST /api/interview/start` with body `{ role, experience, mode, resume?, requestId }`
- [x] **Double-click safe:** `requestId` (UUID from frontend) + unique index `{ userId, requestId }`; interview is created first (status `starting`), duplicate → 409 or the same interview, never a second charge
- [x] **Atomic credit deduction:** `User.findOneAndUpdate({ _id, credit: { $gte: cost } }, { $inc: { credit: -cost } }, { new: true })`. If this returns `null`, respond 402 "Not enough credits".
- [x] Generate N questions with `askAiJson` (zod-validated, retries)
- [x] If the AI fails, **refund the credits** and return 503
- [x] Save the Interview with `status: "in_progress"` and return `{ interviewId, questions (text, difficulty, timeLimitSec only), credit }`

**✅ Done when:** credits drop by `cost`, a user with 0 credits gets 402, and forcing an AI error (bad API key) refunds the credits.

#### Step 8 🖥️ Submit & evaluate an answer ⏱️ 1 day
- [x] `POST /api/interview/:id/answer` with body `{ questionIndex, answer, timeTakenSec }`
- [x] Owner check (`interview.userId === req.userId`), status must be `in_progress`, and the question must not already be answered
- [x] Empty or skipped answer: score 0 without calling the AI
- [x] `askAi` returns `{ scores: { communication, content, technical, confidence }, feedback }` (0–10)
- [x] Save into `questions[i]`, then return the evaluation

**✅ Done when:** answers are scored, another user's interview returns 404, and submitting twice returns 409.

#### Step 9 🖥️ Finish interview + report, get by id ⏱️ 1 day
- [x] `POST /api/interview/:id/finish`: compute the average scores in code (not the AI), then `askAi` for strengths, weaknesses and improvements. Set `status: "completed"`.
- [x] `GET /api/interview/:id`: the full report, owner only
- [x] `GET /api/interview/history?page=1&limit=10`: `.lean()`, projection (no questions array), sorted newest first
- [x] Test the whole flow with Postman or Thunder Client and save the collection in the repo (`/docs/api.postman.json`)

**✅ Done when:** the full flow resume → start → 5 answers → finish works through Postman.

---

### Stage 3 — Interview frontend

#### Step 10 🎨 Interview slice + API ⏱️ 0.5 day
- [x] `api/interview.api.js` with all Stage 2 endpoints
- [x] `redux/interviewSlice.js` holding `{ interviewId, questions, currentIndex, evaluations, report, status }`
- [x] Keep the Navbar credit count updated from the `/start` response

#### Step 11 🎨 Step 1: Setup screen ⏱️ 1 day
- [x] Role input with suggestions (Frontend, Backend, Full Stack, Data Analyst, …)
- [x] Experience select (Fresher, 1–3 yrs, 3–5 yrs, 5+ yrs)
- [x] Mode cards using `HR.png`, `tech.png`, `confi.png`, each showing its credit cost
- [x] PDF drag-and-drop zone that shows parsed skills and projects as chips (optional but recommended)
- [x] Avatar choice (male/female) and a "Start Interview" button that shows the cost, with a loading state while questions generate

**✅ Done when:** clicking Start creates an interview and moves to Step 2.

#### Step 12 🎨 Step 2: Live interview (the core feature) ⏱️ 2–3 days
- [x] `hooks/useSpeechSynthesis.js`: speak the question with `window.speechSynthesis`
- [x] `hooks/useSpeechRecognition.js`: `webkitSpeechRecognition`, continuous, interim results, and restart on end. Fall back to a text box if the browser doesn't support it (Firefox).
- [x] `hooks/useTimer.js`: countdown per question that auto-submits at 0
- [x] Layout: avatar video (`male-ai.mp4` / `female-ai.mp4`, playing while the AI speaks) on one side, and the question, live transcript (editable), timer and mic button on the other
- [x] Submit, then show a short feedback toast and move to the next question. Add a progress bar (Q 2/5).
- [x] Ask "Are you sure?" on leave or refresh (`beforeunload`)
- [x] After the last question, call `/finish` and go to Step 3

**✅ Done when:** you can complete a full interview by voice in Chrome, and by typing in Firefox.

#### Step 13 🎨 Step 3: Report screen ⏱️ 1 day
- [x] Overall score ring, 4 skill bars, strengths/weaknesses/improvements lists
- [x] Per-question accordion: question, your answer, score, feedback
- [x] Buttons: "Download PDF", "New Interview", "View History"

#### Step 14 🎨🖥️ End-to-end polish ⏱️ 1 day
- [x] Loading skeletons, error toasts (`react-hot-toast`), empty states
- [x] Mobile responsive check for Home, Setup, Interview and Report
- [x] Handle credits running out (link to `/pricing`) and AI failures (retry button)

**✅ Done when:** a friend can use it with no help and with no console errors.

---

### Stage 4 — History & reports 🎯 MVP

#### Step 15 🎨 History page (`/history`) ⏱️ 1 day
- [x] Paginated list of cards (role, mode, date, score, status) linking to `/report/:id`
- [x] Filter by mode and a "Load more" button

#### Step 16 🎨 Analytics ⏱️ 1 day
- [x] `npm i recharts`: a line chart of the overall score over time and average skill scores
- [x] Server endpoint `GET /api/interview/stats` using a MongoDB aggregation (average by mode, trend)

#### Step 17 🎨 Report page + PDF download ⏱️ 1 day
- [x] `/report/:id`: reuse the Step 3 report component (`Interviewreport.jsx`)
- [x] PDF via `jspdf` + `jspdf-autotable` on the client (no server load)

**✅ Done when (🎯 MVP):** a new user can sign up, take 2 interviews, see history and trend, and download a PDF. **Deploy a beta (Step 25) now** and collect feedback.

---

### Stage 5 — Payments

#### Step 18 🖥️ Transaction ledger ⏱️ 0.5 day
- [x] `Transaction` model (§5); write a row on signup bonus, interview start, refund and purchase
- [x] Use a MongoDB transaction/session for the credit update plus the ledger insert

#### Step 19 🖥️🎨 Pricing + Razorpay/Stripe ⏱️ 2 days
- [x] Plans kept in config (e.g. 500 credits for ₹99, 1500 for ₹249)
- [x] `POST /api/payment/order`, then checkout, then `POST /api/payment/verify` (verify the signature on the server), then add credits
- [x] **Webhook** handler that is idempotent (a unique `paymentId` index) so a payment is never credited twice
- [x] `/pricing` page with plan cards, connected to the "Buy more credits" button

#### Step 20 🎨 Account page ⏱️ 0.5 day
- [x] Credit balance, transaction history, logout

**✅ Done when:** a test-mode payment adds credits exactly once, even if the webhook fires twice.

---

### Stage 6 — Production & scale (target: 1,000 req/s)

#### Step 21 🖥️ Logging & monitoring ⏱️ 0.5 day
- [x] `pino` + `pino-http` with a request ID; remove `console.log`
- [x] Sentry on client and server
- [x] `/ready` endpoint that pings the DB (Redis ping comes in Step 22)

#### Step 22 🖥️ Redis ⏱️ 1 day
- [x] `ioredis`; move the rate-limit store to Redis (`rate-limit-redis`) so limits work across instances
- [x] Cache `current-user` (60 s) and `stats`; clear the cache on credit change

#### Step 23 🖥️ Background queue ⏱️ 1–2 days
- [x] `bullmq` with a separate `src/worker.js` process
- [x] Move resume parsing and final report generation to jobs; the client polls `GET /api/jobs/:id` (polling, not SSE)
- [x] AI retries with exponential backoff and a fallback model (`OPENROUTER_FALLBACK_MODELS`, already existed)
- [x] Per-user concurrency: 1 active AI job at a time
- [x] (extra) Cleanup job for interviews stuck in `starting` / `finishing` — closes the 2 known gaps in §0.5

#### Step 24 🖥️🎨 Tests + CI ⏱️ 1–2 days
- [x] Server: `vitest` + `supertest` + `mongodb-memory-server`, covering auth, the credits race (10 parallel `/start` calls with credits for only 1), and the answer ownership check (+ queue, payments, cleanup)
- [x] Client: `vitest` + Testing Library for Setup and Report (+ job polling)
- [x] GitHub Actions: lint → test → build on every push

#### Step 25 🚀 Deploy ⏱️ 1 day
- [ ] Client on Vercel or Netlify (set `VITE_SERVER_URL`)
- [ ] Server on Render, Railway or a VPS with Docker + PM2 (`-i max`); worker as a separate service
- [ ] MongoDB Atlas and Redis (Upstash or Redis Cloud)
- [ ] `NODE_ENV=production`, set `CLIENT_URL` to the real domain, use HTTPS, and add the domain to Firebase **Authorized domains**
- [ ] Custom domain; cookies work cross-site (`sameSite: none; secure` is already handled in `config/cookie.js`)

#### Step 26 📈 Load test & tune ⏱️ 1 day
- [ ] `k6` or `autocannon` at 1,000 req/s mixed across `/health`, `/api/user/current-user` and `/api/interview/history`
- [ ] Targets: p95 < 200 ms, errors < 1%
- [ ] Tune: instance count, Mongo `maxPoolSize`, missing indexes (check `explain()`), and cache hit rate
- [ ] AI endpoints: test at about 50 concurrent to confirm the queue handles the backlog without timeouts

**✅ Done when:** the load test report is saved in `/docs/loadtest.md` and meets the targets.

---

### Stage 7 — Differentiators (after launch, pick by user feedback)
- [ ] **27.** Adaptive follow-up questions (the next question depends on the last answer's score)
- [ ] **28.** Webcam confidence analysis in the browser with MediaPipe (eye contact, face presence), feeding the "confidence" score
- [ ] **29.** Coding round with an in-browser editor (Monaco) and AI code review
- [ ] **30.** Company-specific question packs (Google, TCS, Amazon style)
- [ ] **31.** Real-time streaming voice interviewer (better STT/TTS, interruption handling)
- [ ] **32.** Admin dashboard for users, interviews per day, AI cost per interview, and revenue
- [ ] **33.** Email report and weekly progress email

---

### Working rules (every step)
1. **One step = one git branch = one commit or PR.** Message format: `step-7: start interview with atomic credits`.
2. New server feature: create `modules/<feature>/` with routes, controller, service, model, schema, then add one line in `app.js`.
3. Every new route gets `isAuth` (if private), `validate(schema)`, and a rate limiter (if it calls the AI).
4. Never trust the client for credits, scores or user identity; compute them on the server.
5. Update the §0 tracker after every step, and the §2 feature table when a feature ships.

---

## 11. Success Metrics
- Interview completion rate > 70%
- p95 API latency < 200 ms (non-AI), AI question generation < 6 s
- AI cost per interview tracked and below revenue per credit
- 1,000 req/s sustained in load test with < 1% errors

## 12. How to Run
```bash
# server
cd server && cp .env.example .env   # fill values
npm install && npm run dev          # http://localhost:8000/health

# client
cd client && cp .env.example .env   # fill VITE_FIREBASE_API_KEY
npm install && npm run dev          # http://localhost:5173
```
