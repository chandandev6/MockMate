import { env } from "../../config/env.js";
import { transcribeAudio } from "../../lib/ai/voice.js";
import AppError from "../../utils/AppError.js";

// code VOICE_UNAVAILABLE → frontend "type karo" bolta hai (answer ka kaam chalta rahe)
export const transcribe = async (buffer, mimetype) => {
    if (!env.GROQ_API_KEY) {
        throw new AppError(
            503,
            "Voice typing is not available right now. Please type your answer.",
            "VOICE_UNAVAILABLE",
        );
    }
    try {
        return await transcribeAudio(buffer, mimetype);
    } catch {
        // asli error whisper.js log kar chuka — user ko saaf message
        throw new AppError(
            503,
            "Could not convert your voice to text. Please try again or type your answer.",
            "VOICE_UNAVAILABLE",
        );
    }
};
