import express from "express";
import isAuth from "../../middlewares/isAuth.js";
import { voiceLimiter } from "../../middlewares/rateLimit.js";
import { audioUpload } from "../../middlewares/upload.js";
import { transcribeAnswer } from "./transcribe.controller.js";

const transcribeRouter = express.Router();

// sirf un browsers ke liye jinme apna speech API nahi (Firefox, Brave...). Order: login → limit → tab file padho
transcribeRouter.post("/", isAuth, voiceLimiter, audioUpload.single("audio"), transcribeAnswer);

export default transcribeRouter;
