import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  fetchUserNotifications,
  inviteUserByEmail,
  updateInviteStatus,
} from "../controllers/notification.controller";
import { validateRequestBody } from "../middleware/validaterequest.midlleware";
import {
  handleStatus,
  inviteNotification,
} from "../middleware/notification.validator";

const router = express.Router();

router.post(
  "/invite",
  authenticate,
  inviteNotification,
  validateRequestBody,
  inviteUserByEmail
);
router.get("/", authenticate, fetchUserNotifications);
router.patch(
  "/:notificationId",
  authenticate,
  handleStatus,
  validateRequestBody,
  updateInviteStatus
);

export default router;
