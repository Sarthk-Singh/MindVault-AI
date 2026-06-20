import express from "express";
import cors from "cors";
import passport from "passport";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/authRouter";
import { workspaceRouter } from "./modules/workspace/workspaceRouter";
import { meetingRouter } from "./modules/meeting/meetingRouter";
import { aiRouter } from "./modules/ai/aiRouter";
import { uploadRouter } from "./modules/upload/uploadRouter";
import { searchRouter } from "./modules/search/searchRouter";
import { userRouter } from "./modules/user/userRouter";
import { errorHandler } from "./middleware/errorHandler";
import "./config/passport";

const app = express();
app.use(passport.initialize());

app.use(cors({
  origin: [env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/workspaces", workspaceRouter);
app.use("/api/meetings", meetingRouter);
app.use("/api/users", userRouter);
app.use("/api", aiRouter);
app.use("/api", uploadRouter);
app.use("/api/search", searchRouter);
app.use(errorHandler);

const server = app.listen(env.PORT, "127.0.0.1", () => {
  console.log(`MindVault-AI backend listening on port ${env.PORT}`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
