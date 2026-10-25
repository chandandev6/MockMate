// ek IP / user ek minute me kitni requests bhej sakta hai — bots se server aur AI bill dono bachao
// counter Redis me — sab server copies ek hi counter dekhti hai, restart par bhi reset nahi hota.
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis, isRedisReady } from "../config/redis.js";
import { getLogger } from "../lib/logger.js";

const ONE_MINUTE = 60 * 1000;

// har limiter ka apna store + apna prefix (rl:global:<ip>, rl:auth:<ip>...) — warna sab ek hi counter badhate
const makeStore = (name) =>
    redis
        ? new RedisStore({
              prefix: `rl:${name}:`,
              sendCommand: (command, ...args) => {
                  // Redis down → turant error (wait nahi) → neeche passOnStoreError request jaane deta hai.
                  // SCRIPT LOAD startup par connect se pehle aata hai — use queue me rukne do
                  if (!isRedisReady() && command !== "SCRIPT") throw new Error("Redis not ready");
                  return redis.call(command, ...args);
              },
          })
        : undefined;

// sab limiters ki common settings
const common = {
    standardHeaders: "draft-8", // client ko RateLimit header bhejo (kitni bachi, kab reset)
    legacyHeaders: false, // purane X-RateLimit-* headers nahi chahiye
    // Redis down = limit check nahi ho sakta → request rokne ki jagah jaane do (fail open). App band hona bura hai
    passOnStoreError: true,
    // library ke errors humare logger me. Redis down ho to har request par log mat karo (1000 req/s = 1000 lines/s) —
    // "Redis down" ek baar config/redis.js log kar chuka hai. Sirf Redis chalte hue aaye ajeeb errors dikhao
    logger: {
        warn: (...args) => getLogger().warn(...args),
        error: (error, message) => {
            if (isRedisReady()) getLogger().warn({ reason: error?.message }, message);
        },
    },
};

// har route par — key = IP (login se pehle bhi kaam karta hai)
export const globalLimiter = rateLimit({
    windowMs: ONE_MINUTE,
    limit: 100,
    store: makeStore("global"),
    ...common,
    message: { success: false, message: "Too many requests, please try again in a minute" },
});

// login / register / resend par — password guess karne (brute force) aur email spam se bachav
export const authLimiter = rateLimit({
    windowMs: 15 * ONE_MINUTE,
    limit: 10,
    store: makeStore("auth"),
    ...common,
    message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

// sirf AI wale routes par, isAuth ke BAAD lagana — tab req.userId milta hai
// key = userId, taaki ek hostel/college ki shared IP par sab block na ho
export const aiLimiter = rateLimit({
    windowMs: ONE_MINUTE,
    limit: 10,
    store: makeStore("ai"),
    ...common,
    // userId na ho (galti se isAuth se pehle laga diya) to IP se count karo
    keyGenerator: (req) => req.userId ?? ipKeyGenerator(req.ip),
    message: { success: false, message: "Too many AI requests, please wait a minute" },
});

// voice → text (Whisper). aiLimiter se alag — ek answer me mic kai baar on/off ho sakta hai, wo answer ki limit na khaaye
export const voiceLimiter = rateLimit({
    windowMs: ONE_MINUTE,
    limit: 20,
    store: makeStore("voice"),
    ...common,
    keyGenerator: (req) => req.userId ?? ipKeyGenerator(req.ip),
    message: { success: false, message: "Too many voice requests, please wait a minute or type your answer" },
});

// interviewer ki awaaz (Orpheus) — ek question = 1-3 tukde (sentences), "Repeat question" bhi. Alag counter
export const ttsLimiter = rateLimit({
    windowMs: ONE_MINUTE,
    limit: 40,
    store: makeStore("tts"),
    ...common,
    keyGenerator: (req) => req.userId ?? ipKeyGenerator(req.ip),
    message: { success: false, message: "Too many voice requests, please wait a minute" },
});
