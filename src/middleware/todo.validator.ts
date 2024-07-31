import { body, param } from "express-validator";
import { TodoStatus } from "../enums/todo.enum";

export const createTodoValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Title must be between 3 and 20 characters"),
  body("description")
    .notEmpty()
    .withMessage("description is required")
    .isLength({ min: 5, max: 10000 })
    .withMessage("description must be between 5 and 5000 characters"),
  body("scheduleDate")
    .notEmpty()
    .withMessage("Schedule date is required")
    .isISO8601()
    .toDate()
    .withMessage("Valid schedule date is required"),
  body("dueDate")
    .notEmpty()
    .withMessage("Due date is required")
    .isISO8601()
    .toDate()
    .withMessage("Valid due date is required"),
];

export const editTodoValidation = [
  param("id").isMongoId().withMessage("Valid todo ID is required"),
  body("title")
    .optional()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("description cannot be empty")
    .isLength({ min: 5, max: 10000 })
    .withMessage("description must be between 10 and 1000 characters"),
  body("scheduleDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Valid schedule date is required"),
  body("dueDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Valid due date is required"),
];

export const updateTodoStatusValidation = [
  param("id").isMongoId().withMessage("Valid todo ID is required"),
  body("status").isIn(Object.values(TodoStatus)).withMessage("Invalid status"),
  body("dueDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Valid dueDate is required when postponing"),
  body("scheduleDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Valid scheduleDate is required when postponing"),
];
