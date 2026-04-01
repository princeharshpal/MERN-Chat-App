import express from "express";
import { uploadFile } from "../controllers/upload.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { scanAndUpload } from "../middleware/scan.middleware.js";

const router = express.Router();

router.post("/", protectRoute, upload, scanAndUpload, uploadFile);

export default router;
