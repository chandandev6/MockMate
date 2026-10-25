import express from "express";
import isAuth from "../../middlewares/isAuth.js";
import { ttsLimiter } from "../../middlewares/rateLimit.js";
import validate from "../../middlewares/validate.js";
import { ttsSchema } from "./tts.schema.js";
import { textToSpeech } from "./tts.controller.js";

const ttsRouter = express.Router();

// sirf un browsers ke liye jinke paas natural voice nahi (Linux Firefox/Brave). Order: login → limit → body check → Groq
ttsRouter.post("/", isAuth, ttsLimiter, validate({ body: ttsSchema }), textToSpeech);

export default ttsRouter;
