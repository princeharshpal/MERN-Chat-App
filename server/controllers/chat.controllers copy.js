import { TryCatch } from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import { ErrorHandler } from "../utils/utility.js";

const newGroupChat = TryCatch(async (req, res, next) => {
  const { name, email, password, avatar } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new ErrorHandler(400, "Email already in use"));

  
});

export { newGroupChat };
