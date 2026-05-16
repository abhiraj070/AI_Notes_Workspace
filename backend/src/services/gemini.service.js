import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";

const getModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new ApiError(500, "GEMINI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL,
    });
};

const truncateContent = (content) => {
    const trimmed = String(content).trim();
    if (trimmed.length <= 8000) return trimmed;
    return trimmed.slice(0, 8000);
};

const normalizeOutput = (text) => {
    return text
        .trim()
        .replace(/^["']|["']$/g, "")
        .trim();
};

const callGemini = async (instruction, content) => {
    const model = getModel();
    const truncated = truncateContent(content);
    const prompt = `${instruction}\n---Note content---\n${truncated}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (!text?.trim()) {
            throw new Error("Empty response from Gemini");
        }
        return normalizeOutput(text);
    } catch (err) {
        if (err instanceof ApiError) throw err;
        console.error("Gemini API error:", err.message);
        throw new ApiError(502, "AI generation failed");
    }
};

const generateTitleFromContent = async (content) => {
    const title = await callGemini(
        "You are a note-taking assistant. Based on the note content below, return ONLY a short, descriptive title (maximum 8 words). No quotes, no explanation, no punctuation at the end unless necessary.",
        content
    );
    return title || "Untitled";
};

const generateSummaryFromContent = async (content) => {
    return callGemini(
        "You are a note-taking assistant. Based on the note content below, write a 2-3 sentence summary suitable for a notes list preview. Return only the summary, no headings or labels.",
        content
    );
};

export { generateTitleFromContent, generateSummaryFromContent };
