import axios from "axios";
import { env } from "../../config/env.js";
import { getLogger } from "../logger.js";

// Groq ke audio models — Firefox/Brave jaise browsers ke liye (unke paas apna speech-to-text / achhi voice nahi)
const WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const SPEECH_URL = "https://api.groq.com/openai/v1/audio/speech";

// Groq file ka type extension se pehchanta hai — browser jo bheje uska sahi naam
const EXTENSIONS = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "mp4",
    "audio/x-m4a": "m4a",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
};

// audio (RAM me bytes) → text. Groq Whisper = OpenAI jaisa API, multipart form me file bhejte hai
export const transcribeAudio = async (buffer, mimetype) => {
    const type = mimetype.split(";")[0]; // "audio/webm;codecs=opus" → "audio/webm"
    const form = new FormData();
    form.append("file", new Blob([buffer], { type }), `answer.${EXTENSIONS[type] ?? "webm"}`);
    form.append("model", env.GROQ_WHISPER_MODEL);
    form.append("language", "en"); // interview English me — language guess karne ki galti (Hindi script) nahi hogi
    form.append("temperature", "0");

    try {
        const response = await axios.post(WHISPER_URL, form, {
            headers: { Authorization: `Bearer ${env.GROQ_API_KEY}` },
            timeout: 30000,
        });
        return (response.data?.text ?? "").trim();
    } catch (error) {
        getLogger().error({ whisperError: error.response?.data?.error?.message || error.message }, "Whisper failed");
        throw error;
    }
};

// text → awaaz (Groq Orpheus). Returns wav bytes (Buffer)
export const textToSpeech = async (text, gender) => {
    try {
        const response = await axios.post(
            SPEECH_URL,
            {
                model: env.GROQ_TTS_MODEL,
                voice: gender === "male" ? env.GROQ_TTS_VOICE_MALE : env.GROQ_TTS_VOICE_FEMALE,
                input: text,
                response_format: "wav",
            },
            {
                headers: { Authorization: `Bearer ${env.GROQ_API_KEY}` },
                responseType: "arraybuffer", // JSON nahi, audio ke bytes
                timeout: 30000,
            },
        );
        return Buffer.from(response.data);
    } catch (error) {
        // error ka body bhi arraybuffer me aata hai — padhne layak text banao
        const body = error.response?.data;
        const detail = body instanceof ArrayBuffer ? Buffer.from(body).toString("utf8").slice(0, 300) : error.message;
        getLogger().error({ ttsError: detail }, "Text to speech failed");
        throw error;
    }
};
