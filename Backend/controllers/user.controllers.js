import { TryCatch } from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import { createAccessToken, createRefreshToken } from "../utils/helper.js";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../utils/utility.js";

const signUp = TryCatch(async (req, res, next) => {
  const { name, email, password, avatar } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new ErrorHandler(400, "Email already in use"));

  const newUser = await User.create({
    name,
    email,
    password,
    avatar: {
      url: avatar?.url || undefined,
      public_id: avatar?.public_id || "default",
    },
  });

  const accessToken = createAccessToken(newUser._id);
  const refreshToken = createRefreshToken(newUser._id);

  res
    .cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: true,
    })
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 5 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: true,
    })
    .status(201)
    .json({
      message: "User registered successfully",
      user: { name: newUser.name, email: newUser.email },
    });
});

const login = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler(404, "User not found"));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new ErrorHandler(400, "Invalid credentials"));

  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  res
    .cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: true,
    })
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 5 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: true,
    })
    .status(200)
    .json({
      message: "Login successful",
      user: { name: user.name, email: user.email },
    });
});

const logout = TryCatch(async (req, res, next) => {
  res
    .clearCookie("access_token", {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    })
    .clearCookie("refresh_token", {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    })
    .status(200)
    .json({ message: "Logged out successfully" });
});

const getProfile = TryCatch(async (req, res, next) => {
  const userId = req.userId;

  console.log(userId);
  const user = await User.findById(userId);
  console.log(user);
  if (!user) return next(new ErrorHandler(404, "User not found"));

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    user,
  });
});

export { login, signUp, logout, getProfile };
