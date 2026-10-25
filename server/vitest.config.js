// server tests — `npm test`. Asli Atlas / Gmail / OpenRouter / Razorpay kabhi use nahi hote:
// MongoDB = RAM wala temporary DB (test/globalSetup.js), AI + email = fake (test/setup.js)
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globalSetup: ["./test/globalSetup.js"],
        setupFiles: ["./test/setup.js"],
        include: ["test/**/*.test.js"],
        // sab test files ek hi MongoDB + Redis share karti hai aur har test se pehle unhe saaf karti hai — ek ke baad ek chalao
        fileParallelism: false,
        testTimeout: 30000,
        hookTimeout: 120000, // pehli baar MongoDB binary download hoti hai (~100MB)
        // env.js inhi values ko check karta hai (tests me .env file padhi hi nahi jaati)
        env: {
            NODE_ENV: "test",
            LOG_LEVEL: "silent",
            JWT_SECRET: "test-jwt-secret-at-least-16-chars",
            CLIENT_URL: "http://localhost:5173",
            FIREBASE_PROJECT_ID: "test-project",
            OPENROUTER_API_KEY: "test-key-never-used",
            GROQ_API_KEY: "test-groq-key-never-used", // voice transcription (Whisper call tests me fake hai)
            // DB 1 — local dev ka data DB 0 me hai, tests use kabhi nahi chhoote. CI apna Redis deta hai (TEST_REDIS_URL)
            REDIS_URL: process.env.TEST_REDIS_URL ?? "redis://localhost:6380/1",
            SMTP_HOST: "",
            RAZORPAY_KEY_ID: "rzp_test_fake",
            RAZORPAY_KEY_SECRET: "test_key_secret",
            RAZORPAY_WEBHOOK_SECRET: "test_webhook_secret",
        },
    },
});
