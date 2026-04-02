import { Server } from "socket.io";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`[Socket] New Connection! ID: ${socket.id}, User ID: ${userId}`);

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    socket.join(userId);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("joinGroup", ({ groupId }) => {
    if (groupId) {
      console.log(`[Socket] User ${userId} joined Group Room: ${groupId}`);
      socket.join(groupId);
    }
  });

  socket.on("leaveGroup", ({ groupId }) => {
    if (groupId) {
      console.log(`[Socket] User ${userId} left Group Room: ${groupId}`);
      socket.leave(groupId);
    }
  });

  socket.on("markAsSeen", async ({ senderId }) => {
    const now = new Date();
    try {
      await Message.updateMany(
        { senderId, receiverId: userId, isSeen: false },
        { $set: { isSeen: true, seenAt: now } },
      );
    } catch (err) {
      console.error("Error marking messages as seen:", err);
    }
    io.to(senderId).emit("messageSeen", {
      receiverId: userId,
      seenAt: now,
    });
  });

  socket.on("sendMessage", async (data) => {
    const { receiverId, groupId, text, image, tempId, replyTo } = data;
    const senderId = userId;

    if (!receiverId && !groupId) {
      console.warn("[Server] sendMessage aborted: missing recipient/group");
      return;
    }

    try {
      const newMessage = await Message.create({
        senderId,
        receiverId: !groupId ? receiverId : undefined,
        groupId: groupId || undefined,
        text,
        image,
        replyTo,
      });

      const populatedMessage = await Message.findById(newMessage._id).populate(
        "replyTo senderId",
        "-password -refreshTokens",
      );

      const target = groupId ? groupId : receiverId;

      io.to(target).emit("newMessage", populatedMessage);

      socket.to(senderId).emit("newMessage", populatedMessage);

      socket.emit("messageSaved", {
        ...populatedMessage.toObject(),
        tempId,
      });
    } catch (error) {
      console.error("Error in sendMessage socket:", error);
    }
  });

  socket.on("editMessage", async (data) => {
    const { messageId, text, receiverId, groupId } = data;
    try {
      const message = await Message.findOneAndUpdate(
        { _id: messageId, senderId: userId },
        { text, isEdited: true },
        { new: true },
      );
      if (message) {
        const target = groupId || receiverId;
        io.to(target).emit("messageEdited", { messageId, text });
        socket.to(userId).emit("messageEdited", { messageId, text });
      }
    } catch (error) {
      console.error("Error editing message via socket:", error);
    }
  });

  socket.on("unsendMessage", async (data) => {
    const { messageId, receiverId, groupId } = data;

    if (!mongoose.Types.ObjectId.isValid(messageId)) return;

    try {
      const message = await Message.findOneAndDelete({
        _id: messageId,
        senderId: userId,
      });
      if (message) {
        const target = groupId || receiverId;
        io.to(target).emit("messageUnsent", { messageId });
        socket.to(userId).emit("messageUnsent", { messageId });
      }
    } catch (error) {
      console.error("Error unsending message via socket:", error);
    }
  });

  socket.on("addReaction", async (data) => {
    const { messageId, emoji, receiverId, groupId } = data;
    try {
      const message = await Message.findById(messageId);
      if (message) {
        if (!message.reactions) message.reactions = [];
        const index = message.reactions.findIndex(
          (r) => r.userId.toString() === userId.toString(),
        );

        if (index > -1) {
          if (message.reactions[index].emoji === emoji) {
            message.reactions.splice(index, 1);
          } else {
            message.reactions[index].emoji = emoji;
          }
        } else {
          message.reactions.push({ userId, emoji });
        }

        await message.save();

        const target = groupId || receiverId;
        io.to(target).emit("messageReactionUpdate", {
          messageId,
          userId,
          emoji,
        });
        socket.to(userId).emit("messageReactionUpdate", {
          messageId,
          userId,
          emoji,
        });
      }
    } catch (error) {
      console.error("Error adding reaction via socket:", error);
    }
  });

  socket.on("typing", ({ receiverId, groupId }) => {
    const target = groupId || receiverId;
    io.to(target).emit("userTyping", { senderId: userId, groupId });
  });

  socket.on("stopTyping", ({ receiverId, groupId }) => {
    const target = groupId || receiverId;
    io.to(target).emit("userStopTyping", { senderId: userId, groupId });
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
