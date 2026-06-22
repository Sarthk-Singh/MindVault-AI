"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(5000),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(1),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1),
    GEMINI_API_KEY: zod_1.z.string().min(1),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().min(1),
    CLOUDINARY_API_KEY: zod_1.z.string().min(1),
    CLOUDINARY_API_SECRET: zod_1.z.string().min(1),
    REDIS_URL: zod_1.z.string().min(1),
    FRONTEND_URL: zod_1.z.string().url(),
    GOOGLE_CLIENT_ID: zod_1.z.string().optional().default(""),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional().default(""),
    GOOGLE_CALLBACK_URL: zod_1.z.string().optional().default("http://localhost:3001/api/auth/google/callback"),
    RESEND_API_KEY: zod_1.z.string().optional(),
    googleSMTP_HOST: zod_1.z.string().optional().default("smtp.gmail.com"),
    SMTP_PORT: zod_1.z.coerce.number().int().positive().default(465),
    SMTP_SECURE: zod_1.z.preprocess((val) => val === "true" || val === true || val === "1", zod_1.z.boolean()).default(true),
    SMTP_USER: zod_1.z.string().email(),
    SMTP_PASS: zod_1.z.string().min(1)
});
exports.env = envSchema.parse(process.env);
