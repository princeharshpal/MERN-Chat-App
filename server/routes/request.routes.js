import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  acceptRequest,
  getFriendsList,
  getPendingRequests,
  searchUsers,
  sendRequest,
} from "../controllers/request.controllers.js";
import {
  acceptRequestValidator,
  sendRequestValidator,
} from "../validation/request.validator.js";
import { validateRequest } from "../middlewares/validator.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/send", sendRequestValidator, validateRequest, sendRequest);

router.put(
  "/accept/:requestId",
  acceptRequestValidator,
  validateRequest,
  acceptRequest
);

router.get("/pending", getPendingRequests);

router.get("/friends", getFriendsList);

router.get("/search", searchUsers);

export default router;
