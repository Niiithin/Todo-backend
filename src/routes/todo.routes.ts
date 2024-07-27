// src/routes/todoRoutes.ts
import express from "express";
import { validateRequestBody } from "../middleware/validaterequest.midlleware";
import { authenticate } from "../middleware/auth.middleware";
import {
  createTodoValidation,
  editTodoValidation,
  updateTodoStatusValidation,
} from "../middleware/todo.validator";
import {
  createTodo,
  editTodo,
  getAllTodos,
  getTodoById,
  getTodosByDate,
  searchTodos,
  updateTodoStatus,
} from "../controllers/todo.controller";

const router = express.Router();

router.post(
  "/create-todo",
  authenticate,
  createTodoValidation,
  validateRequestBody,
  createTodo
);
router.put(
  "/edit-todo/:id",
  authenticate,
  editTodoValidation,
  validateRequestBody,
  editTodo
);
router.put(
  "/update-todo-status/:id",
  authenticate,
  updateTodoStatusValidation,
  validateRequestBody,
  updateTodoStatus
);
router.get("/", authenticate, getAllTodos);
router.get("/search", authenticate, searchTodos);
router.get("/filter", authenticate, getTodosByDate);
router.get("/:todoId", authenticate, getTodoById);

export default router;
