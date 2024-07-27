import { NextFunction, Request, Response } from "express";
import { INotification, Notification } from "../model/notification.model";
import { User } from "../model/user.model";
import { InviteStatus } from "../enums/notification.enum";
import { Todo } from "../model/todo.model";
import mongoose, { Types } from "mongoose";

export const inviteUserByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { todoId, receiverEmail } = req.body;
    const senderUserId = req.user._id;
    const receiverUser = await User.findOne({ email: receiverEmail }).select(
      "_id email"
    );
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: "Receiver user not found",
      });
    }
    if (receiverEmail == req.user.email) {
      return res.status(400).json({
        success: false,
        message: "Cannot Invite Yourself",
      });
    }
    const todo = await Todo.findById(todoId);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }
    const isAlreadyCollaborator = todo.collaboration.includes(receiverUser._id);
    if (isAlreadyCollaborator) {
      return res.status(400).json({
        success: false,
        message: "User is already a collaborator on this todo",
      });
    }
    const notification = new Notification({
      todoId,
      senderUserId,
      receiverUserId: receiverUser._id,
    });
    await notification.save();
    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      notification,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchUserNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const totalNotifications = await Notification.countDocuments({
      $or: [{ senderUserId: userId }, { receiverUserId: userId }],
    });
    const notifications = await Notification.find({
      $or: [{ senderUserId: userId }, { receiverUserId: userId }],
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "todoId",
        select: "_id title description",
      })
      .populate({
        path: "senderUserId",
        select: "-password",
      })
      .populate({
        path: "receiverUserId",
        select: "-password",
      });
    return res.status(200).json({
      success: true,
      message: "Fetched User Notifications",
      notifications,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit),
      totalNotifications,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInviteStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    if (notification.inviteStatus !== InviteStatus.Invited) {
      return res.status(400).json({
        success: false,
        message: "Notification Either Accepted or Rejected",
      });
    }
    if (notification.receiverUserId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this invitation status",
      });
    }
    const updatedNotification = await handleNotification(
      notification,
      userId,
      status
    );
    return res.status(200).json({
      success: true,
      message: "Invite status updated successfully",
      notification: updatedNotification,
    });
  } catch (error) {
    next(error);
  }
};

const handleNotification = async (
  notification: INotification,
  userId: Types.ObjectId,
  status: InviteStatus
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    notification.inviteStatus = status;
    const updatedNotification = await notification.save({ session });
    const todo = await Todo.findById(notification.todoId).session(session);
    if (!todo) {
      throw new Error("Todo not found");
    }
    if (status === InviteStatus.Accepted) {
      if (!todo.collaboration.includes(userId)) {
        todo.collaboration.push(userId);
        await todo.save({ session });
      }
    }
    await session.commitTransaction();
    session.endSession();
    return updatedNotification;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
