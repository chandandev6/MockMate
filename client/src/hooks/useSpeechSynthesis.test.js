import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { fetchSpeech } from "../api/tts.api.js";
import useSpeechSynthesis, { isNaturalVoice, pickVoice, splitText } from "./useSpeechSynthesis.js";

vi.mock("../api/tts.api.js", () => ({ fetchSpeech: vi.fn() }));

const voice = (name, lang = "en-US") => ({ name, lang });

describe("pickVoice", () => {
    it("prefers a natural voice over robotic eSpeak variants", () => {
        const voices = [
            voice("English (America)+female1"),
            voice("English (America, New York City)+male8"),
            voice("Google UK English Female", "en-GB"),
        ];
        expect(pickVoice(voices, "female").name).toBe("Google UK English Female");
    });

    it("uses the avatar gender among natural voices", () => {
        const voices = [voice("Google UK English Female", "en-GB"), voice("Google UK English Male", "en-GB")];
        expect(pickVoice(voices, "male").name).toBe("Google UK English Male");
        expect(pickVoice(voices, "female").name).toBe("Google UK English Female");
    });

    it("ignores non-English voices and returns null when none", () => {
        expect(pickVoice([voice("Google Deutsch", "de-DE")], "male")).toBeNull();
    });
});

describe("splitText", () => {
    it("splits into sentences", () => {
        expect(splitText("Question 1. What is Node.js? Explain hooks!")).toEqual([
            "Question 1.",
            "What is Node.js?",
            "Explain hooks!",
        ]);
    });

    it("splits a very long sentence at commas", () => {
        const long = `${"a".repeat(150)}, ${"b".repeat(100)}.`;
        expect(splitText(long)).toEqual([`${"a".repeat(150)},`, `${"b".repeat(100)}.`]);
    });

    it("returns nothing for empty text", () => {
        expect(splitText("   ")).toEqual([]);
    });
});

describe("isNaturalVoice", () => {
    it("trusts Google / Microsoft / Mac voices, not eSpeak", () => {
        expect(isNaturalVoice(voice("Google UK English Female", "en-GB"))).toBe(true);
        expect(isNaturalVoice(voice("Microsoft Aria Online (Natural)"))).toBe(true);
        expect(isNaturalVoice(voice("English (America)+female1"))).toBe(false);
        expect(isNaturalVoice(voice("English (Great Britain)", "en-GB"))).toBe(false); // Firefox Linux
        expect(isNaturalVoice(null)).toBe(false);
    });
});

// jsdom me speechSynthesis hi nahi — Linux Firefox jaisa: awaaz server se aani chahiye
describe("useSpeechSynthesis without a natural browser voice", () => {
    beforeAll(() => {
        URL.createObjectURL = vi.fn((blob) => `blob:${blob.size}`);
        URL.revokeObjectURL = vi.fn();
        // audio "bajta" hai aur turant khatam
        vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(function () {
            setTimeout(() => this.onended?.());
            return Promise.resolve();
        });
    });
    afterEach(() => vi.clearAllMocks());

    it("fetches every sentence from the server in the avatar's voice and plays them", async () => {
        fetchSpeech.mockImplementation((text) => Promise.resolve(new Blob([text])));
        const { result } = renderHook(() => useSpeechSynthesis("male"));

        await act(() => result.current.speak("Question 1. What is a closure?"));

        expect(fetchSpeech).toHaveBeenCalledWith("Question 1.", "male");
        expect(fetchSpeech).toHaveBeenCalledWith("What is a closure?", "male");
        expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
        expect(result.current.speaking).toBe(false);
    });

    it("Repeat question → audio from cache, no new server call", async () => {
        fetchSpeech.mockImplementation((text) => Promise.resolve(new Blob([text])));
        const { result } = renderHook(() => useSpeechSynthesis("female"));

        await act(() => result.current.speak("Tell me about yourself."));
        await act(() => result.current.speak("Tell me about yourself."));

        expect(fetchSpeech).toHaveBeenCalledTimes(1);
        expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    });

    it("server down → speak() still finishes (interview never gets stuck)", async () => {
        fetchSpeech.mockRejectedValue(new Error("503"));
        const { result } = renderHook(() => useSpeechSynthesis("female"));

        await act(() => result.current.speak("Why do you want this job?"));

        expect(result.current.speaking).toBe(false);
    });
});
