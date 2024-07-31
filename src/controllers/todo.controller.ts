// src/controllers/todoController.ts
import { NextFunction, Request, Response } from "express";
import { ITodo, Todo } from "../model/todo.model";
import { TodoStatus } from "../enums/todo.enum";
import { Types, FilterQuery } from "mongoose";

const PAGE_SIZE = 10;

export const createTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, scheduleDate, dueDate } = req.body;
    const newTodo: ITodo = new Todo({
      title,
      description,
      scheduleDate: new Date(scheduleDate),
      dueDate: new Date(dueDate),
      creator: req.user._id,
      collaboration: [req.user._id],
    });
    await newTodo.save();
    return res.status(201).json({
      success: true,
      message: "Todo created successfully",
      todo: newTodo,
    });
  } catch (error) {
    next(error);
  }
};

export const editTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, description, scheduleDate, dueDate } = req.body;
    const todo = await Todo.findById(id);
    if (!todo) {
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });
    }
    if (!todo.collaboration.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this todo",
      });
    }
    if (title) todo.title = title;
    if (description) todo.description = description;
    if (scheduleDate) todo.scheduleDate = scheduleDate;
    if (dueDate) todo.dueDate = dueDate;
    if (scheduleDate || dueDate) todo.status = TodoStatus.Postponed;

    await todo.save();
    return res.json({
      success: true,
      message: "Todo updated successfully",
      todo,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTodoStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, dueDate, scheduleDate } = req.body;
    const todo = await Todo.findById(id);
    if (!todo) {
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });
    }
    if (!todo.collaboration.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this todo's status",
      });
    }
    if (!Object.values(TodoStatus).includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }
    if (status == todo.status) {
      return res
        .status(400)
        .json({ success: false, message: "Already in same Status" });
    }
    if (todo.status == TodoStatus.Completed) {
      todo.completedDate = null;
    }
    if (status == TodoStatus.Completed) {
      todo.completedDate = new Date();
    } else if (status === TodoStatus.Postponed) {
      if (!dueDate && !scheduleDate) {
        return res.status(400).json({
          success: false,
          message:
            "Due date and Scheduled Date is required when postponing a todo",
        });
      }
      todo.dueDate = new Date(dueDate);
      todo.scheduleDate = new Date(scheduleDate);
    }
    todo.status = status;
    await todo.save();
    return res.json({
      success: true,
      message: "Todo status updated successfully",
      todo,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTodos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  try {
    const userId = req.user._id;
    const todos = await Todo.find({
      $or: [{ creator: userId }, { collaboration: userId }],
    })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .sort({ dueDate: 1 })
      .select({
        _id: 1,
        title: 1,
        description: 1,
        status: 1,
        dueDate: 1,
        collaboration: 1,
      });
    const totalTodos = await Todo.countDocuments({
      $or: [{ creator: userId }, { collaboration: userId }],
    });
    return res.status(200).json({
      success: true,
      message: "Fetched All todos",
      todos,
      currentPage: page,
      totalPages: Math.ceil(totalTodos / PAGE_SIZE),
    });
  } catch (error) {
    next(error);
  }
};

export const searchTodos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const searchTerm = req.query.searchTerm as string;
    if (!searchTerm || searchTerm.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Search term must be at least 3 characters long",
      });
    }
    const userId = req.user._id;
    const todos = await Todo.find({
      $and: [
        {
          $or: [{ creator: userId }, { collaboration: userId }],
        },
        {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { body: { $regex: searchTerm, $options: "i" } },
          ],
        },
      ],
    })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .sort({ dueDate: 1 })
      .select({
        _id: 1,
        title: 1,
        description: 1,
        status: 1,
        dueDate: 1,
      });
    const totalTodos = await Todo.countDocuments({
      $and: [
        {
          $or: [{ creator: userId }, { collaboration: userId }],
        },
        {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { body: { $regex: searchTerm, $options: "i" } },
          ],
        },
      ],
    });
    return res.status(200).json({
      success: true,
      msg: "Fetched Searched Todos",
      todos,
      currentPage: page,
      totalPages: Math.ceil(totalTodos / PAGE_SIZE),
    });
  } catch (error) {
    next(error);
  }
};

export const getTodosByDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const dateString = req.query.date as string;
    const todoStatus = req.query.status as string;
    if (!dateString) {
      return res.status(400).json({
        success: false,
        message: "Date is required as a query parameter",
      });
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }
    const userId = req.user._id;
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const query: FilterQuery<ITodo> = {
      $and: [
        {
          $or: [{ creator: userId }, { collaboration: userId }],
        },
        {
          $or: [
            { scheduleDate: { $gte: startOfDay, $lt: endOfDay } },
            { dueDate: { $gte: startOfDay, $lt: endOfDay } },
            { completedDate: { $gte: startOfDay, $lt: endOfDay } },
          ],
        },
      ],
    };
    if (todoStatus !== undefined && todoStatus !== "") {
      (query.$and as any[]).push({ status: todoStatus });
    }
    const todos = await Todo.find(query)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .sort({ dueDate: 1 });
    const totalTodos = await Todo.countDocuments(query);
    return res.status(200).json({
      success: true,
      message: `Fetched todos for date ${dateString}`,
      todos,
      currentPage: page,
      totalPages: Math.ceil(totalTodos / PAGE_SIZE),
    });
  } catch (error) {
    next(error);
  }
};

export const getTodoById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const todoId = req.params.todoId;
    if (!Types.ObjectId.isValid(todoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid todo ID",
      });
    }
    const todo = await Todo.findOne({
      _id: todoId,
      $or: [{ creator: userId }, { collaboration: userId }],
    })
      .populate("creator", "email username")
      .populate("collaboration", "email username");
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found or you don't have access to it",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Fetched Todo successfully",
      todo,
    });
  } catch (error) {
    next(error);
  }
};
