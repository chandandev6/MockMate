// AI interviewer ki awaaz. Hybrid:
// 1. browser ke paas natural voice hai (Chrome Google / Edge Microsoft / Mac Samantha) → browser hi bolta hai (free, turant)
// 2. sirf robotic voice (Linux Firefox/Brave = eSpeak) → server se awaaz (Groq Orpheus) → <audio> me play
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSpeech } from "../api/tts.api.js";

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

// avatar ke hisaab se English voice dhundo (har OS/browser me naam alag hote hai — best effort)
const FEMALE = /female|zira|samantha|victoria|karen|susan|heera|veena|moira|tessa/i;
const MALE = /\bmale|david|daniel|alex|fred|ravi|rishi|george|mark/i;
// natural sounding voices (Chrome ki Google, Edge ki Microsoft Online/Natural, Mac ki Samantha/Daniel)
const NATURAL = /google|microsoft|natural|online|samantha|daniel|karen/i;

// har voice ko number do — sabse zyada wali jeete. Gender se zyada zaroori hai ki awaaz robotic na ho
const scoreVoice = (voice, hint) => {
    let score = 0;
    if (NATURAL.test(voice.name)) score += 4;
    if (voice.name.includes("+")) score -= 4; // Linux eSpeak variants ("+male8", "+grandpa") — bahut robotic
    if (hint.test(voice.name)) score += 2;
    if (/^en[-_](us|gb|in)/i.test(voice.lang)) score += 1;
    return score;
};

// browser ki awaaz chalegi ya server se laani hai?
export const isNaturalVoice = (voice) => Boolean(voice) && NATURAL.test(voice.name) && !voice.name.includes("+");

export const pickVoice = (voices, gender) => {
    const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
    const hint = gender === "male" ? MALE : FEMALE;
    let best = null;
    for (const voice of english) {
        if (!best || scoreVoice(voice, hint) > scoreVoice(best, hint)) best = voice;
    }
    return best;
};

// Chrome ki Google voices ~15 sec ke baad beech me chup ho jaati hai — isliye chhote tukde (sentence) me bolo
export const splitText = (text) =>
    text
        .split(/(?<=[.!?])\s+/) // sirf ". " par todo — "Node.js" jaise words na toote
        .flatMap((sentence) => (sentence.length > 200 ? sentence.split(/(?<=,)/) : [sentence]))
        .map((part) => part.trim())
        .filter(Boolean);

// voices kabhi der se load hoti hai (Chrome/Firefox) — khaali list = "voice nahi" maan ke server mat bulao, thoda ruko
const loadVoices = () =>
    new Promise((resolve) => {
        const voices = synth?.getVoices() ?? [];
        if (!synth || voices.length) return resolve(voices);
        const done = () => resolve(synth.getVoices());
        synth.addEventListener("voiceschanged", done, { once: true });
        setTimeout(done, 1000);
    });

// ek hi sentence dobara (Repeat question) → server ko dobara mat bulao. Promise rakhte hai, taaki saath aaye 2 call bhi ek hi request
const audioCache = new Map();
const MAX_CACHED = 30;
const getSpeechUrl = (text, gender) => {
    const key = `${gender}|${text}`;
    if (!audioCache.has(key)) {
        const promise = fetchSpeech(text, gender).then((blob) => URL.createObjectURL(blob));
        promise.catch(() => audioCache.delete(key)); // fail → agli baar phir try
        audioCache.set(key, promise);
        if (audioCache.size > MAX_CACHED) {
            const [oldestKey, oldest] = audioCache.entries().next().value;
            audioCache.delete(oldestKey);
            oldest.then((url) => URL.revokeObjectURL(url)).catch(() => {}); // RAM khali karo
        }
    }
    return audioCache.get(key);
};

// audio khatam / ruka (cancel) → resolve. Play hi na ho (autoplay block) → reject → browser voice se bolenge
const playAudio = (audio, url) =>
    new Promise((resolve, reject) => {
        audio.onended = resolve;
        audio.onpause = resolve;
        audio.onerror = () => reject(new Error("Audio could not be played"));
        audio.src = url;
        audio.play().catch(reject);
    });

function useSpeechSynthesis(gender) {
    const [speaking, setSpeaking] = useState(false);
    const audioRef = useRef(null);
    // har speak()/cancel() naya number — purana chal raha speak() dekhe ki wo "purana" ho gaya aur ruk jaaye
    const runRef = useRef(0);

    useEffect(() => {
        if (!synth) return;
        synth.getVoices(); // Chrome voices baad me load karta hai — pehle hi trigger kar do
        return () => synth.cancel(); // page chhoda to bolna band
    }, []);

    useEffect(
        () => () => {
            runRef.current += 1;
            audioRef.current?.pause(); // page chhoda → server wali awaaz bhi band
        },
        [],
    );

    // browser ki awaaz — promise, bolna khatam (ya fail) hone par resolve
    const speakWithBrowser = useCallback(
        (parts, voice) =>
            new Promise((resolve) => {
                if (!synth || !parts.length) return resolve();
                synth.cancel();

                let done = false;
                const finish = () => {
                    if (done) return;
                    done = true;
                    clearTimeout(safety);
                    resolve();
                };
                // Chrome kabhi kabhi "onend" fire hi nahi karta — atakne se bachne ke liye time limit
                const safety = setTimeout(finish, 3000 + parts.join(" ").length * 100);

                // saare tukde browser ki queue me — ek ke baad ek bolega. Khatam = aakhri tukda khatam
                parts.forEach((part, i) => {
                    const utterance = new SpeechSynthesisUtterance(part);
                    if (voice) {
                        utterance.voice = voice;
                        utterance.lang = voice.lang;
                    }
                    utterance.rate = 0.95;
                    utterance.onerror = finish; // cancel() par bhi yahi aata hai
                    if (i === parts.length - 1) utterance.onend = finish;
                    synth.speak(utterance);
                });
            }),
        [],
    );

    // server ki awaaz — saare sentences ek saath maango (parallel), bajao ek ke baad ek: pehla bajte-bajte agla ready
    const speakWithServer = useCallback(
        async (parts, voice, isStale) => {
            audioRef.current ??= new Audio();
            const urls = parts.map((part) => getSpeechUrl(part, gender));
            urls.forEach((promise) => promise.catch(() => {})); // jo await nahi hue unka "unhandled rejection" na aaye
            for (let i = 0; i < parts.length; i++) {
                try {
                    const url = await urls[i];
                    if (isStale()) return;
                    await playAudio(audioRef.current, url);
                } catch {
                    // server / play fail → bacha hua browser ki (robotic) awaaz me — sawaal sunna zaruri hai
                    if (!isStale()) await speakWithBrowser(parts.slice(i), voice);
                    return;
                }
                if (isStale()) return;
            }
        },
        [gender, speakWithBrowser],
    );

    // promise — bolna khatam (ya fail) hone par resolve. Fail par bhi interview rukna nahi chahiye
    const speak = useCallback(
        async (text) => {
            const run = ++runRef.current;
            const isStale = () => runRef.current !== run;
            synth?.cancel();
            audioRef.current?.pause();

            const parts = splitText(text);
            if (!parts.length) return;

            setSpeaking(true);
            const voice = pickVoice(await loadVoices(), gender);
            if (isStale()) return;
            if (isNaturalVoice(voice)) await speakWithBrowser(parts, voice);
            else await speakWithServer(parts, voice, isStale);
            if (!isStale()) setSpeaking(false);
        },
        [gender, speakWithBrowser, speakWithServer],
    );

    const cancel = useCallback(() => {
        runRef.current += 1; // chal raha speak() ab "purana" — aage nahi bolega
        synth?.cancel(); // isse browser wala speak() bhi onerror se resolve ho jaata hai
        audioRef.current?.pause(); // server wala bhi (onpause → resolve)
        setSpeaking(false);
    }, []);

    return { supported: true, speaking, speak, cancel };
}

export default useSpeechSynthesis;
