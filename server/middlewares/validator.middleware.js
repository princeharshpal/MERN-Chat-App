import { validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error) => error.msg)
      .join("; ");
    return next(new ErrorHandler(400, errorMessages));
  }
  next();
};

export { validateRequest };
