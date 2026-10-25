import { env } from "../../config/env.js";
import { textToSpeech } from "../../lib/ai/voice.js";
import AppError from "../../utils/AppError.js";

// fail → 503, client chupchap browser ki (robotic) awaaz se bol deta hai — interview nahi rukta
export const speak = async (text, gender) => {
    if (!env.GROQ_API_KEY) {
        throw new AppError(503, "Server voice is not available.", "VOICE_UNAVAILABLE");
    }
    try {
        return await textToSpeech(text, gender);
    } catch {
        // asli error voice.js log kar chuka
        throw new AppError(503, "Server voice is not available right now.", "VOICE_UNAVAILABLE");
    }
};
