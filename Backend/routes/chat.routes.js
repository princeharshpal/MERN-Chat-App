import express from "express";
import { multerUpload } from "../middlewares/multer.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { newChat } from "../controllers/chat.controllers copy.js";

const router = express.Router();

// Authenticated routes
router.use(isAuthenticated);

router.post("/new", newChat);

export default router;
