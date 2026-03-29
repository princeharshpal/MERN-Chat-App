import { TryCatch } from "../middlewares/error.middleware.js";
import { Chat } from "../models/chat.model.js";
import { ErrorHandler } from "../utils/utility.js";

const getMyChats = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({ members: req.userId })
    .populate("members", "name avatar email")
    .sort({ updatedAt: -1 });

  const transformedChats = chats.map((chat) => {
    const otherMember = chat.members.find(
      (m) => m._id.toString() !== req.userId.toString()
    );

    return {
      _id: chat._id,
      name: chat.groupChat ? chat.name : otherMember.name,
      avatar: chat.groupChat ? [] : [otherMember.avatar.url],
      members: chat.members.filter((m) => m._id.toString() !== req.userId.toString()).map((m) => m._id),
      groupChat: chat.groupChat,
      lastMessage: "", 
    };
  });

  res.status(200).json({
    success: true,
    chats: transformedChats,
  });
});

const getOrCreateChat = TryCatch(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return next(new ErrorHandler(400, "User ID is required"));

  let chat = await Chat.findOne({
    groupChat: false,
    members: { $all: [req.userId, userId] },
  });

  if (!chat) {
    chat = await Chat.create({
      name: "Direct Chat",
      members: [req.userId, userId],
    });
  }

  res.status(200).json({
    success: true,
    chat,
  });
});

export { getMyChats, getOrCreateChat };
