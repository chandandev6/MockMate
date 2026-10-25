// har test file se pehle chalta hai: DB connect, fake AI + email, aur har test se pehle sab saaf (tests ek doosre par depend na kare)
import { afterAll, beforeAll, beforeEach, inject, vi } from "vitest";
import { fakeAi } from "./helpers/fakeAi.js";

// AI ko fake karo — tests fast, free aur har baar same result. Hum APNA logic test karte hai, OpenRouter nahi
vi.mock("../src/lib/ai/openRouter.js", () => ({ askAiJson: vi.fn(), askAi: vi.fn() }));
// email asli nahi jaata — tests sendMail ke calls me se verification link padh lete hai
// Groq audio (Whisper sunna, Orpheus bolna) bhi fake — transcribe/tts tests har test me jawab khud set karte hai
vi.mock("../src/lib/ai/voice.js", () => ({ transcribeAudio: vi.fn(), textToSpeech: vi.fn() }));
vi.mock("../src/lib/mail/mailer.js", () => ({ sendMail: vi.fn() }));

// env.js isi waqt padhta hai — isliye app import se PEHLE set karo
process.env.MONGODB_URL = inject("mongoUri");

const { default: mongoose } = await import("mongoose");
const { redis, connectRedis } = await import("../src/config/redis.js");
const { aiQueue, maintenanceQueue } = await import("../src/lib/queue/queues.js");
const { askAiJson } = await import("../src/lib/ai/openRouter.js");
const { transcribeAudio, textToSpeech } = await import("../src/lib/ai/voice.js");
const { sendMail } = await import("../src/lib/mail/mailer.js");
await import("../src/app.js"); // saare models register ho jaaye (indexes ke liye)

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    await connectRedis();
    // unique indexes (requestId, paymentId, signup bonus) bane hone chahiye — inhi par race/duplicate tests tikte hai
    await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
    await redis.flushdb(); // rate-limit counters, cache, queue, locks — sab
    askAiJson.mockReset().mockImplementation(fakeAi);
    transcribeAudio.mockReset();
    textToSpeech.mockReset();
    sendMail.mockReset().mockResolvedValue(undefined);
});

afterAll(async () => {
    await Promise.all([aiQueue.close(), maintenanceQueue.close()]);
    await mongoose.disconnect();
    await redis.quit();
});
