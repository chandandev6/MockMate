import AppError from "../../utils/AppError.js";
import { sendSuccess } from "../../utils/response.js";
import { transcribe } from "./transcribe.service.js";

// multer ne recording req.file me daali (RAM me) — save nahi karte, text banake bhool jaate hai
export const transcribeAnswer = async (req, res) => {
    if (!req.file) {
        throw new AppError(400, 'Please attach the recording in the "audio" field.', "AUDIO_MISSING");
    }
    const text = await transcribe(req.file.buffer, req.file.mimetype);
    return sendSuccess(res, { message: "Transcribed", data: { text } });
};
