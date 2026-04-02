import express from "express";
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  partialUpdateGroup,
  deleteGroup,
  manageMembers,
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.route("/").get(getGroups).post(createGroup);

router
  .route("/:id")
  .get(getGroupById)
  .put(updateGroup)
  .patch(partialUpdateGroup)
  .delete(deleteGroup);

router.post("/:id/members", manageMembers);

export default router;
