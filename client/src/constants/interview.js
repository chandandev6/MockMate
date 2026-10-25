// server ke interview.modes.js jaisa hi — wahan kuch badle (cost, levels) to yaha bhi badalna
import maleVideo from "../assets/Videos/male-ai.mp4";
import femaleVideo from "../assets/Videos/female-ai.mp4";

export const INTERVIEW_COST = 50;

// server sirf yahi values maanta hai (zod enum) — free text nahi
export const EXPERIENCE_LEVELS = ["Fresher", "0-1 years", "1-3 years", "3-5 years", "5+ years"];

export const ROLE_SUGGESTIONS = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "MERN Stack Developer",
    "Java Developer",
    "Python Developer",
    "Data Analyst",
    "Data Scientist",
    "DevOps Engineer",
    "Android Developer",
    "UI/UX Designer",
    "Product Manager",
];

// weights = server ke interview.modes.js jaisa hi (har criteria kitna gin'a jaata hai) — UI me "kya judge hoga" dikhane ke liye
export const MODES = [
    {
        key: "technical",
        title: "Technical",
        desc: "Role-specific concepts, trade-offs and problem solving.",
        weights: { communication: 15, content: 30, technical: 45, confidence: 10 },
    },
    {
        key: "hr",
        title: "HR",
        desc: "Behavioural questions — teamwork, conflict, goals.",
        weights: { communication: 35, content: 35, technical: 10, confidence: 20 },
    },
    {
        key: "confidence",
        title: "Confidence",
        desc: "Introduce yourself, your projects, why hire you.",
        weights: { communication: 35, content: 20, technical: 5, confidence: 40 },
    },
];

export const AVATARS = [
    { key: "female", label: "Female interviewer", video: femaleVideo },
    { key: "male", label: "Male interviewer", video: maleVideo },
];

export const CRITERIA = [
    { key: "communication", label: "Communication" },
    { key: "content", label: "Content" },
    { key: "technical", label: "Technical" },
    { key: "confidence", label: "Confidence" },
];

// "technical" → "Technical" (report, history, PDF sab jagah same naam)
export const MODE_LABEL = Object.fromEntries(MODES.map((mode) => [mode.key, mode.title]));
