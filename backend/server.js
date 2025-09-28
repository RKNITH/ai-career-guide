import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";

if (!GEMINI_API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY in .env file");
    process.exit(1);
}

// Helper: Build payload for Gemini
function buildPayload(userInput) {
    const careerPrompt = `
You are an AI Career Guide for students and professionals. 
Your role is to provide **clear, practical, and detailed guidance in English or Hindi**, depending on user preference. 
Answer in **plain text only**.
Do not use *, **, _, #, or any markdown symbols.
Do not use confusing jargon. Use simple language that is easy to understand. 
Be supportive, motivational, and empathetic.

User question: "${userInput}"

⚠️ Important Formatting Rules:
- Output must be in plain text only.
- Use numbered or dash-separated lists.
- Give examples where possible.
- Suggest actionable steps and resources.
⚠️ Important: Please give a complete answer. Do not cut off mid-sentence.

Answer structure:

1. Possible Career Paths
- List career options related to user's interests or skills.
- Explain why each path might suit them.

2. Required Skills and Education
- Key skills or qualifications needed.
- Online courses, certifications, or degrees recommended.

3. Actionable Steps
- Step-by-step guidance to start exploring or preparing.
- Timeline suggestions for short-term and long-term goals.

4. Tips & Motivation
- Motivational advice to stay focused.
- How to handle challenges or uncertainties.

❗ Do not provide personal data of others. Keep advice safe and general.
`;

    return {
        contents: [{ parts: [{ text: careerPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    };
}


// API Route
app.post("/get-career-advice", async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Missing symptoms input" });
        }

        const payload = buildPayload(prompt);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

        const response = await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            timeout: 30000,
        });

        const result =
            response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        res.json({ result });
    } catch (error) {
        console.error("🔥 Server error:", error.response?.data || error.message);
        res
            .status(500)
            .json({ error: "Internal server error", detail: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
