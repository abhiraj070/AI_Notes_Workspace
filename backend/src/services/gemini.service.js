import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";

const DEFAULT_MODEL = "gemini-2.5-flash";

const getModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new ApiError(500, "GEMINI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    });
};

const toApiError = (err) => {
    const message = err?.message || String(err);
    if (message.includes("429") || message.toLowerCase().includes("quota")) {
        return new ApiError(
            429,
            "Gemini API quota exceeded for this model. Wait a minute and retry, or set GEMINI_MODEL to a model with quota (e.g. gemini-2.5-flash)."
        );
    }
    if (message.includes("404") || message.toLowerCase().includes("not found")) {
        return new ApiError(
            400,
            `Gemini model not found or unavailable: ${process.env.GEMINI_MODEL || DEFAULT_MODEL}`
        );
    }
    return new ApiError(502, "AI generation failed");
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
        throw toApiError(err);
    }
};

const generateTitleFromContent = async (content) => {
    const title = await callGemini(
        "You are a note-taking assistant. Based on the note content below, return ONLY a short, descriptive title (maximum 5 words). No quotes, no explanation, no punctuation at the end unless necessary.",
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
