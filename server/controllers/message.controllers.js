import { TryCatch } from "../middlewares/error.middleware.js";
import { Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";
import { io } from "../socket/server.js";
import { ErrorHandler } from "../utils/utility.js";

const sendMessage = TryCatch(async (req, res, next) => {
  const { chatId, content } = req.body;
  const senderId = req.userId;

  if (!chatId || !content) {
    return next(new ErrorHandler(400, "Chat ID and content are required"));
  }

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ErrorHandler(404, "Chat not found"));

  if (!chat.members.includes(senderId)) {
    return next(new ErrorHandler(403, "You are not a member of this chat"));
  }

  const message = await Message.create({
    sender: senderId,
    content,
    chat: chatId,
  });

  const messageData = {
    _id: message._id,
    content: message.content,
    sender: senderId,
    chat: chatId,
    createdAt: message.createdAt,
  };

  const receiverId = chat.members.find(
    (m) => m.toString() !== senderId.toString()
  );

  // Emit to the receiver's room (all their connected devices)
  io.to(receiverId.toString()).emit("NEW_MESSAGE", messageData);

  res.status(201).json({
    success: true,
    message: messageData,
  });
});

const getMessages = TryCatch(async (req, res, next) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId })
    .sort({ createdAt: 1 })
    .limit(50); // paginated logic later

  res.status(200).json({
    success: true,
    messages,
  });
});

export { sendMessage, getMessages };
