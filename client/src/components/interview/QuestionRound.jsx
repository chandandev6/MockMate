// ek question ka poora cycle: AI bolta hai → user bolta/likhta hai (timer) → submit → score
// parent ise key={index} deta hai — naya question = naya component = saara state apne aap reset
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { BsMic, BsMicMute, BsArrowRepeat } from "react-icons/bs";
import { getInterview, submitAnswer } from "../../api/interview.api.js";
import { answerEvaluated } from "../../redux/interviewSlice.js";
import useSpeechRecognition from "../../hooks/useSpeechRecognition.js";
import useCountdown from "../../hooks/useCountdown.js";
import getErrorMessage from "../../utils/getErrorMessage.js";
import LevelMeter from "../ui/LevelMeter.jsx";

const DIFFICULTY_STYLE = {
    easy: "bg-good-wash text-good",
    medium: "bg-warn-wash text-warn",
    hard: "bg-bad-wash text-bad",
};

const joinText = (current, chunk) => (current ? `${current} ${chunk}` : chunk);

const average = (scores) => Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / 4) * 10) / 10;

function QuestionRound({ interviewId, index, total, question, speak, cancelSpeech }) {
    const dispatch = useDispatch();

    // speaking → answering → submitting (fail → error, wahi se retry)
    const [phase, setPhase] = useState("speaking");
    const [answer, setAnswerState] = useState("");
    const [error, setError] = useState("");

    // async kaam (timer khatam, mic ka aakhri tukda) ko hamesha latest value chahiye — isliye refs bhi
    const answerRef = useRef("");
    const phaseRef = useRef("speaking");
    const timeTakenRef = useRef(0);

    const setAnswer = (text) => {
        answerRef.current = text;
        setAnswerState(text);
    };
    const changePhase = (next) => {
        phaseRef.current = next;
        setPhase(next);
    };

    const mic = useSpeechRecognition((chunk) => setAnswer(joinText(answerRef.current, chunk)));
    // 0 par auto-submit. submit neeche bana hai, isliye ref se (hamesha latest wala)
    const submitRef = useRef(null);
    const timer = useCountdown(() => submitRef.current?.());

    // AI question bolta hai, phir answer ka time + mic shuru (phase pehle se "speaking" hona chahiye)
    const askQuestion = async () => {
        await speak(`Question ${index + 1}. ${question.question}`);
        if (phaseRef.current !== "speaking") return; // beech me unmount / skip ho gaya
        changePhase("answering");
        timer.start(question.timeLimitSec);
        mic.start();
    };

    useEffect(() => {
        phaseRef.current = "speaking"; // dev (StrictMode) me effect do baar chalta hai — cleanup ka "gone" hatao
        askQuestion();
        return () => {
            phaseRef.current = "gone"; // unmount — chal rahe async kaam ab state na chhooye
            cancelSpeech();
        };
        // sirf mount par ek baar (har question naya component hai)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const repeatQuestion = async () => {
        if (phaseRef.current !== "answering") return;
        timer.stop();
        changePhase("speaking");
        await mic.stop();
        askQuestion();
    };

    const submit = async (overrideText) => {
        // speaking (skip), answering (normal / timer), error (retry) — submitting me dobara nahi
        if (!["speaking", "answering", "error"].includes(phaseRef.current)) return;
        const previousPhase = phaseRef.current;
        changePhase("submitting");
        cancelSpeech();
        // retry me pehla naapa hua time hi bhejo; AI bol hi raha tha (skip) to timer chala hi nahi → 0
        if (previousPhase === "answering") {
            timeTakenRef.current = Math.min(timer.elapsedSec(), question.timeLimitSec);
            timer.stop();
        } else if (previousPhase === "speaking") {
            timeTakenRef.current = 0;
        }
        await mic.stop(); // aakhri bola hua tukda bhi answer me aa jaaye
        if (overrideText !== undefined) setAnswer(overrideText);

        setError("");
        try {
            const res = await submitAnswer(interviewId, {
                questionIndex: index,
                answer: answerRef.current.trim(),
                timeTakenSec: timeTakenRef.current,
            });
            const { scores } = res.data;
            if (answerRef.current.trim()) toast.success(`Answer scored ${average(scores)}/10`);
            else toast("Question skipped");
            dispatch(answerEvaluated(res.data)); // currentIndex +1 → parent agla question dikhata hai
        } catch (err) {
            // pichla submit server tak pahunch gaya tha (bas jawab nahi aaya) — wahi score le lo
            if (err.response?.data?.code === "ALREADY_ANSWERED") {
                try {
                    const saved = (await getInterview(interviewId)).data.interview.questions[index];
                    if (saved.scores) {
                        dispatch(
                            answerEvaluated({ questionIndex: index, scores: saved.scores, feedback: saved.feedback }),
                        );
                        return;
                    }
                } catch {
                    /* neeche wala error dikhao */
                }
            }
            setError(getErrorMessage(err));
            changePhase("error");
        }
    };

    useEffect(() => {
        submitRef.current = submit;
    });

    const isAnswering = phase === "answering";
    const timePercent = timer.running || isAnswering ? (timer.remaining / question.timeLimitSec) * 100 : 100;
    const lowTime = isAnswering && timer.remaining <= 10;

    const clock = isAnswering
        ? `${String(Math.floor(timer.remaining / 60)).padStart(2, "0")}:${String(timer.remaining % 60).padStart(2, "0")}`
        : `${String(Math.floor(question.timeLimitSec / 60)).padStart(2, "0")}:${String(question.timeLimitSec % 60).padStart(2, "0")}`;

    return (
        <div className="flex flex-col gap-4">
            {/* question */}
            <div className="bg-paper border border-line rounded-2xl p-6 sm:p-8">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="eyebrow">
                        Question {index + 1} of {total}
                    </span>
                    <span
                        className={`font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full ${DIFFICULTY_STYLE[question.difficulty]}`}
                    >
                        {question.difficulty}
                    </span>
                </div>
                <p className="text-2xl sm:text-[1.75rem] font-bold leading-snug tracking-[-0.02em]">
                    {question.question}
                </p>
                <button
                    type="button"
                    onClick={repeatQuestion}
                    disabled={!isAnswering}
                    className="mt-5 text-sm text-muted hover:text-ink flex items-center gap-1.5 disabled:opacity-40"
                >
                    <BsArrowRepeat /> Repeat question
                </button>
            </div>

            {/* timer */}
            <div className="bg-paper border border-line rounded-2xl px-6 py-4 flex items-center gap-5">
                <span
                    className={`font-mono text-3xl tabular-nums tracking-tight ${lowTime ? "text-bad" : "text-ink"}`}
                    aria-label="Time left"
                >
                    {clock}
                </span>
                <div className="flex-1">
                    <p className="eyebrow mb-2">{phase === "speaking" ? "Listen to the question…" : "Time left"}</p>
                    <div className="h-1.5 bg-line rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${lowTime ? "bg-bad" : "bg-ink"}`}
                            style={{ width: `${timePercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* answer */}
            <div className="bg-paper border border-line rounded-2xl p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <label htmlFor="answer" className="text-sm font-semibold">
                        Your answer{" "}
                        {mic.supported && <span className="text-muted font-normal">(speak, or edit the text)</span>}
                    </label>
                    {mic.supported && (
                        <button
                            type="button"
                            onClick={() => (mic.listening ? mic.stop() : mic.start())}
                            disabled={!isAnswering || mic.transcribing}
                            className={`h-9 flex items-center gap-2 text-sm font-semibold px-4 rounded-full transition-colors disabled:opacity-40 ${
                                mic.listening
                                    ? "bg-signal text-signal-ink"
                                    : "border border-line-strong text-ink hover:border-ink"
                            }`}
                        >
                            {mic.listening ? (
                                <>
                                    <span className="font-mono text-[10px] tracking-widest uppercase">On air</span>
                                    <LevelMeter tone="signal-ink" bars={5} className="h-3.5" />
                                    <BsMic /> {mic.live ? "Listening" : "Recording"}
                                </>
                            ) : (
                                <>
                                    <BsMicMute /> Mic off
                                </>
                            )}
                        </button>
                    )}
                </div>

                <textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={!isAnswering}
                    rows={6}
                    maxLength={5000}
                    placeholder={
                        phase === "speaking"
                            ? "The interviewer is asking the question…"
                            : !mic.supported
                              ? "Type your answer here."
                              : mic.live
                                ? "Start speaking — your words appear here."
                                : "Start speaking — your words appear here when you turn the mic off (or submit)."
                    }
                    className="field resize-y leading-relaxed"
                />
                {mic.interim && <p className="text-sm text-muted italic mt-2">{mic.interim}</p>}
                {/* recording wala tareeka (Firefox, Brave...) — text server se aa raha hai */}
                {mic.transcribing && (
                    <p className="text-sm text-muted mt-2 flex items-center gap-2">
                        <LevelMeter bars={5} className="h-3.5" />
                        Converting your voice to text…
                    </p>
                )}
                {!mic.supported && (
                    <p className="text-xs text-muted mt-2">
                        Voice input is not available in this browser — please type your answer.
                    </p>
                )}
                {mic.error && <p className="text-xs text-warn mt-2">{mic.error}</p>}
                {error && (
                    <p className="text-sm text-bad bg-bad-wash rounded-lg p-3 mt-3">
                        {error} Your answer is kept — press Submit to try again.
                    </p>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-5">
                    <button
                        type="button"
                        onClick={() => submit("")}
                        disabled={phase === "submitting"}
                        className="btn btn-line sm:w-32"
                    >
                        Skip
                    </button>
                    <button
                        type="button"
                        onClick={() => submit()}
                        disabled={!(isAnswering || phase === "error")}
                        className="btn btn-ink flex-1"
                    >
                        {phase === "submitting" ? (
                            <>
                                <LevelMeter tone="ground" bars={5} className="h-4" />
                                Evaluating your answer…
                            </>
                        ) : index === total - 1 ? (
                            "Submit & finish"
                        ) : (
                            "Submit answer"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuestionRound;
