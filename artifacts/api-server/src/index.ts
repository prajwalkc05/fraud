import http from "http";
import { config } from "dotenv";
import { resolve } from "path";
import app from "./app";
import { logger } from "./lib/logger";
import { initWebSocket } from "./lib/websocket";
import { connectDB } from "@workspace/db";

// Load .env from workspace root
config({ path: resolve(import.meta.dirname, "../../../.env") });

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

connectDB()
  .then(() => {
    logger.info("MongoDB connected");
    
    const server = http.createServer(app);
    initWebSocket(server);

    server.listen(port, () => {
      logger.info({ port }, "Server listening");
    });

    server.on("error", (err) => {
      logger.error({ err }, "Server error");
      process.exit(1);
    });
  })
  .catch((err) => {
    logger.error({ err }, "MongoDB connection failed");
    process.exit(1);
  });
