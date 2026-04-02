import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getGroups = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const groups = await Group.find({
    members: userId,
  }).populate("members admin", "-password -refreshTokens");

  return res
    .status(200)
    .json(new ApiResponse(200, groups, "Groups fetched successfully"));
});

export const createGroup = asyncHandler(async (req, res) => {
  const { name, members, groupIcon, description } = req.body;
  const adminId = req.user._id;

  if (!name) throw new ApiError(400, "Group name is required");

  let allMembers = Array.isArray(members) ? [...members] : [];
  if (!allMembers.some((m) => m.toString() === adminId.toString())) {
    allMembers.push(adminId.toString());
  }

  allMembers = [...new Set(allMembers.map((m) => m.toString()))];

  if (allMembers.length < 3) {
    throw new ApiError(
      400,
      "Group must have at least 3 members including yourself.",
    );
  }

  const group = await Group.create({
    name,
    description,
    admin: adminId,
    members: allMembers,
    groupIcon,
  });

  const populatedGroup = await Group.findById(group._id).populate(
    "members admin",
    "-password -refreshTokens",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedGroup, "Group created successfully"));
});

export const getGroupById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const group = await Group.findById(id).populate(
    "members admin",
    "-password -refreshTokens",
  );

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const isMember = group.members.some(
    (m) => m._id.toString() === userId.toString(),
  );
  if (!isMember) {
    throw new ApiError(403, "You are not authorized to view this group");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, group, "Group details fetched successfully"));
});

export const updateGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, groupIcon } = req.body;
  const userId = req.user._id;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, "Group not found");

  if (group.admin.toString() !== userId.toString()) {
    throw new ApiError(403, "Only admin can update the group");
  }

  group.name = name || group.name;
  group.description = description || "";
  group.groupIcon = groupIcon || "";

  await group.save();

  const updatedGroup = await Group.findById(id).populate(
    "members admin",
    "-password -refreshTokens",
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "Group updated fully"));
});

export const partialUpdateGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, "Group not found");

  if (group.admin.toString() !== userId.toString()) {
    throw new ApiError(403, "Only admin can update the group");
  }

  const fields = Object.keys(req.body);
  fields.forEach((field) => {
    if (["name", "description", "groupIcon"].includes(field)) {
      group[field] = req.body[field];
    }
  });

  await group.save();

  const updatedGroup = await Group.findById(id).populate(
    "members admin",
    "-password -refreshTokens",
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "Group partially updated"));
});

export const deleteGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, "Group not found");

  if (group.admin.toString() !== userId.toString()) {
    throw new ApiError(403, "Only admin can delete the group");
  }

  await Message.deleteMany({ groupId: id });

  await Group.findByIdAndDelete(id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Group and related messages deleted successfully",
      ),
    );
});

export const manageMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { memberId, action } = req.body;
  const userId = req.user._id;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, "Group not found");

  if (group.admin.toString() !== userId.toString()) {
    throw new ApiError(403, "Only admin can manage members");
  }

  if (action === "add") {
    if (group.members.includes(memberId)) {
      throw new ApiError(400, "User is already a member of the group");
    }
    group.members.push(memberId);
  } else if (action === "remove") {
    if (group.members.length <= 3) {
      throw new ApiError(400, "Group must have at least 3 members");
    }
    if (!group.members.includes(memberId)) {
      throw new ApiError(400, "User is not a member of the group");
    }
    if (memberId.toString() === group.admin.toString()) {
      throw new ApiError(400, "Admin cannot be removed from the group");
    }
    group.members = group.members.filter(
      (m) => m.toString() !== memberId.toString(),
    );
  } else {
    throw new ApiError(400, "Invalid action");
  }

  await group.save();

  const updatedGroup = await Group.findById(id).populate(
    "members admin",
    "-password -refreshTokens",
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedGroup,
        `Member ${action === "add" ? "added" : "removed"} successfully`,
      ),
    );
});
