// user ka bola hua → text. Do tareeke (hybrid):
// 1. browser ka apna speech API (Chrome/Edge/Safari) — free, bolte-bolte text dikhta hai
// 2. baaki sab (Firefox, Brave, Opera...) — mic record karo → server (Groq Whisper) → text, mic band karne par
import { useCallback, useEffect, useRef, useState } from "react";
import { transcribeAudio } from "../api/transcribe.api.js";
import getErrorMessage from "../utils/getErrorMessage.js";

// Brave me API dikhta hai par Google ki speech service block hai — mic "Listening" dikhata, likhta kuch nahi
const isBrave = typeof navigator !== "undefined" && Boolean(navigator.brave);
const SpeechRecognition =
    typeof window !== "undefined" && !isBrave ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const canRecord =
    typeof window !== "undefined" && Boolean(window.MediaRecorder && navigator.mediaDevices?.getUserMedia);

const MIC_DENIED = "Microphone permission was denied. Allow mic access, or type your answer.";
const NO_MIC = "No microphone found. Please type your answer.";

// ye errors aaye to dobara try karne ka fayda nahi — user ko type karne bolo
const FATAL_ERRORS = {
    "not-allowed": MIC_DENIED,
    "audio-capture": NO_MIC,
};

// browser ki speech service hi nahi chalti (Opera/Vivaldi/Linux Chromium me Google key nahi, Safari me Siri band) —
// API hai par kaam nahi karta → recording wale tareeke par shift
const SERVICE_ERRORS = ["network", "service-not-allowed"];
// ek baar toota to har naye question par dobara try mat karo (page reload tak yaad)
let serviceBroken = false;

// ---------- 1. browser ka apna speech API ----------

// onFinalText(chunk) = ek pakka hua tukda (component use answer me jodta hai). interim = abhi bol raha hai (grey)
function useBrowserRecognition(onFinalText) {
    const [listening, setListening] = useState(false);
    const [interim, setInterim] = useState("");
    const [error, setError] = useState("");
    const [broken, setBroken] = useState(serviceBroken);

    const recognitionRef = useRef(null);
    const wantListeningRef = useRef(false); // user ne band kiya ya browser ne khud? (Chrome chup rehne par khud band karta hai)
    const stopWaitersRef = useRef([]);
    const onFinalRef = useRef(onFinalText);

    useEffect(() => {
        onFinalRef.current = onFinalText; // hamesha latest callback — purana closure nahi
    });

    const start = useCallback(() => {
        if (!SpeechRecognition || wantListeningRef.current) return;
        setError("");
        wantListeningRef.current = true;

        const recognition = new SpeechRecognition();
        recognition.continuous = true; // ek sentence ke baad band mat ho
        recognition.interimResults = true; // bolte-bolte text dikhao
        recognition.lang = "en-IN"; // Indian English accent better samajhta hai

        recognition.onresult = (event) => {
            let interimText = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) onFinalRef.current(result[0].transcript.trim());
                else interimText += result[0].transcript;
            }
            setInterim(interimText);
        };

        recognition.onerror = (event) => {
            if (SERVICE_ERRORS.includes(event.error)) {
                wantListeningRef.current = false;
                serviceBroken = true;
                setBroken(true);
            } else if (FATAL_ERRORS[event.error]) {
                wantListeningRef.current = false;
                setError(FATAL_ERRORS[event.error]);
            }
            // "no-speech" / "aborted" → onend khud restart kar dega
        };

        recognition.onend = () => {
            setInterim("");
            // Chrome ~kuch second chup rehne par khud band karta hai — user ne band nahi kiya to phir chalu
            if (wantListeningRef.current) {
                try {
                    recognition.start();
                    return;
                } catch {
                    wantListeningRef.current = false;
                }
            }
            setListening(false);
            stopWaitersRef.current.forEach((resolve) => resolve());
            stopWaitersRef.current = [];
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
            setListening(true);
        } catch {
            wantListeningRef.current = false;
        }
    }, []);

    // promise: band hone tak ruko — band hote waqt Chrome aakhri bola hua tukda bhejta hai, wo answer me aa jaaye
    const stop = useCallback(() => {
        const recognition = recognitionRef.current;
        if (!recognition || (!wantListeningRef.current && !listening)) return Promise.resolve();
        wantListeningRef.current = false;
        return new Promise((resolve) => {
            stopWaitersRef.current.push(resolve);
            setTimeout(resolve, 1500); // onend na aaye to bhi submit atke nahi
            recognition.stop();
        });
    }, [listening]);

    // page chhoda → mic band
    useEffect(
        () => () => {
            wantListeningRef.current = false;
            recognitionRef.current?.abort();
        },
        [],
    );

    return { supported: Boolean(SpeechRecognition), broken, listening, interim, error, start, stop };
}

// ---------- 2. record → server (Whisper) ----------

// pehla jo browser record kar sake: Chrome/Firefox = webm/ogg (opus, chhoti file), Safari = mp4
const RECORDER_TYPES = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm", "audio/mp4"];
export const pickMimeType = (isTypeSupported) => RECORDER_TYPES.find((type) => isTypeSupported(type)) ?? "";

const SILENCE_LEVEL = 12; // 0-128 me se — isse kam = sirf hawa/hum, bola kuch nahi

// chup recording server ko mat bhejo — Whisper khaali audio me bhi "Thank you." jaisa kuch bana deta hai (aur call bekaar)
const watchVolume = (stream) => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return { heard: () => true, close: () => {} };

    const context = new AudioContextClass();
    const analyser = context.createAnalyser();
    context.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    let heard = false;
    const timer = setInterval(() => {
        analyser.getByteTimeDomainData(samples);
        // 128 = khamoshi — usse jitna door, awaaz utni tez
        if (samples.some((value) => Math.abs(value - 128) > SILENCE_LEVEL)) heard = true;
    }, 100);

    return {
        // context "running" nahi (browser ne bina click ke audio roka) → naap hi nahi paaye, to bhej do (answer na khoye)
        heard: () => heard || context.state !== "running",
        close: () => {
            clearInterval(timer);
            context.close();
        },
    };
};

const stopTracks = (stream) => stream.getTracks().forEach((track) => track.stop()); // browser ka mic wala laal dot band

function useRecordedRecognition(onFinalText) {
    const [listening, setListening] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [error, setError] = useState("");

    // ek recording = { recorder, cancelled, done } — mic permission ka popup khula ho tab bhi stop() sahi chale
    const sessionRef = useRef(null);
    const mountedRef = useRef(true);
    const onFinalRef = useRef(onFinalText);

    useEffect(() => {
        onFinalRef.current = onFinalText;
    });

    const start = useCallback(async () => {
        if (!canRecord || sessionRef.current) return;
        setError("");
        const session = { recorder: null, cancelled: false, done: Promise.resolve() };
        sessionRef.current = session;
        setListening(true);

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            if (sessionRef.current === session) sessionRef.current = null;
            setListening(false);
            setError(err.name === "NotAllowedError" ? MIC_DENIED : NO_MIC);
            return;
        }
        // permission aate-aate user ne band kar diya / page chhod diya
        if (session.cancelled) {
            stopTracks(stream);
            return;
        }

        const mimeType = pickMimeType((type) => MediaRecorder.isTypeSupported(type));
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        const chunks = [];
        const volume = watchVolume(stream);
        recorder.ondataavailable = (event) => {
            if (event.data.size) chunks.push(event.data);
        };
        session.done = new Promise((resolve) => {
            recorder.onstop = async () => {
                stopTracks(stream);
                const heard = volume.heard();
                volume.close();
                // "audio/webm;codecs=opus" → "audio/webm" (server/Groq file type isi se pehchante hai)
                const type = (recorder.mimeType || mimeType || "audio/webm").split(";")[0];
                const blob = new Blob(chunks, { type });
                if (heard && blob.size > 0 && mountedRef.current) {
                    setTranscribing(true);
                    try {
                        const res = await transcribeAudio(blob);
                        if (res.data.text) onFinalRef.current(res.data.text);
                    } catch (err) {
                        setError(getErrorMessage(err));
                    }
                    setTranscribing(false);
                }
                resolve();
            };
        });
        session.recorder = recorder;
        recorder.start();
    }, []);

    // promise: text answer me aa jaane tak ruko — submit isi ka wait karta hai, warna aakhri bola hua chhoot jaata
    const stop = useCallback(() => {
        const session = sessionRef.current;
        if (!session) return Promise.resolve();
        sessionRef.current = null;
        setListening(false);
        if (!session.recorder) {
            session.cancelled = true;
            return Promise.resolve();
        }
        if (session.recorder.state !== "inactive") session.recorder.stop();
        return session.done;
    }, []);

    // page chhoda → mic band, server ko kuch nahi bhejna (mountedRef false)
    useEffect(() => {
        mountedRef.current = true; // dev (StrictMode) me effect do baar chalta hai
        return () => {
            mountedRef.current = false;
            const session = sessionRef.current;
            sessionRef.current = null;
            if (!session) return;
            session.cancelled = true;
            if (session.recorder?.state !== "inactive") session.recorder?.stop();
        };
    }, []);

    return { supported: canRecord, listening, transcribing, interim: "", error, start, stop };
}

// ---------- component isi ko use karta hai ----------

// dono hooks hamesha chalte hai (React rule: hooks if ke andar nahi), par kaam sirf ek karta hai.
// live = bolte-bolte text aata hai (browser API); false = mic band / submit karne par aata hai (recording)
function useSpeechRecognition(onFinalText) {
    const browser = useBrowserRecognition(onFinalText);
    const recorder = useRecordedRecognition(onFinalText);
    const useBrowser = browser.supported && !browser.broken;

    // browser ki service sun hi rahi thi aur toot gayi → user ko pata chale bina recording chalu
    const { broken } = browser;
    const startRecorder = recorder.start;
    useEffect(() => {
        if (broken) startRecorder();
    }, [broken, startRecorder]);

    if (useBrowser) return { ...browser, transcribing: false, live: true };
    return { ...recorder, live: false };
}

export default useSpeechRecognition;
