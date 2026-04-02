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
  const { id } = req.params;
  const myId = req.user._id;

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: id },
      { senderId: id, receiverId: myId },
      { groupId: id },
    ],
  }).populate("replyTo senderId", "-password -refreshTokens");

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export const editMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const myId = req.user._id;

  const message = await Message.findOne({ _id: id, senderId: myId });

  if (!message) {
    throw new ApiError(404, "Message not found or unauthorized");
  }

  message.text = text;
  message.isEdited = true;
  await message.save();

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message edited successfully"));
});

export const unsendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const myId = req.user._id;

  const message = await Message.findOneAndDelete({
    _id: id,
    senderId: myId,
  });

  if (!message) {
    throw new ApiError(404, "Message not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Message deleted successfully"));
});

export const addReaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { emoji } = req.body;
  const myId = req.user._id;

  const message = await Message.findById(id);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  const existingReactionIndex = message.reactions.findIndex(
    (r) => r.userId.toString() === myId.toString(),
  );

  if (existingReactionIndex > -1) {
    if (message.reactions[existingReactionIndex].emoji === emoji) {
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      message.reactions[existingReactionIndex].emoji = emoji;
    }
  } else {
    message.reactions.push({ userId: myId, emoji });
  }

  await message.save();

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Reaction updated successfully"));
});

export const getChatMeta = asyncHandler(async (req, res) => {
  const myId = req.user._id;

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: myId }, { receiverId: myId }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$senderId", myId] }, "$receiverId", "$senderId"],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$senderId", myId] },
                  { $eq: ["$isSeen", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const meta = {};
  for (const conv of conversations) {
    meta[conv._id.toString()] = {
      lastMessage: {
        text: conv.lastMessage.text,
        image: conv.lastMessage.image,
        senderId: conv.lastMessage.senderId,
        createdAt: conv.lastMessage.createdAt,
      },
      unreadCount: conv.unreadCount,
    };
  }

  return res
    .status(200)
    .json(new ApiResponse(200, meta, "Chat meta fetched successfully"));
});
