// voice → text server se (Groq Whisper) — sirf un browsers ke liye jinme apna speech API nahi (Firefox, Brave...)
import api from "./axios.js";

const EXTENSIONS = { "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "mp4" };

// recording FormData me — field ka naam "audio" (server multer isi naam se padhta hai). Returns { data: { text } }
export const transcribeAudio = (blob) => {
    const form = new FormData();
    form.append("audio", blob, `answer.${EXTENSIONS[blob.type] ?? "webm"}`);
    return api.post("/api/transcribe", form, { timeout: 30000 }).then((response) => response.data);
};
