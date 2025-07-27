import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.middleware.js";

export const isAuthenticated = TryCatch((req, res, next) => {
  const token = req.cookies.access_token;
  console.log("token", token);
  if (!token)
    return next(new ErrorHandler(401, "Access Denied. No token provided."));

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return next(new ErrorHandler(403, "Invalid or expired token"));
  }
});
