import express from "express";
import {
  getProfile,
  login,
  logout,
  signUp,
} from "../controllers/user.controllers.js";
import { multerUpload } from "../middlewares/multer.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Unauthenticated routes
router.post("/register", multerUpload.single("avatar"), signUp);

router.post("/login", login);

// Authenticated routes
router.use(isAuthenticated);

router.get("/logout", logout);

router.get("/profile", getProfile);

export default router;
