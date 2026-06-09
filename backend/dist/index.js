"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const authRouter_1 = require("./modules/auth/authRouter");
const workspaceRouter_1 = require("./modules/workspace/workspaceRouter");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/auth", authRouter_1.authRouter);
app.use("/api/workspaces", workspaceRouter_1.workspaceRouter);
app.use(errorHandler_1.errorHandler);
const server = app.listen(env_1.env.PORT, "127.0.0.1", () => {
    console.log(`AMMS backend listening on port ${env_1.env.PORT}`);
});
const shutdown = () => {
    server.close(() => {
        process.exit(0);
    });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
