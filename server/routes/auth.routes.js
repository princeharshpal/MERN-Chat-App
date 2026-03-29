import express from "express";
import { login, signUp } from "../controllers/user.controllers.js";
import { multerUpload } from "../middlewares/multer.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import {
  registerValidator,
  loginValidator,
} from "../validation/user.validator.js";
import { validateRequest } from "../middlewares/validator.middleware.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  multerUpload.single("avatar"),
  registerValidator,
  validateRequest,
  signUp
);

router.post(
  "/login",
  authLimiter,
  loginValidator,
  validateRequest,
  login);

export default router;
