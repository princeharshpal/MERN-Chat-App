import express from "express";
import {
  login,
  logout,
  signup,
  refreshAccessToken,
  getMe,
  updateProfile,
  partialUpdateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protectRoute, logout);
router.post("/refresh-token", refreshAccessToken);

router.get("/me", protectRoute, getMe);

router
  .route("/profile")
  .put(protectRoute, updateProfile)
  .patch(protectRoute, partialUpdateProfile);

export default router;
