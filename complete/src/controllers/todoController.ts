import type { RequestHandler } from "express";
import {
  createTodoSchema,
  todoFilterSchema,
  updateTodoSchema,
} from "../types/todo.js";
import { todoService } from "../services/todoService.js";

// GET /api/todos
export const getTodos: RequestHandler = async (req, res, next) => {
  try {
    const filterResult = todoFilterSchema.safeParse(req.query);
    if (!filterResult.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "completed must be 'true' or 'false'",
        },
      });
    }

    const completed =
      filterResult.data.completed === "true"
        ? true
        : filterResult.data.completed === "false"
          ? false
          : undefined;

    const todos = await todoService.findAll(completed);

    // Convert Date to ISO string for JSON response
    res.json({
      todos: todos.map((todo) => ({
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/todos/:id
export const getTodoById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const todo = await todoService.findById(id);

    if (!todo) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Todo not found",
        },
      });
    }

    res.json({
      todo: {
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/todos
export const createTodo: RequestHandler = async (req, res, next) => {
  try {
    const result = createTodoSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "title is required",
        },
      });
    }

    const todo = await todoService.create(result.data);

    res.status(201).json({
      todo: {
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/todos/:id
export const updateTodo: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = updateTodoSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: result.error.errors[0].message,
        },
      });
    }

    const todo = await todoService.update(id, result.data);

    if (!todo) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Todo not found",
        },
      });
    }

    res.json({
      todo: {
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/todos/:id
export const deleteTodo: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await todoService.delete(id);

    if (!deleted) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Todo not found",
        },
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
