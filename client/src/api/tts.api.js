// interviewer ki awaaz server se (Groq Orpheus) — sirf un browsers ke liye jinke paas natural voice nahi (Linux Firefox/Brave)
import api from "./axios.js";

// JSON nahi, audio aata hai → blob. Returns Blob (audio/wav)
export const fetchSpeech = (text, gender) =>
    api.post("/api/tts", { text, gender }, { responseType: "blob", timeout: 20000 }).then((response) => response.data);
