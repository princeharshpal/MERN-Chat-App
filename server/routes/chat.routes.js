import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { getMyChats, getOrCreateChat } from "../controllers/chat.controllers.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/my-chats", getMyChats);

router.post("/new-chat", getOrCreateChat);

export default router;
