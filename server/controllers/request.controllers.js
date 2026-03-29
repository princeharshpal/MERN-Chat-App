import { TryCatch } from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import { Request } from "../models/request.model.js";
import { io } from "../socket/server.js";
import { ErrorHandler } from "../utils/utility.js";

const sendRequest = TryCatch(async (req, res, next) => {
  const { receiverId } = req.body;
  const senderId = req.userId;

  if (senderId === receiverId) {
    return next(new ErrorHandler(400, "You cannot send a request to yourself"));
  }

  const existingRequest = await Request.findOne({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  });

  if (existingRequest) {
    if (existingRequest.status === "accepted") {
      return next(new ErrorHandler(400, "You are already friends"));
    }
    if (existingRequest.status === "pending") {
      return next(new ErrorHandler(400, "Friend request already pending"));
    }
  }

  const newRequest = await Request.create({
    sender: senderId,
    receiver: receiverId,
  });

  // Notify receiver in real-time
  io.to(receiverId.toString()).emit("NEW_REQUEST", {
    _id: newRequest._id,
    sender: await User.findById(senderId).select("name avatar email")
  });

  res.status(201).json({
    success: true,
    message: "Friend request sent successfully",
    request: newRequest,
  });
});


const acceptRequest = TryCatch(async (req, res, next) => {
  const { requestId } = req.params;

  const request = await Request.findById(requestId);
  if (!request) return next(new ErrorHandler(404, "Request not found"));

  if (request.receiver.toString() !== req.userId.toString()) {
    return next(
      new ErrorHandler(403, "You are not authorized to accept this request")
    );
  }

  if (request.status !== "pending") {
    return next(new ErrorHandler(400, "Request is already processed"));
  }

  request.status = "accepted";
  await request.save();

  // Notify original sender that they are now friends
  io.to(request.sender.toString()).emit("REQUEST_ACCEPTED", {
    friendId: req.userId,
    requestId: request._id
  });

  res.status(200).json({
    success: true,
    message: "Friend request accepted",
  });
});


const getPendingRequests = TryCatch(async (req, res, next) => {
  const requests = await Request.find({
    receiver: req.userId,
    status: "pending",
  }).populate("sender", "name avatar email");

  res.status(200).json({
    success: true,
    requests,
  });
});


const getFriendsList = TryCatch(async (req, res, next) => {
  const friendships = await Request.find({
    $or: [{ sender: req.userId }, { receiver: req.userId }],
    status: "accepted",
  })
    .populate("sender", "name avatar email")
    .populate("receiver", "name avatar email");

  
  const friends = friendships.map((doc) => {
    if (doc.sender._id.toString() === req.userId.toString()) {
      return doc.receiver;
    }
    return doc.sender;
  });

  res.status(200).json({
    success: true,
    friends,
  });
});


const searchUsers = TryCatch(async (req, res, next) => {
  const { name = "" } = req.query;

  
  const users = await User.find({
    name: { $regex: name, $options: "i" },
    _id: { $ne: req.userId },
  }).select("name avatar email");

  
  const usersWithContext = await Promise.all(
    users.map(async (user) => {
      const interaction = await Request.findOne({
        $or: [
          { sender: req.userId, receiver: user._id },
          { sender: user._id, receiver: req.userId },
        ],
      });

      return {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        isFriend: interaction?.status === "accepted",
        pendingRequest: interaction?.status === "pending",
      };
    })
  );

  res.status(200).json({
    success: true,
    users: usersWithContext,
  });
});

export {
  sendRequest,
  acceptRequest,
  getPendingRequests,
  getFriendsList,
  searchUsers,
};
