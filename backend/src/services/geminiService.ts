import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { env } from "../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const cleanJsonResponse = (text: string) => {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();
};

const parseJsonResponse = <T>(responseText: string): T => {
  const cleaned = cleanJsonResponse(responseText);

  return JSON.parse(cleaned) as T;
};

const generateText = async (prompt: string) => {
  const result = await model.generateContent(prompt);

  return result.response.text();
};

const generateJsonWithRetry = async <T>(prompt: string, fallbackPrompt?: string): Promise<T> => {
  try {
    const response = await generateText(prompt);

    return parseJsonResponse<T>(response);
  } catch (error) {
    const retryPrompt = fallbackPrompt ?? `${prompt}\n\nReturn valid JSON only.`;

    try {
      const response = await generateText(retryPrompt);

      return parseJsonResponse<T>(response);
    } catch (retryError) {
      throw new Error(
        `Gemini JSON response could not be parsed: ${retryError instanceof Error ? retryError.message : String(retryError)}`
      );
    }
  }
};

export const geminiService = {
  async analyzeScreenshot(imageUrl: string): Promise<{ ocrText: string; summary: string; concepts: string[] }> {
    const prompt = "Analyze this image from a meeting. Extract: 1) all visible text (OCR), 2) a 2-3 sentence summary of what this visual shows, 3) a list of key concepts or topics. Return only valid JSON with keys: ocrText (string), summary (string), concepts (string array). No markdown, no backticks.";
    const mimeType = "image/jpeg";

    const executeAnalysis = async () => {
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data);
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
      return parseJsonResponse<{ ocrText: string; summary: string; concepts: string[] }>(text);
    };

    try {
      return await executeAnalysis();
    } catch (error) {
      console.warn("[geminiService] analyzeScreenshot failed, retrying once...", error);
      return await executeAnalysis();
    }
  },

  async transcribeAudio(cloudinaryUrl: string): Promise<string> {
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

  async generateSummary(transcript: string): Promise<{ summary: string; keyPoints: string[] }> {
    const prompt = [
      "You are summarizing a meeting transcript.",
      "Return valid JSON only with keys 'summary' and 'keyPoints'.",
      "The 'summary' value must be a concise summary string.",
      "The 'keyPoints' value must be an array of strings.",
      "Transcript:",
      transcript
    ].join("\n");

    return generateJsonWithRetry<{ summary: string; keyPoints: string[] }>(prompt);
  },

  async extractActionItems(transcript: string): Promise<{ task: string; assignee: string }[]> {
    const prompt = [
      "Extract all action items and their owners from this transcript.",
      "Return valid JSON only as an array of objects with keys 'task' and 'assignee'.",
      "Transcript:",
      transcript
    ].join("\n");

    return generateJsonWithRetry<{ task: string; assignee: string }[]>(prompt);
  },

  async extractDecisions(transcript: string): Promise<string[]> {
    const prompt = [
      "Extract all decisions made in this meeting.",
      "Return valid JSON only as an array of decision strings.",
      "Transcript:",
      transcript
    ].join("\n");

    return generateJsonWithRetry<string[]>(prompt);
  }
};
