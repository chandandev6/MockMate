import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { transcribeAudio } from "../api/transcribe.api.js";

vi.mock("../api/transcribe.api.js", () => ({ transcribeAudio: vi.fn() }));

// jsdom me na speech API hai na mic — Firefox jaisa browser: recording wala tareeka chalna chahiye
class FakeMediaRecorder {
    static isTypeSupported = (type) => type === "audio/ogg;codecs=opus";
    constructor(stream, options) {
        this.mimeType = options?.mimeType ?? "";
        this.state = "inactive";
    }
    start() {
        this.state = "recording";
    }
    stop() {
        this.state = "inactive";
        this.ondataavailable({ data: new Blob(["voice"]) });
        this.onstop();
    }
}

const fakeStream = { getTracks: () => [{ stop: vi.fn() }] };

let useSpeechRecognition, pickMimeType;
beforeAll(async () => {
    window.MediaRecorder = FakeMediaRecorder;
    Object.defineProperty(navigator, "mediaDevices", {
        value: { getUserMedia: vi.fn(() => Promise.resolve(fakeStream)) },
        configurable: true,
    });
    // hook file "kya browser record kar sakta hai" import par hi dekhti hai — isliye fakes ke BAAD import
    ({ default: useSpeechRecognition, pickMimeType } = await import("./useSpeechRecognition.js"));
});

afterEach(() => vi.clearAllMocks());

describe("pickMimeType", () => {
    it("picks the first format the browser can record", () => {
        expect(pickMimeType((type) => type === "audio/mp4")).toBe("audio/mp4"); // Safari
        expect(pickMimeType(() => true)).toBe("audio/webm;codecs=opus");
        expect(pickMimeType(() => false)).toBe("");
    });
});

describe("useSpeechRecognition without a browser speech API (Firefox)", () => {
    it("records, sends the audio to the server and adds the text on stop", async () => {
        transcribeAudio.mockResolvedValueOnce({ data: { text: "I would use a queue." } });
        const onFinal = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onFinal));

        expect(result.current.supported).toBe(true);
        expect(result.current.live).toBe(false);

        await act(() => result.current.start());
        expect(result.current.listening).toBe(true);

        await act(() => result.current.stop());

        const blob = transcribeAudio.mock.calls[0][0];
        expect(blob.type).toBe("audio/ogg"); // ";codecs=opus" hata ke
        expect(onFinal).toHaveBeenCalledWith("I would use a queue.");
        expect(result.current.listening).toBe(false);
        expect(result.current.transcribing).toBe(false);
    });

    it("server error → shows a message, answer flow does not break", async () => {
        transcribeAudio.mockRejectedValueOnce({ response: { data: { message: "Please type your answer." } } });
        const onFinal = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onFinal));

        await act(() => result.current.start());
        await act(() => result.current.stop());

        expect(onFinal).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Please type your answer.");
    });

    it("mic permission denied → friendly error, nothing sent", async () => {
        navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(
            Object.assign(new Error(), { name: "NotAllowedError" }),
        );
        const { result } = renderHook(() => useSpeechRecognition(vi.fn()));

        await act(() => result.current.start());

        expect(result.current.listening).toBe(false);
        expect(result.current.error).toMatch(/permission was denied/);
        expect(transcribeAudio).not.toHaveBeenCalled();
    });
});
