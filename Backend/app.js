import dotenv from "dotenv";
dotenv.config({ quiet: true });
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import connectToDB from "./config/db.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { initializeSocket } from "./utils/socket.js";

import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import requestRoutes from "./routes/request.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const PORT = process.env.PORT || 5000;
const app = express();
const server = createServer(app);

connectToDB();

initializeSocket(server);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ success: true, message: "MERN Chat API is running" });
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/request", requestRoutes);
app.use("/notification", notificationRoutes);

app.use(errorMiddleware);

server.listen(PORT, () => {
  console.log("Server is listening on PORT", PORT);
});
