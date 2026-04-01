import Message from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  const messages = await Message.find({
    $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
  }).sort({ createdAt: -1 });

  const userIds = [
    ...new Set(
      messages.map((msg) =>
        msg.senderId.toString() === loggedInUserId.toString()
          ? msg.receiverId.toString()
          : msg.senderId.toString(),
      ),
    ),
  ];

  const filteredUsers = await User.find({
    _id: { $in: userIds },
  }).select("-password -refreshTokens");

  const sortedUsers = userIds
    .map((id) => filteredUsers.find((u) => u._id.toString() === id))
    .filter(Boolean);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sortedUsers,
        "Active chat users fetched successfully",
      ),
    );
});

export const getMessages = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const myId = req.user._id;

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId },
    ],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched successfully"));
});
