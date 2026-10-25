// POST /api/tts — client ek baar me ek sentence bhejta hai (question max 500 chars, thoda margin)
import { z } from "zod";

export const ttsSchema = z.object({
    text: z.string().trim().min(1, "text is required").max(600, "text is too long"),
    gender: z.enum(["male", "female"]).default("female"), // avatar jaisi awaaz
});
