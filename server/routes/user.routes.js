import express from "express";
import {
  getProfile,
  logout,
} from "../controllers/user.controllers.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/logout", logout);

router.get("/profile", getProfile);

export default router;
