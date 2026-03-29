import express from "express";
import { app, server } from "./socket/server.js";
import connectToDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import requestRoutes from "./routes/request.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { globalLimiter } from "./middlewares/rateLimiter.js";

const PORT = process.env.PORT || 5000;

connectToDB();

app.use(globalLimiter);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))

app.use(helmet())
app.use(morgan("dev"))
app.use(cookieParser());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    message: `server is listening, current date : ${new Date()}`,
    success: true,
    data: null
  });
});

app.use("/auths", authRoutes);
app.use("/users", userRoutes);
app.use("/requests", requestRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    success: false,
    data: null
  });
});

app.use(errorMiddleware);

server.listen(PORT, () => {
  console.log("Server is listening on PORT", PORT);
});
