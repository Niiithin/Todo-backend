import mongoose, { Document, Schema, Types } from "mongoose";
import { TodoStatus } from "../enums/todo.enum";

export interface ITodo extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  scheduleDate: Date;
  dueDate: Date;
  completedDate: Date | null;
  status: TodoStatus;
  collaboration: Types.ObjectId[];
  creator: Types.ObjectId;
}

const TodoSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  scheduleDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  completedDate: { type: Date, default: null },
  status: {
    type: String,
    enum: Object.values(TodoStatus),
    default: TodoStatus.NotCompleted,
  },
  collaboration: [{ type: Schema.Types.ObjectId, ref: "User" }],
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const Todo = mongoose.model<ITodo>("Todo", TodoSchema);
