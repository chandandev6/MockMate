// .env ko startup par hi check karo — kuch missing/galat ho to server start hi mat hone do (fail fast)
import dotenv from "dotenv";
import { z } from "zod";

// tests apne fake values khud dete hai (vitest.config.js) — asli .env (Atlas, Gmail SMTP, Razorpay) kabhi na padhe
if (process.env.NODE_ENV !== "test") dotenv.config({ quiet: true });

// har variable ka rule: kaisa hona chahiye, aur na ho to default kya
const envSchema = z
    .object({
        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
        PORT: z.coerce.number().int().positive().default(8000),

        MONGODB_URL: z.string().min(1),
        MONGO_POOL_SIZE: z.coerce.number().int().positive().default(50),

        JWT_SECRET: z.string().min(16, "must be at least 16 characters"),

        CLIENT_URL: z.string().default("http://localhost:5173"),
        FIREBASE_PROJECT_ID: z.string().min(1),

        // kaunsi AI company: groq = bahut tez (free tier limits ke saath), openrouter = bahut saare models + backup list
        AI_PROVIDER: z.enum(["openrouter", "groq"]).default("openrouter"),
        // console.groq.com → API Keys. Sirf AI_PROVIDER=groq me zaruri (neeche superRefine)
        GROQ_API_KEY: z.string().optional(),
        GROQ_MODEL: z.string().default("openai/gpt-oss-120b"),
        // voice → text (Firefox/Brave jaise browsers jinme apna speech API nahi). Isi GROQ_API_KEY se chalta hai
        GROQ_WHISPER_MODEL: z.string().default("whisper-large-v3-turbo"),
        // AI interviewer ki awaaz un browsers ke liye jinke paas sirf robotic voice hai (Linux Firefox/Brave = eSpeak).
        // Orpheus pehli baar use karne se pehle Groq console me terms accept karne padte hai
        GROQ_TTS_MODEL: z.string().default("canopylabs/orpheus-v1-english"),
        GROQ_TTS_VOICE_FEMALE: z.string().default("hannah"),
        GROQ_TTS_VOICE_MALE: z.string().default("troy"),

        // sirf AI_PROVIDER=openrouter me zaruri (neeche superRefine)
        OPENROUTER_API_KEY: z.string().optional(),
        OPENROUTER_MODEL: z.string().default("anthropic/claude-haiku-4.5"),
        // comma se alag backup models — main busy/rate-limited ho to OpenRouter agla try karta hai (free models ke liye zaruri)
        OPENROUTER_FALLBACK_MODELS: z
            .string()
            .default("")
            .transform((list) =>
                list
                    .split(",")
                    .map((model) => model.trim())
                    .filter(Boolean),
            ),

        // email bhejne ke liye SMTP (Gmail: smtp.gmail.com + App Password) — local me optional, na ho to link terminal me print
        SMTP_HOST: z.string().optional(),
        SMTP_PORT: z.coerce.number().int().positive().default(587),
        SMTP_USER: z.string().optional(),
        SMTP_PASS: z.string().optional(),
        MAIL_FROM: z.string().optional(), // e.g. "MockMate <yourmail@gmail.com>" — na ho to SMTP_USER

        // Razorpay (credits kharidna). Dashboard → Test Mode → API Keys. Na ho to payments band (baaki app chalta hai)
        RAZORPAY_KEY_ID: z.string().optional(),
        RAZORPAY_KEY_SECRET: z.string().optional(),
        // Dashboard → Webhooks me jo secret khud likha — webhook ka signature isse check hota hai
        RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

        // Redis: rate-limit counters + cache + job queue (BullMQ). Local: `docker compose up -d` → redis://localhost:6380.
        // Queue ke bina resume / report nahi bante, isliye ab hamesha zaruri
        REDIS_URL: z.string().min(1, "is required (run `docker compose up -d`, then redis://localhost:6380)"),
        // ek worker process ek saath kitne AI jobs chalaye (AI = network wait, CPU nahi — 10 aaram se)
        WORKER_CONCURRENCY: z.coerce.number().int().positive().default(10),
        // "true" = API process hi worker bhi chalaye (Render free plan — alag worker service paid hai).
        // z.coerce.boolean nahi: wo "false" string ko bhi true maan leta hai
        RUN_WORKER_IN_API: z
            .enum(["true", "false"])
            .default("false")
            .transform((value) => value === "true"),
        // production me aage kitne proxy hai: Render = 1, Vercel proxy (/api rewrite) + Render = 2.
        // Galat number = rate limiter ko user ki jagah proxy ki IP dikhegi (sab users ek hi limit share karenge)
        TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(1),

        // kitna detail log ho: debug < info < warn < error. Production me "info" kaafi hai
        LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
        // sentry.io → Project → Client Keys (DSN). Na ho to error reporting band
        SENTRY_DSN: z.string().optional(),
    })
    .superRefine((env, ctx) => {
        // jo provider chuna hai, uski key honi hi chahiye — warna pehle interview par hi AI fail hota
        const aiKey = env.AI_PROVIDER === "groq" ? "GROQ_API_KEY" : "OPENROUTER_API_KEY";
        if (!env[aiKey]) {
            ctx.addIssue({ code: "custom", path: [aiKey], message: `is required when AI_PROVIDER=${env.AI_PROVIDER}` });
        }

        // production me asli users ko email jaana hi chahiye — bina SMTP ke server start mat karo
        if (env.NODE_ENV === "production") {
            for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]) {
                if (!env[key]) ctx.addIssue({ code: "custom", path: [key], message: "is required in production" });
            }
            // cookie "secure" hai (sirf HTTPS par jaati hai) — http:// wala frontend login hi nahi kar payega
            for (const url of env.CLIENT_URL.split(",")) {
                if (!url.trim().startsWith("https://")) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["CLIENT_URL"],
                        message: `must use https:// in production (got "${url}")`,
                    });
                }
            }
        }
    });

// safeParse throw nahi karta — { success, data, error } deta hai, taaki hum saaf message print kar sake.
// Alag function taaki tests apna object de ke rules check kar sake (process.env chhede bina)
export const parseEnv = (source) => envSchema.safeParse(source);

const result = parseEnv(process.env);

if (!result.success) {
    console.error("❌ Invalid environment variables in server/.env:");
    for (const issue of result.error.issues) {
        console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
}

// baaki files process.env ki jagah ye use karengi — checked + sahi type (PORT number hai, string nahi)
export const env = result.data;
