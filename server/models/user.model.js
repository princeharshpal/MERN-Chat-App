import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      url: {
        type: String,
        required: true,
        default:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeY9iexcyPyTUgMEKZ6dU1ZoFRmhNgOyG9Ww&s",
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    refreshTokens: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

export const User = mongoose.model("User", userSchema);
