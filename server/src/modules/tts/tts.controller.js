import { speak } from "./tts.service.js";

// JSON nahi, seedha audio bytes — <audio> isse play karta hai (base64 JSON me 33% bada hota).
// Errors phir bhi JSON me hi aate hai (errorHandler)
export const textToSpeech = async (req, res) => {
    const audio = await speak(req.body.text, req.body.gender);
    res.set("Cache-Control", "private, max-age=3600"); // same question dobara (Repeat) → browser cache
    return res.type("audio/wav").send(audio);
};
