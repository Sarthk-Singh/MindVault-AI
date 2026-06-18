"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const env_1 = require("./config/env");
const authRouter_1 = require("./modules/auth/authRouter");
const workspaceRouter_1 = require("./modules/workspace/workspaceRouter");
const meetingRouter_1 = require("./modules/meeting/meetingRouter");
const aiRouter_1 = require("./modules/ai/aiRouter");
const uploadRouter_1 = require("./modules/upload/uploadRouter");
const searchRouter_1 = require("./modules/search/searchRouter");
const errorHandler_1 = require("./middleware/errorHandler");
require("./config/passport");
const app = (0, express_1.default)();
app.use(passport_1.default.initialize());
app.use((0, cors_1.default)({
    origin: [env_1.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));
app.use(express_1.default.json());
app.use("/api/auth", authRouter_1.authRouter);
app.use("/api/workspaces", workspaceRouter_1.workspaceRouter);
app.use("/api/meetings", meetingRouter_1.meetingRouter);
app.use("/api", aiRouter_1.aiRouter);
app.use("/api", uploadRouter_1.uploadRouter);
app.use("/api/search", searchRouter_1.searchRouter);
app.use(errorHandler_1.errorHandler);
const server = app.listen(env_1.env.PORT, "127.0.0.1", () => {
    console.log(`MindVault-AI backend listening on port ${env_1.env.PORT}`);
});
const shutdown = () => {
    server.close(() => {
        process.exit(0);
    });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
