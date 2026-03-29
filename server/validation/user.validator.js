import { body, param } from "express-validator";

const registerValidator = [
  body("name", "Name is required").notEmpty().trim(),
  body("email", "Please enter a valid email address").isEmail().normalizeEmail(),
  body("password", "Password must be at least 6 characters long").isLength({
    min: 6,
  }),
];

const loginValidator = [
  body("email", "Please enter a valid email address").isEmail().normalizeEmail(),
  body("password", "Password is required").notEmpty(),
];

export {
  registerValidator,
  loginValidator,
};
