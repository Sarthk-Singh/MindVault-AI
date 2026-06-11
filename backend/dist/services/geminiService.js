"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("../config/env");
const genAI = new generative_ai_1.GoogleGenerativeAI(env_1.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const cleanJsonResponse = (text) => {
    return text
        .replace(/^```json\s*/i, "")
        .replace(/```$/i, "")
        .trim();
};
const parseJsonResponse = (responseText) => {
    const cleaned = cleanJsonResponse(responseText);
    return JSON.parse(cleaned);
};
const generateText = async (prompt) => {
    const result = await model.generateContent(prompt);
    return result.response.text();
};
const generateJsonWithRetry = async (prompt, fallbackPrompt) => {
    try {
        const response = await generateText(prompt);
        return parseJsonResponse(response);
    }
    catch (error) {
        const retryPrompt = fallbackPrompt ?? `${prompt}\n\nReturn valid JSON only.`;
        try {
            const response = await generateText(retryPrompt);
            return parseJsonResponse(response);
        }
        catch (retryError) {
            throw new Error(`Gemini JSON response could not be parsed: ${retryError instanceof Error ? retryError.message : String(retryError)}`);
        }
    }
};
exports.geminiService = {
    async analyzeScreenshot(imageUrl) {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image from Cloudinary: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get("content-type") || "image/jpeg";
        const prompt = [
            "Analyze this image from a meeting.",
            "Extract: 1) all visible text (OCR), 2) a 2-3 sentence summary of what this visual shows, 3) a list of key concepts or topics.",
            "Return valid JSON only with keys 'ocrText', 'summary', and 'concepts'."
        ].join("\n");
        const result = await model.generateContent([
            { text: prompt },
            {
                inlineData: {
                    mimeType,
                    data: buffer.toString("base64")
                }
            }
        ]);
        const text = result.response.text();
        try {
            return parseJsonResponse(text);
        }
        catch (error) {
            const retryResult = await model.generateContent([
                { text: `${prompt}\n\nReturn valid JSON only.` },
                {
                    inlineData: {
                        mimeType,
                        data: buffer.toString("base64")
                    }
                }
            ]);
            return parseJsonResponse(retryResult.response.text());
        }
    },
    async transcribeAudio(cloudinaryUrl) {
        const response = await fetch(cloudinaryUrl);
        if (!response.ok) {
            throw new Error(`Failed to download audio file from Cloudinary: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get("content-type") || "audio/mpeg";
        const result = await model.generateContent([
            {
                text: "Transcribe this meeting recording verbatim. Output only the transcript text."
            },
            {
                inlineData: {
                    mimeType,
                    data: buffer.toString("base64")
                }
            }
        ]);
        return result.response.text();
    },
    async generateSummary(transcript) {
        const prompt = [
            "You are summarizing a meeting transcript.",
            "Return valid JSON only with keys 'summary' and 'keyPoints'.",
            "The 'summary' value must be a concise summary string.",
            "The 'keyPoints' value must be an array of strings.",
            "Transcript:",
            transcript
        ].join("\n");
        return generateJsonWithRetry(prompt);
    },
    async extractActionItems(transcript) {
        const prompt = [
            "Extract all action items and their owners from this transcript.",
            "Return valid JSON only as an array of objects with keys 'task' and 'assignee'.",
            "Transcript:",
            transcript
        ].join("\n");
        return generateJsonWithRetry(prompt);
    },
    async extractDecisions(transcript) {
        const prompt = [
            "Extract all decisions made in this meeting.",
            "Return valid JSON only as an array of decision strings.",
            "Transcript:",
            transcript
        ].join("\n");
        return generateJsonWithRetry(prompt);
    }
};
