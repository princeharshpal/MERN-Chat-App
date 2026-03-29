import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.middleware.js";
import { User } from "../models/user.model.js";
import { createAccessToken } from "../utils/helper.js";

export const isAuthenticated = TryCatch(async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  if (!accessToken && !refreshToken) {
    return next(new ErrorHandler(401, "Access Denied. No token provided."));
  }

  try {
    if (accessToken) {
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      req.userId = decoded.userId;
      return next();
    }
  } catch (err) {
    if (err.name !== "TokenExpiredError") {
      return next(new ErrorHandler(403, "Invalid access token"));
    }
  }

  if (!refreshToken) {
    return next(new ErrorHandler(403, "Access token expired. Please login again."));
  }

  try {
    const decodedRefresh = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decodedRefresh.userId);
    if (!user || !user.refreshTokens) {
      return next(new ErrorHandler(403, "Invalid refresh session"));
    }

    if (!user.refreshTokens.includes(refreshToken)) {
      return next(new ErrorHandler(403, "Refresh token revoked or invalid"));
    }

    const newAccessToken = createAccessToken(user._id);

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: true,
    });

    req.userId = user._id;
    next();
  } catch (err) {
    return next(new ErrorHandler(403, "Invalid or expired refresh token"));
  }
});
