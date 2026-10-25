import { lazy, Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BsArrowRight, BsArrowDown } from "react-icons/bs";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LevelMeter from "../components/ui/LevelMeter.jsx";
import { CRITERIA, INTERVIEW_COST, MODES } from "../constants/interview.js";

// login popup + Firebase sirf popup khulne par download (home page jaldi khule)
const Authmodel = lazy(() => import("../components/Authmodel"));

// hero ki lines — har line thodi der se aati hai (ek hi sequence, ~1.2s, phir sab shaant)
const HEADLINE = [
    { text: "Rehearse", indent: "" },
    { text: "the room", indent: "lg:pl-[16.66%]" },
    { text: "before you", indent: "" },
    { text: "walk in", indent: "lg:pl-[8.33%]" },
];

const BEATS = [
    {
        n: "01",
        title: "Set the room",
        desc: "Type the role you want, pick your experience and a mode. Add your resume and the questions come from your own projects.",
        meta: "Role · resume · mode",
    },
    {
        n: "02",
        title: "Hear the question",
        desc: "Your interviewer reads five questions out loud — easy, easy, medium, medium, hard — and a timer starts when they finish.",
        meta: "60 / 90 / 120 s",
    },
    {
        n: "03",
        title: "Answer out loud",
        desc: "Speak like you would in the room. Your words turn into text you can fix before you submit. Works in every modern browser.",
        meta: "Voice or typing",
    },
    {
        n: "04",
        title: "Read the verdict",
        desc: "Each answer is scored 0–10 on four criteria with a note on what to change. The final report adds strengths, gaps and a PDF.",
        meta: "Score /100 · PDF",
    },
];

const SAMPLE_SCORES = { communication: 7.4, content: 6.2, technical: 8.1, confidence: 5.6 };

// hero ke saath ek asli jaisa session — 5 second me samajh aaye "ye kya hai"
function SessionMock() {
    return (
        <div className="relative bg-paper border border-line rounded-2xl p-5 sm:p-6 shadow-[0_30px_60px_-30px_rgb(15_37_64/0.45)]">
            <div className="flex items-center justify-between gap-3">
                <span className="eyebrow !text-ink flex items-center gap-2">
                    <span className="lamp" /> On air
                </span>
                <span className="eyebrow">Q3 / 5 · Medium</span>
            </div>

            <p className="mt-4 text-lg sm:text-xl font-semibold leading-snug tracking-[-0.01em]">
                How would you speed up a slow third-party API your app depends on?
            </p>

            <div className="mt-5 flex items-center gap-3">
                <span className="font-mono text-sm tabular-nums">01:12</span>
                <div className="h-1 flex-1 bg-line rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-ink" />
                </div>
                <span className="font-mono text-xs text-muted">1:30</span>
            </div>

            <div className="mt-5 rounded-xl bg-surface border border-line p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="eyebrow">Your answer</span>
                    <LevelMeter tone="signal" bars={10} className="h-4" />
                </div>
                <p className="text-sm leading-relaxed">
                    I'd put a Redis cache in front of it with a short TTL, and refresh popular keys in the background so
                    users never wait on the slow call…
                </p>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2 border-t border-line pt-4">
                {CRITERIA.map(({ key, label }) => (
                    <div key={key}>
                        <p className="font-mono text-[10px] tracking-wider uppercase text-muted">{label.slice(0, 4)}</p>
                        <p className="font-bold text-lg tabular-nums">{Math.round(SAMPLE_SCORES[key])}</p>
                    </div>
                ))}
            </div>
            <span className="absolute -top-3 right-5 bg-ink text-paper font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded">
                Sample
            </span>
        </div>
    );
}

function Home() {
    const userData = useSelector((state) => state.user.userData);
    const [showAuth, setShowAuth] = useState(false);
    const navigate = useNavigate();

    const goToInterview = () => {
        if (!userData) {
            setShowAuth(true);
            return;
        }
        navigate("/interview");
    };

    return (
        <div className="min-h-screen bg-ground flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* ---------- hero: poster. Grid lines dikhti hai, session card grid tod ke headline par chadh jaata hai ---------- */}
                <section className="relative grid-rules border-b border-line">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14 pb-14 lg:pb-20">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 lg:mb-12">
                            <p className="eyebrow">AI mock interviews — out loud</p>
                            <p className="eyebrow flex items-center gap-2">
                                <span className="lamp" /> 5 questions · about 10 minutes
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-12 gap-10 lg:gap-0 items-end">
                            <h1 className="lg:col-span-8 font-black text-[clamp(3.4rem,1rem+8.6vw,9.75rem)] leading-[0.86] tracking-[-0.06em]">
                                {HEADLINE.map((line, i) => (
                                    <span
                                        key={line.text}
                                        className={`block animate-rise ${line.indent}`}
                                        style={{ animationDelay: `${120 + i * 110}ms` }}
                                    >
                                        {line.text}
                                        {i === HEADLINE.length - 1 && <span className="text-signal">.</span>}
                                    </span>
                                ))}
                            </h1>

                            {/* jaan-boojh ke grid todna: card headline ki aakhri line par thoda chadhta hai */}
                            <div className="lg:col-span-4 lg:-ml-24 lg:mb-6 relative z-10">
                                <SessionMock />
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-12 gap-8 mt-12 lg:mt-14">
                            <p className="lg:col-span-5 text-lg sm:text-xl leading-relaxed text-ink/85">
                                MockMate's interviewer asks five questions built from your role and resume, listens to
                                your spoken answers and scores each one — so the real interview isn't your first try.
                            </p>
                            <div className="lg:col-span-5 lg:col-start-8 flex flex-col items-start gap-4">
                                <button onClick={goToInterview} className="btn btn-signal !min-h-14 !px-7 text-base">
                                    Start a 5-question interview <BsArrowRight />
                                </button>
                                <a
                                    href="#scorecard"
                                    className="text-sm font-medium underline underline-offset-4 decoration-line-strong hover:decoration-ink flex items-center gap-1.5"
                                >
                                    See how answers are scored <BsArrowDown />
                                </a>
                                <p className="eyebrow">500 free credits on sign-up · {INTERVIEW_COST} per interview</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------- format: 4 beats, ruled list (3 same cards nahi) ---------- */}
                <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20 lg:py-28 grid lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28">
                            <p className="eyebrow mb-4">The format</p>
                            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[0.95]">
                                One session, four beats.
                            </h2>
                            <p className="mt-5 text-muted leading-relaxed max-w-sm">
                                Same shape as a real first round, minus the stakes. Do it as many times as you need.
                            </p>
                        </div>
                    </div>
                    <ol className="lg:col-span-8 border-t border-ink">
                        {BEATS.map((beat) => (
                            <li
                                key={beat.n}
                                className="grid grid-cols-[3.5rem_1fr] sm:grid-cols-[5rem_1fr_10rem] gap-x-4 gap-y-2 py-7 border-b border-line"
                            >
                                <span className="font-mono text-2xl sm:text-3xl text-muted">{beat.n}</span>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.02em]">{beat.title}</h3>
                                    <p className="mt-2 text-muted leading-relaxed max-w-xl">{beat.desc}</p>
                                </div>
                                <span className="eyebrow col-start-2 sm:col-start-3 sm:text-right sm:pt-2">
                                    {beat.meta}
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* ---------- modes: teen kamre — har mode ke asli weights (server rubric) ---------- */}
                <section className="bg-surface border-y border-line">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 lg:py-24">
                        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
                            <div>
                                <p className="eyebrow mb-4">Three rooms</p>
                                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[0.95] max-w-xl">
                                    Each mode judges what that interview cares about.
                                </h2>
                            </div>
                            <p className="text-muted max-w-sm leading-relaxed">
                                The weights below are the real ones used to turn your four scores into one number.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 border-t border-ink">
                            {MODES.map((mode, i) => {
                                const top = Object.entries(mode.weights).sort((a, b) => b[1] - a[1])[0][0];
                                return (
                                    <article
                                        key={mode.key}
                                        className={`pt-8 pb-10 md:px-8 ${i > 0 ? "border-t md:border-t-0 md:border-l border-line" : "md:pl-0"}`}
                                    >
                                        <p className="font-mono text-xs text-muted">0{i + 1}</p>
                                        <h3 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">
                                            {mode.title}
                                        </h3>
                                        <p className="mt-3 text-muted leading-relaxed min-h-12">{mode.desc}</p>
                                        <dl className="mt-6 space-y-3">
                                            {CRITERIA.map(({ key, label }) => (
                                                <div
                                                    key={key}
                                                    className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3"
                                                >
                                                    <dt
                                                        className={`text-sm ${key === top ? "font-semibold" : "text-muted"}`}
                                                    >
                                                        {label}
                                                    </dt>
                                                    <div className="h-1.5 bg-line rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${key === top ? "bg-signal" : "bg-ink"}`}
                                                            style={{ width: `${mode.weights[key] * 2}%` }}
                                                        />
                                                    </div>
                                                    <dd className="font-mono text-xs tabular-nums text-right">
                                                        {mode.weights[key]}%
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ---------- scorecard: dark band — sample report jaisa milta hai ---------- */}
                <section id="scorecard" className="bg-ink text-ground scroll-mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 lg:py-28 grid lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-5">
                            <p className="eyebrow !text-ground/60 mb-4">Sample report · after question 5</p>
                            <p className="font-black tracking-[-0.07em] leading-[0.8] text-[clamp(7rem,4rem+12vw,15rem)]">
                                72<span className="text-3xl font-semibold tracking-normal text-ground/60">/100</span>
                            </p>
                            <p className="mt-6 text-ground/80 leading-relaxed max-w-md">
                                Your overall score is calculated in code from the four averages and the mode's weights —
                                not guessed by the AI — so the same answers always give the same number.
                            </p>
                        </div>
                        <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-10">
                            <div className="space-y-5">
                                {CRITERIA.map(({ key, label }) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>{label}</span>
                                            <span className="font-mono tabular-nums">{SAMPLE_SCORES[key]}/10</span>
                                        </div>
                                        <div className="h-2 bg-ground/15 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-ground rounded-full"
                                                style={{ width: `${SAMPLE_SCORES[key] * 10}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid sm:grid-cols-3 gap-6 border-t border-ground/20 pt-8 text-sm">
                                <div>
                                    <p className="eyebrow !text-ground/60 mb-2">Strength</p>
                                    <p className="leading-relaxed">
                                        Explains trade-offs clearly before picking a tool.
                                    </p>
                                </div>
                                <div>
                                    <p className="eyebrow !text-ground/60 mb-2">Gap</p>
                                    <p className="leading-relaxed">Answers stop before a concrete example.</p>
                                </div>
                                <div>
                                    <p className="eyebrow !text-ground/60 mb-2">Next time</p>
                                    <p className="leading-relaxed">Close with one real project and a number from it.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------- closing CTA ---------- */}
                <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-end">
                    <h2 className="lg:col-span-8 text-[clamp(2.75rem,1rem+5vw,6rem)] font-black tracking-[-0.055em] leading-[0.9]">
                        Your next interview is a rehearsal<span className="text-signal">.</span>
                    </h2>
                    <div className="lg:col-span-4 flex flex-col items-start gap-3">
                        <button onClick={goToInterview} className="btn btn-signal !min-h-14 !px-7 text-base">
                            Start practising <BsArrowRight />
                        </button>
                        <p className="text-sm text-muted">
                            New accounts get 500 credits — enough for {500 / INTERVIEW_COST} interviews.
                        </p>
                    </div>
                </section>
            </main>

            {showAuth && (
                <Suspense fallback={null}>
                    <Authmodel onClose={() => setShowAuth(false)} />
                </Suspense>
            )}
            <Footer />
        </div>
    );
}

export default Home;
