import { describe, expect, it } from "vitest";
import { textToSpeech } from "../src/lib/ai/voice.js";
import { api, createUser } from "./helpers/index.js";

// textToSpeech test/setup.js me fake hai — hum route/validation test karte hai, Groq nahi
const wav = Buffer.from("RIFF-fake-wav-bytes");
const speak = (cookie, body) => api().post("/api/tts").set("Cookie", cookie).send(body);

describe("POST /api/tts (interviewer voice for Firefox/Brave)", () => {
    it("returns wav audio in the avatar's voice", async () => {
        const { cookie } = await createUser();
        textToSpeech.mockResolvedValueOnce(wav);

        const res = await speak(cookie, { text: "  Question 1. What is a closure?  ", gender: "male" });

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/^audio\/wav/);
        expect(Buffer.from(res.body).equals(wav)).toBe(true);
        expect(textToSpeech).toHaveBeenCalledWith("Question 1. What is a closure?", "male"); // trim hua
    });

    it("needs login", async () => {
        const res = await api().post("/api/tts").send({ text: "Hi" });
        expect(res.status).toBe(401);
    });

    it("rejects empty / too long text and unknown gender (no Groq call)", async () => {
        const { cookie } = await createUser();

        for (const body of [{ text: "   " }, { text: "a".repeat(601) }, { text: "Hi", gender: "robot" }]) {
            const res = await speak(cookie, body);
            expect(res.status).toBe(400);
        }
        expect(textToSpeech).not.toHaveBeenCalled();
    });

    it("Groq down → 503 VOICE_UNAVAILABLE as JSON (client falls back to the browser voice)", async () => {
        const { cookie } = await createUser();
        textToSpeech.mockRejectedValueOnce(new Error("Groq is down"));

        const res = await speak(cookie, { text: "Hello" });

        expect(res.status).toBe(503);
        expect(res.body.code).toBe("VOICE_UNAVAILABLE");
    });
});
