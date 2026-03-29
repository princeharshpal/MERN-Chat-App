import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { sendMessage, getMessages } from "../controllers/message.controllers.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/send", sendMessage);

router.get("/chat/:chatId", getMessages);

export default router;
