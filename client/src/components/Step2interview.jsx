// live interview: avatar (left) + current question (right). Saare questions ho gaye → /finish → report page
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BsPlayFill } from "react-icons/bs";
import { finishInterview } from "../api/interview.api.js";
import { resetInterview, resumeConfirmed } from "../redux/interviewSlice.js";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis.js";
import { clearActiveInterview } from "../utils/activeInterview.js";
import getErrorMessage from "../utils/getErrorMessage.js";
import { AVATARS } from "../constants/interview.js";
import QuestionRound from "./interview/QuestionRound.jsx";
import LevelMeter from "./ui/LevelMeter.jsx";

const RETRY_EVALUATING_MS = 3000; // aakhri answer abhi check ho raha ho (409) to itni der baad dobara finish

function Step2interview() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { interviewId, questions, currentIndex, avatar, resumed } = useSelector((state) => state.interview);
    const tts = useSpeechSynthesis(avatar);
    const videoRef = useRef(null);

    const total = questions.length;
    const allAnswered = currentIndex >= total;
    const [finishError, setFinishError] = useState("");
    const [finishAttempt, setFinishAttempt] = useState(0); // badhao = finish dobara try
    // ek attempt = ek hi request (dev me StrictMode effect do baar chalata hai — dusri baar wahi promise)
    const finishRequestRef = useRef({ attempt: -1, promise: null });

    // AI bol raha hai tabhi avatar ki video chale — "baat kar raha hai" jaisa lage
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (tts.speaking) video.play().catch(() => {});
        else video.pause();
    }, [tts.speaking]);

    // refresh / tab band → "Are you sure?" (browser apna message dikhata hai)
    useEffect(() => {
        const warn = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, []);

    // sab answer ho gaye → finish (report). Fail par retry button; 409 "abhi evaluate ho raha" par khud retry
    useEffect(() => {
        if (!allAnswered) return;
        let cancelled = false;
        let retryTimer;
        if (finishRequestRef.current.attempt !== finishAttempt) {
            finishRequestRef.current = { attempt: finishAttempt, promise: finishInterview(interviewId) };
        }
        finishRequestRef.current.promise
            .then((res) => {
                if (cancelled) return;
                clearActiveInterview();
                const { interview } = res.data;
                dispatch(resetInterview());
                navigate(`/report/${interview._id}`, { replace: true, state: { interview } });
            })
            .catch((err) => {
                if (cancelled) return;
                const code = err.response?.data?.code;
                if (code === "ANSWER_BEING_EVALUATED" || code === "INTERVIEW_FINISHING") {
                    retryTimer = setTimeout(() => setFinishAttempt((n) => n + 1), RETRY_EVALUATING_MS);
                    return;
                }
                setFinishError(getErrorMessage(err));
            });
        return () => {
            cancelled = true;
            clearTimeout(retryTimer);
        };
    }, [allAnswered, finishAttempt, interviewId, dispatch, navigate]);

    const avatarVideo = AVATARS.find((item) => item.key === avatar)?.video ?? AVATARS[0].video;

    const answered = Math.min(currentIndex, total);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
            {/* progress — har question ek khana (studio ka channel strip) */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <p className="eyebrow">Live session</p>
                    <p className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] mt-1">
                        {allAnswered ? "All answers in" : `Question ${currentIndex + 1} of ${total}`}
                    </p>
                </div>
                <ol className="flex gap-1.5" aria-label={`${answered} of ${total} answered`}>
                    {questions.map((_, i) => (
                        <li
                            key={i}
                            className={`h-8 w-10 sm:w-12 rounded-md font-mono text-[10px] flex items-center justify-center border ${
                                i < answered
                                    ? "bg-ink text-paper border-ink"
                                    : i === currentIndex
                                      ? "border-signal text-ink bg-signal-wash"
                                      : "border-line text-muted"
                            }`}
                        >
                            Q{i + 1}
                        </li>
                    ))}
                </ol>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
                {/* interviewer — studio monitor jaisa frame */}
                <div className="lg:col-span-5">
                    <div className="bg-ink rounded-2xl p-3 lg:sticky lg:top-24">
                        <div className="relative">
                            <video
                                ref={videoRef}
                                src={avatarVideo}
                                muted
                                loop
                                playsInline
                                preload="auto"
                                className="w-full aspect-[4/3] lg:aspect-[4/5] object-cover rounded-xl bg-ink-soft"
                            />
                            {/* viewfinder ke kone */}
                            {[
                                "top-3 left-3 border-t-2 border-l-2",
                                "top-3 right-3 border-t-2 border-r-2",
                                "bottom-3 left-3 border-b-2 border-l-2",
                                "bottom-3 right-3 border-b-2 border-r-2",
                            ].map((corner) => (
                                <span
                                    key={corner}
                                    aria-hidden="true"
                                    className={`absolute w-5 h-5 border-paper/70 ${corner}`}
                                />
                            ))}
                            <span className="absolute top-5 left-6 font-mono text-[10px] tracking-widest uppercase text-paper/80">
                                Cam 01
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 px-2 pt-3 pb-1 text-paper">
                            <div>
                                <p className="text-sm font-semibold">AI Interviewer</p>
                                <p className="font-mono text-[10px] tracking-widest uppercase text-paper/60 mt-0.5">
                                    {tts.speaking ? "Speaking" : "Listening"}
                                </p>
                            </div>
                            <LevelMeter tone="ground" active={tts.speaking} bars={14} className="h-7" />
                        </div>
                    </div>
                </div>

                {/* question / finishing */}
                <div className="lg:col-span-7">
                    {resumed && !allAnswered ? (
                        // refresh ke baad — browser bina click ke awaaz/mic shuru nahi karne deta
                        <div className="bg-paper border border-line rounded-2xl p-8 sm:p-10">
                            <p className="eyebrow mb-3">Session saved</p>
                            <h2 className="text-3xl font-extrabold tracking-[-0.03em] mb-2">Welcome back</h2>
                            <p className="text-muted mb-6">
                                Your interview is saved. You are on question {currentIndex + 1} of {total}.
                            </p>
                            <button
                                type="button"
                                onClick={() => dispatch(resumeConfirmed())}
                                className="btn btn-signal"
                            >
                                <BsPlayFill /> Continue interview
                            </button>
                        </div>
                    ) : allAnswered ? (
                        <div className="bg-paper border border-line rounded-2xl p-8 sm:p-10">
                            {finishError ? (
                                <>
                                    <p className="text-bad mb-4">{finishError}</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFinishError("");
                                            setFinishAttempt((n) => n + 1);
                                        }}
                                        className="btn btn-ink"
                                    >
                                        Try again
                                    </button>
                                </>
                            ) : (
                                <>
                                    <LevelMeter className="h-10 mb-6" bars={12} />
                                    <h2 className="text-3xl font-extrabold tracking-[-0.03em]">
                                        Preparing your report…
                                    </h2>
                                    <p className="text-muted mt-2">
                                        The AI is reviewing all your answers (up to 30 s).
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <QuestionRound
                            key={currentIndex}
                            interviewId={interviewId}
                            index={currentIndex}
                            total={total}
                            question={questions[currentIndex]}
                            speak={tts.speak}
                            cancelSpeech={tts.cancel}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Step2interview;
