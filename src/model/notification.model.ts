import mongoose, { Document, Schema, Types } from "mongoose";
import { InviteStatus } from "../enums/notification.enum";

export interface INotification extends Document {
  _id: Types.ObjectId;
  todoId: Types.ObjectId;
  receiverUserId: Types.ObjectId;
  senderUserId: Types.ObjectId;
  inviteStatus: InviteStatus;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    todoId: { type: Schema.Types.ObjectId, ref: "Todo", required: true },
    receiverUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    inviteStatus: {
      type: String,
      enum: Object.values(InviteStatus),
      default: InviteStatus.Invited,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
