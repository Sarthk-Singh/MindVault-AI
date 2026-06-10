import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env";

const connection = new IORedis(env.REDIS_URL) as unknown as any;

export const aiQueue = new Queue("ai-jobs", { connection });
