import { body, param } from "express-validator";

const sendRequestValidator = [
  body("receiverId", "Please provide a valid receiver ID").isMongoId(),
];

const acceptRequestValidator = [
  param("requestId", "Please provide a valid friend request ID").isMongoId(),
];

export {
  sendRequestValidator,
  acceptRequestValidator,
};
