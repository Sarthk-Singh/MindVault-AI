"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbedding = generateEmbedding;
exports.storeEmbedding = storeEmbedding;
const generative_ai_1 = require("@google/generative-ai");
const node_crypto_1 = require("node:crypto");
const prisma_1 = require("../config/prisma");
const env_1 = require("../config/env");
const genAI = new generative_ai_1.GoogleGenerativeAI(env_1.env.GEMINI_API_KEY);
let embeddingModel = genAI.getGenerativeModel({ model: "models/text-embedding-004" });
async function generateEmbedding(text) {
    try {
        const result = await embeddingModel.embedContent({
            content: {
                role: "user",
                parts: [{ text }]
            },
            outputDimensionality: 768
        });
        if (!result.embedding || !result.embedding.values) {
            throw new Error("Failed to generate embedding: values not found in response");
        }
        return result.embedding.values;
    }
    catch (err) {
        if (embeddingModel.model === "models/text-embedding-004") {
            console.warn("models/text-embedding-004 failed/deprecated, falling back to models/gemini-embedding-001...");
            embeddingModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
            const result = await embeddingModel.embedContent({
                content: {
                    role: "user",
                    parts: [{ text }]
                },
                outputDimensionality: 768
            });
            if (!result.embedding || !result.embedding.values) {
                throw new Error("Failed to generate embedding: values not found in response");
            }
            return result.embedding.values;
        }
        throw err;
    }
}
async function storeEmbedding(sourceId, sourceType, text) {
    const vector = await generateEmbedding(text);
    const vectorLiteral = `[${vector.join(",")}]`;
    await prisma_1.prisma.$executeRaw `INSERT INTO "Embedding" (id, "sourceId", "sourceType", vector, "createdAt") 
  VALUES (${(0, node_crypto_1.randomUUID)()}, ${sourceId}, ${sourceType}, ${vectorLiteral}::vector(768), NOW())`;
}
