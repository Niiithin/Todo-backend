import { body } from "express-validator";
import { InviteStatus } from "../enums/notification.enum";

export const inviteNotification = [
  body("todoId")
    .notEmpty()
    .withMessage("Todo ID is required")
    .isMongoId()
    .withMessage("Valid todo ID is required"),
  body("receiverEmail")
    .notEmpty()
    .withMessage("Receiver email is required")
    .isEmail()
    .withMessage("Invalid email"),
];

export const handleStatus = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(Object.values(InviteStatus))
    .withMessage("Invalid status")
    .custom((value) => {
      if (value === InviteStatus.Invited) {
        throw new Error("Status cannot be set to 'invited'");
      }
      return true;
    })
    .customSanitizer((value) => {
      return value;
    }),
];
