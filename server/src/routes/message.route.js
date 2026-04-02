import express from "express";
import {
  getMessages,
  getUsersForSidebar,
  editMessage,
  unsendMessage,
  addReaction,
  getChatMeta,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/users", getUsersForSidebar);
router.get("/chat-meta", getChatMeta);

router.route("/:id").get(getMessages).patch(editMessage).delete(unsendMessage);

router.post("/:id/react", addReaction);

export default router;
