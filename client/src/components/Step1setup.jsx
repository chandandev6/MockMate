import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BsFileEarmarkPdf, BsX } from "react-icons/bs";
import { startInterview, uploadResume } from "../api/interview.api.js";
import { interviewStarted } from "../redux/interviewSlice.js";
import { setCredit } from "../redux/userSlice.js";
import { saveActiveInterview } from "../utils/activeInterview.js";
import getErrorMessage from "../utils/getErrorMessage.js";
import {
    AVATARS,
    CRITERIA,
    EXPERIENCE_LEVELS,
    INTERVIEW_COST,
    MODES,
    ROLE_SUGGESTIONS,
} from "../constants/interview.js";
import LevelMeter from "./ui/LevelMeter.jsx";

const MAX_RESUME_MB = 5; // server (multer) ki limit — yaha pehle hi rok do, 5 MB upload karke error kyun

function Chip({ children }) {
    return <span className="text-xs bg-ground border border-line px-2.5 py-1 rounded-full">{children}</span>;
}

function Step1setup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const credit = useSelector((state) => state.user.userData?.credit ?? 0);

    const [role, setRole] = useState("");
    const [experience, setExperience] = useState(EXPERIENCE_LEVELS[0]);
    const [mode, setMode] = useState("technical");
    const [avatar, setAvatar] = useState("female");

    const [resume, setResume] = useState(null); // server ka parsed resume { skills, projects, experienceSummary }
    const [resumeName, setResumeName] = useState("");
    const [resumeLoading, setResumeLoading] = useState(false);
    const [resumeError, setResumeError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const [starting, setStarting] = useState(false);
    const [error, setError] = useState("");
    // ek "Start" attempt ka UUID. Network fail (server ka jawab hi nahi) par wahi id dobara — server double charge nahi karega
    const requestIdRef = useRef(null);

    const notEnoughCredits = credit < INTERVIEW_COST;

    const handleResumeFile = async (file) => {
        if (!file) return;
        setResumeError("");
        if (file.type !== "application/pdf") return setResumeError("Please choose a PDF file.");
        if (file.size > MAX_RESUME_MB * 1024 * 1024) return setResumeError(`PDF must be under ${MAX_RESUME_MB} MB.`);

        setResumeLoading(true);
        setResumeName(file.name);
        try {
            const res = await uploadResume(file);
            setResume(res.data.resume);
        } catch (err) {
            setResume(null);
            setResumeName("");
            setResumeError(getErrorMessage(err));
        } finally {
            setResumeLoading(false);
        }
    };

    const removeResume = () => {
        setResume(null);
        setResumeName("");
        setResumeError("");
    };

    const handleStart = async (e) => {
        e.preventDefault();
        setError("");
        if (role.trim().length < 2) return setError("Please enter the role you are preparing for.");

        requestIdRef.current ??= crypto.randomUUID();
        setStarting(true);
        try {
            const res = await startInterview({
                role: role.trim(),
                experience,
                mode,
                resume: resume || undefined,
                requestId: requestIdRef.current,
            });
            requestIdRef.current = null;
            dispatch(setCredit(res.data.credit)); // Navbar ka credit turant update
            saveActiveInterview({ interviewId: res.data.interviewId, avatar });
            dispatch(interviewStarted({ ...res.data, avatar }));
        } catch (err) {
            // server ne jawab diya (400/402/503) = usne sab wapas kar diya → agli baar naya id.
            // INTERVIEW_STARTING = pehli request abhi chal rahi hai → wahi id rakho
            if (err.response && err.response.data?.code !== "INTERVIEW_STARTING") requestIdRef.current = null;
            setError(getErrorMessage(err));
        } finally {
            setStarting(false);
        }
    };

    const modeInfo = MODES.find((item) => item.key === mode);
    const avatarInfo = AVATARS.find((item) => item.key === avatar);

    return (
        <form onSubmit={handleStart} className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
            <div className="grid lg:grid-cols-12 gap-6 items-end mb-10 sm:mb-12 animate-rise">
                <div className="lg:col-span-8">
                    <p className="eyebrow mb-4">New session · 5 questions · voice answers</p>
                    <h1 className="text-[clamp(2.75rem,1rem+5vw,5.5rem)] font-black tracking-[-0.055em] leading-[0.9]">
                        Set up your interview<span className="text-signal">.</span>
                    </h1>
                </div>
                <p className="lg:col-span-4 text-muted leading-relaxed">
                    Tell us what you're preparing for. Every question is written for this role — and for your projects
                    if you add a resume.
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                <div className="lg:col-span-8 border-t border-ink">
                    {/* 01 role + experience */}
                    <section className="py-8 border-b border-line grid sm:grid-cols-[4rem_1fr] gap-4">
                        <span className="font-mono text-sm text-muted">01</span>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-sm font-semibold">Role</span>
                                <input
                                    list="role-suggestions"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    maxLength={80}
                                    placeholder="e.g. Frontend Developer"
                                    className="field mt-2"
                                />
                                <datalist id="role-suggestions">
                                    {ROLE_SUGGESTIONS.map((item) => (
                                        <option key={item} value={item} />
                                    ))}
                                </datalist>
                            </label>
                            <label className="block">
                                <span className="text-sm font-semibold">Experience</span>
                                <select
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="field mt-2"
                                >
                                    {EXPERIENCE_LEVELS.map((level) => (
                                        <option key={level}>{level}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </section>

                    {/* 02 mode */}
                    <section className="py-8 border-b border-line grid sm:grid-cols-[4rem_1fr] gap-4">
                        <span className="font-mono text-sm text-muted">02</span>
                        <div>
                            <h2 className="text-sm font-semibold mb-3">Interview mode</h2>
                            <div className="grid sm:grid-cols-3 gap-3">
                                {MODES.map((item) => {
                                    const selected = mode === item.key;
                                    return (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => setMode(item.key)}
                                            aria-pressed={selected}
                                            className={`text-left rounded-xl border p-4 transition-colors ${
                                                selected
                                                    ? "bg-ink text-paper border-ink"
                                                    : "bg-paper border-line-strong hover:border-ink"
                                            }`}
                                        >
                                            <span className="flex items-center justify-between gap-2">
                                                <span className="text-lg font-bold tracking-[-0.02em]">
                                                    {item.title}
                                                </span>
                                                {selected && <span className="lamp" />}
                                            </span>
                                            <span
                                                className={`block text-xs mt-1.5 leading-relaxed ${
                                                    selected ? "text-paper/75" : "text-muted"
                                                }`}
                                            >
                                                {item.desc}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {/* chuna hua mode kya judge karega — server ke asli weights */}
                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 eyebrow">
                                {CRITERIA.map(({ key, label }) => (
                                    <span key={key}>
                                        {label} <span className="text-ink">{modeInfo.weights[key]}%</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 03 resume (optional) */}
                    <section className="py-8 border-b border-line grid sm:grid-cols-[4rem_1fr] gap-4">
                        <span className="font-mono text-sm text-muted">03</span>
                        <div>
                            <h2 className="text-sm font-semibold">
                                Resume{" "}
                                <span className="text-muted font-normal">
                                    (optional — questions about your projects)
                                </span>
                            </h2>

                            {resume ? (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between gap-3 bg-paper border border-line rounded-xl px-4 py-3">
                                        <span className="flex items-center gap-2 text-sm font-medium truncate">
                                            <BsFileEarmarkPdf className="text-ink shrink-0" /> {resumeName}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={removeResume}
                                            className="text-muted hover:text-ink"
                                            aria-label="Remove resume"
                                        >
                                            <BsX size={20} />
                                        </button>
                                    </div>
                                    {resume.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {resume.skills.map((skill) => (
                                                <Chip key={skill}>{skill}</Chip>
                                            ))}
                                        </div>
                                    )}
                                    {resume.projects.length > 0 && (
                                        <p className="text-xs text-muted mt-3">
                                            Projects: {resume.projects.map((project) => project.name).join(" · ")}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => !resumeLoading && fileInputRef.current?.click()}
                                    onKeyDown={(e) =>
                                        (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()
                                    }
                                    onDragOver={(e) => {
                                        e.preventDefault(); // bina iske browser PDF ko khol deta hai
                                        setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOver(false);
                                        if (!resumeLoading) handleResumeFile(e.dataTransfer.files[0]);
                                    }}
                                    className={`mt-3 border border-dashed rounded-xl p-6 text-sm cursor-pointer transition-colors flex items-center gap-4 ${
                                        dragOver
                                            ? "border-ink bg-paper"
                                            : "border-line-strong hover:border-ink hover:bg-paper/60"
                                    }`}
                                >
                                    {resumeLoading ? (
                                        <span className="flex items-center gap-3">
                                            <LevelMeter className="h-5" bars={6} />
                                            Reading your resume… (up to 30 s)
                                        </span>
                                    ) : (
                                        <>
                                            <BsFileEarmarkPdf size={26} className="text-muted shrink-0" />
                                            <span>
                                                <span className="font-medium">
                                                    Drop your PDF here or click to choose
                                                </span>
                                                <span className="block text-xs text-muted mt-0.5">
                                                    Text-based PDF, max {MAX_RESUME_MB} MB
                                                </span>
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => {
                                    handleResumeFile(e.target.files[0]);
                                    e.target.value = ""; // same file dobara choose ho sake
                                }}
                            />
                            {resumeError && <p className="text-sm text-bad mt-2">{resumeError}</p>}
                        </div>
                    </section>

                    {/* 04 avatar */}
                    <section className="py-8 border-b border-line grid sm:grid-cols-[4rem_1fr] gap-4">
                        <span className="font-mono text-sm text-muted">04</span>
                        <div>
                            <h2 className="text-sm font-semibold mb-3">Your interviewer</h2>
                            <div className="grid grid-cols-2 gap-3 max-w-sm">
                                {AVATARS.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setAvatar(item.key)}
                                        aria-pressed={avatar === item.key}
                                        className={`rounded-xl border p-1.5 transition-colors text-left ${
                                            avatar === item.key
                                                ? "border-ink bg-ink text-paper"
                                                : "border-line-strong bg-paper hover:border-ink"
                                        }`}
                                    >
                                        {/* #t=0.5 = us second ka frame preview me dikhao (bina iske khaali dabba); poori video download nahi */}
                                        <video
                                            src={`${item.video}#t=0.5`}
                                            muted
                                            playsInline
                                            preload="metadata"
                                            className="w-full aspect-square object-cover rounded-lg bg-surface"
                                        />
                                        <span className="block text-xs font-medium px-1.5 py-2">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* session ticket — chuni hui cheezein ek nazar me + start (desktop par saath chalta hai) */}
                <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-paper border border-line rounded-2xl p-6">
                    <p className="eyebrow mb-4">Session ticket</p>
                    <dl className="text-sm divide-y divide-line border-y border-line">
                        {[
                            ["Role", role.trim() || "—"],
                            ["Experience", experience],
                            ["Mode", modeInfo.title],
                            ["Interviewer", avatarInfo.label.split(" ")[0]],
                            ["Resume", resume ? "Added" : "Not added"],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-4 py-2.5">
                                <dt className="text-muted">{label}</dt>
                                <dd className="font-medium text-right truncate">{value}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="flex items-end justify-between gap-4 mt-5 mb-5">
                        <div>
                            <p className="eyebrow">Cost</p>
                            <p className="text-3xl font-extrabold tabular-nums tracking-[-0.03em]">
                                {INTERVIEW_COST}
                                <span className="text-sm font-medium text-muted"> credits</span>
                            </p>
                        </div>
                        <p className="text-xs text-muted text-right">
                            Balance
                            <span className="block font-mono text-sm text-ink tabular-nums">{credit}</span>
                        </p>
                    </div>

                    {notEnoughCredits && (
                        <div className="mb-4 bg-warn-wash text-warn text-sm rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
                            You have {credit} credits. An interview needs {INTERVIEW_COST}.
                            <button
                                type="button"
                                onClick={() => navigate("/pricing")}
                                className="underline font-semibold"
                            >
                                Buy credits
                            </button>
                        </div>
                    )}
                    {error && <p className="mb-4 text-sm text-bad bg-bad-wash rounded-lg p-3">{error}</p>}

                    <button
                        type="submit"
                        disabled={starting || resumeLoading || notEnoughCredits}
                        className="btn btn-signal w-full !min-h-13"
                    >
                        {starting ? (
                            <>
                                <LevelMeter tone="signal-ink" className="h-4" bars={5} />
                                Preparing your questions… (up to 30 s)
                            </>
                        ) : (
                            <>Start interview · {INTERVIEW_COST} credits</>
                        )}
                    </button>
                    <p className="text-xs text-muted mt-3 leading-relaxed">
                        Answer by voice or by typing — allow microphone access when the browser asks.
                    </p>
                </aside>
            </div>
        </form>
    );
}

export default Step1setup;
