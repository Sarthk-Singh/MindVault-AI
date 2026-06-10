"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./config/env");
const connection = new ioredis_1.default(env_1.env.REDIS_URL);
const worker = new bullmq_1.Worker("ai-jobs", async (job) => {
    if (job.name === "transcribe") {
        console.log("[worker] transcribe job", job.data);
        // stub: integrate transcription later
    }
    else if (job.name === "screenshot-analysis") {
        console.log("[worker] screenshot-analysis job", job.data);
        // stub: integrate screenshot analysis later
    }
    else {
        console.log("[worker] unknown job", job.name, job.data);
    }
}, { connection });
worker.on("completed", (job) => console.log(`[worker] job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`[worker] job ${job?.id} failed`, err));
process.on("SIGINT", async () => {
    await worker.close();
    process.exit(0);
});
