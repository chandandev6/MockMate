// sirf express app — listen yaha nahi (tests me supertest se directly use kar sakte hai)
import express from "express";
import mongoose from "mongoose";
import * as Sentry from "@sentry/node";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/user/user.routes.js";
import interviewRouter from "./modules/interview/interview.routes.js";
import creditRouter from "./modules/credit/credit.routes.js";
import paymentRouter, { webhookRouter } from "./modules/payment/payment.routes.js";
import jobRouter from "./modules/job/job.routes.js";
import transcribeRouter from "./modules/transcribe/transcribe.routes.js";
import ttsRouter from "./modules/tts/tts.routes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import { globalLimiter } from "./middlewares/rateLimit.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { env } from "./config/env.js";
import { redis, isRedisReady } from "./config/redis.js";

const app = express();

// ORDER MATTERS — request upar se neeche har middleware se guzarti hai

// production me proxy beech me hote hai (Vercel /api rewrite → Render) — X-Forwarded-For se user ki asli IP lo.
// Kitne proxy = TRUST_PROXY_HOPS (local me off, warna koi bhi fake header bhej ke apni IP badal sakta hai)
app.set("trust proxy", env.NODE_ENV === "production" ? env.TRUST_PROXY_HOPS : false);

app.use(requestLogger); // sabse pehle — har request ko ID mile aur har response (errors bhi) log ho
app.use(helmet()); // security headers — sabse pehle, taaki error responses par bhi lage
app.use(
    cors({
        // limiter se pehle, taaki 429 ka message bhi browser padh sake
        origin: env.CLIENT_URL.split(","),
        credentials: true,
    }),
);
app.use(compression()); // responses gzip — kam data, fast load

// load balancer / uptime checks ke liye — limiter se upar, taaki ye kabhi block na ho
app.get("/health", (req, res) => {
    return res.json({ status: "ok" });
});

// Redis ka haal — sirf report, ready/not-ready iss par nahi: sab servers ek hi Redis use karte hai, to Redis down par
// sab "not ready" ho jaate aur poora app band. Bina Redis ke bhi hum chal sakte hai (fail open), isliye nahi rokte
const redisHealth = async () => {
    if (!redis) return "disabled";
    if (!isRedisReady()) return "down";
    try {
        await redis.ping();
        return "ok";
    } catch {
        return "down";
    }
};

// /health = process zinda hai; /ready = requests serve kar sakta hai (DB juda hai). Deploy platform isse traffic bhejta hai
app.get("/ready", async (req, res) => {
    const redisStatus = await redisHealth();
    // readyState 1 = connected. Pehle ye check, warna toote DB par ping 30s tak latka rahega
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ status: "not ready", db: "disconnected", redis: redisStatus });
    }
    try {
        await mongoose.connection.db.admin().ping();
        return res.json({ status: "ready", db: "ok", redis: redisStatus });
    } catch (error) {
        req.log.warn({ err: error }, "Readiness DB ping failed");
        return res.status(503).json({ status: "not ready", db: "ping failed", redis: redisStatus });
    }
});

app.use(globalLimiter); // 100 req/min per IP — JSON parse / DB se pehle hi flood rok do

// Razorpay webhook ko RAW body chahiye (signature bytes par) — isliye express.json() se PEHLE
app.use("/api/payment/webhook", webhookRouter);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// naya feature = naya module + yaha ek line
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/credits", creditRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/transcribe", transcribeRouter);
app.use("/api/tts", ttsRouter);

app.get("/", (req, res) => {
    return res.json({ message: "Server started" });
});

app.use(notFound);
// 5xx errors Sentry ko bhejo (DSN na ho to kuch nahi karta) — humare errorHandler se pehle, taaki error use mile
Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

export default app;
