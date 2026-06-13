"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("./config/env");
async function main() {
    const genAI = new generative_ai_1.GoogleGenerativeAI(env_1.env.GEMINI_API_KEY);
    const models = ["models/gemini-embedding-001", "models/gemini-embedding-2"];
    for (const modelName of models) {
        try {
            console.log(`Testing ${modelName} with outputDimensionality: 768 using 'as any'...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const res = await model.embedContent({
                content: {
                    role: "user",
                    parts: [{ text: "Hello world test" }]
                },
                outputDimensionality: 768
            });
            console.log(`  Success! Dimension count: ${res.embedding.values.length}`);
        }
        catch (err) {
            console.error(`  Failed for ${modelName}:`, err.message || err);
        }
    }
}
main().catch(console.error);
