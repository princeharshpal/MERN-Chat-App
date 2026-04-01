import Connection from "../models/connection.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const sendRequest = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  const senderId = req.user._id;

  if (senderId.toString() === recipientId) {
    throw new ApiError(400, "Cannot send request to yourself");
  }

  const existingConnection = await Connection.findOne({
    $or: [
      { sender: senderId, recipient: recipientId },
      { sender: recipientId, recipient: senderId },
    ],
  });

  if (existingConnection) {
    throw new ApiError(400, "Connection already exists or is pending");
  }

  const newConnection = await Connection.create({
    sender: senderId,
    recipient: recipientId,
    status: "pending",
  });

  const receiverSocketId = getReceiverSocketId(recipientId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newFriendRequest", {
      sender: req.user,
      connectionId: newConnection._id,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newConnection, "Friend request sent"));
});

export const respondToRequest = asyncHandler(async (req, res) => {
  const { connectionId } = req.body;
  const status = req.body.status?.trim()?.toLowerCase();
  const userId = req.user._id;

  if (!["accepted", "rejected"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const connection = await Connection.findById(connectionId);

  if (!connection || connection.recipient.toString() !== userId.toString()) {
    throw new ApiError(404, "Request not found or unauthorized");
  }

  connection.status = status;
  await connection.save();

  const requesterSocketId = getReceiverSocketId(connection.sender);
  if (requesterSocketId) {
    io.to(requesterSocketId).emit("friendRequestResponse", {
      recipient: req.user,
      status,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, connection, `Request ${status}`));
});

export const getPossibleConnections = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const connections = await Connection.find({
    $or: [{ sender: userId }, { recipient: userId }],
  });

  const connectedUserIds = connections.map((c) =>
    c.sender.toString() === userId.toString() ? c.recipient : c.sender,
  );

  const users = await User.find({
    _id: { $nin: [...connectedUserIds, userId] },
  }).select("-password -refreshTokens");

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Possible connections fetched"));
});

export const getFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const connections = await Connection.find({
    $or: [{ sender: userId }, { recipient: userId }],
    status: "accepted",
  }).populate("sender recipient", "-password -refreshTokens");

  const friends = connections.map((c) =>
    c.sender._id.toString() === userId.toString() ? c.recipient : c.sender,
  );

  return res.status(200).json(new ApiResponse(200, friends, "Friends fetched"));
});

export const getPendingRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const requests = await Connection.find({
    recipient: userId,
    status: "pending",
  }).populate("sender", "-password -refreshTokens");

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Pending requests fetched"));
});
