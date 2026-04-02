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

router.route("/").get(getFriends).post(sendRequest);

router.patch("/:id", respondToRequest);

router.get("/possible", getPossibleConnections);
router.get("/pending", getPendingRequests);

export default router;
