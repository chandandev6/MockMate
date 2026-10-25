import { describe, expect, it } from "vitest";
import { transcribeAudio } from "../src/lib/ai/voice.js";
import { api, createUser } from "./helpers/index.js";

// transcribeAudio test/setup.js me fake hai — hum apna route/validation test karte hai, Groq nahi

const audio = Buffer.from("fake-opus-bytes");
const send = (cookie, file = audio, contentType = "audio/webm") =>
    api().post("/api/transcribe").set("Cookie", cookie).attach("audio", file, { filename: "answer.webm", contentType });

describe("POST /api/transcribe (voice → text for Firefox/Brave)", () => {
    it("returns the text Whisper heard", async () => {
        const { cookie } = await createUser();
        transcribeAudio.mockResolvedValueOnce("I would use a hash map.");

        const res = await send(cookie);

        expect(res.status).toBe(200);
        expect(res.body.data.text).toBe("I would use a hash map.");
        expect(transcribeAudio).toHaveBeenCalledWith(expect.any(Buffer), "audio/webm");
    });

    it("needs login", async () => {
        const res = await api().post("/api/transcribe").attach("audio", audio, "answer.webm");
        expect(res.status).toBe(401);
    });

    it("rejects a missing file and non-audio files with 400", async () => {
        const { cookie } = await createUser();

        const missing = await api().post("/api/transcribe").set("Cookie", cookie);
        expect(missing.status).toBe(400);
        expect(missing.body.code).toBe("AUDIO_MISSING");

        const pdf = await send(cookie, Buffer.from("%PDF"), "application/pdf");
        expect(pdf.status).toBe(400);
        expect(transcribeAudio).not.toHaveBeenCalled();
    });

    it("Groq down → 503 VOICE_UNAVAILABLE (frontend asks the user to type)", async () => {
        const { cookie } = await createUser();
        transcribeAudio.mockRejectedValueOnce(new Error("Groq is down"));

        const res = await send(cookie);

        expect(res.status).toBe(503);
        expect(res.body.code).toBe("VOICE_UNAVAILABLE");
    });
});
