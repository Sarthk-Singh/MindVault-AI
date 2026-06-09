import express from "express";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/authRouter";
import { workspaceRouter } from "./modules/workspace/workspaceRouter";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/workspaces", workspaceRouter);
app.use(errorHandler);

const server = app.listen(env.PORT, "127.0.0.1", () => {
  console.log(`AMMS backend listening on port ${env.PORT}`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
