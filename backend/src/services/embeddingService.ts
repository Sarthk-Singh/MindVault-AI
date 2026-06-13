import { GoogleGenerativeAI } from "@google/generative-ai";
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma";
import { env } from "../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
let embeddingModel = genAI.getGenerativeModel({ model: "models/text-embedding-004" });

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent({
      content: {
        role: "user",
        parts: [{ text }]
      },
      outputDimensionality: 768
    } as any);
    if (!result.embedding || !result.embedding.values) {
      throw new Error("Failed to generate embedding: values not found in response");
    }
    return result.embedding.values;
  } catch (err: any) {
    if (embeddingModel.model === "models/text-embedding-004") {
      console.warn("models/text-embedding-004 failed/deprecated, falling back to models/gemini-embedding-001...");
      embeddingModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
      const result = await embeddingModel.embedContent({
        content: {
          role: "user",
          parts: [{ text }]
        },
        outputDimensionality: 768
      } as any);
      if (!result.embedding || !result.embedding.values) {
        throw new Error("Failed to generate embedding: values not found in response");
      }
      return result.embedding.values;
    }
    throw err;
  }
}

export async function storeEmbedding(
  sourceId: string,
  sourceType: "transcript" | "screenshot" | "summary",
  text: string
): Promise<void> {
  const vector = await generateEmbedding(text);
  const vectorLiteral = `[${vector.join(",")}]`;

  await prisma.$executeRaw`INSERT INTO "Embedding" (id, "sourceId", "sourceType", vector, "createdAt") 
  VALUES (${randomUUID()}, ${sourceId}, ${sourceType}, ${vectorLiteral}::vector(768), NOW())`;
}
