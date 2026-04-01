import express from "express";
import {
  sendRequest,
  respondToRequest,
  getPossibleConnections,
  getFriends,
  getPendingRequests,
} from "../controllers/connection.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.post("/request", sendRequest);
router.post("/respond", respondToRequest);
router.get("/possible", getPossibleConnections);
router.get("/friends", getFriends);
router.get("/pending", getPendingRequests);

export default router;
