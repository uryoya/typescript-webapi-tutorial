import { z } from "zod";

// Todo entity type
export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Zod schemas for validation
export const createTodoSchema = z.object({
  title: z.string().min(1, "title is required"),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

export const todoFilterSchema = z.object({
  completed: z.enum(["true", "false"]).optional(),
});

// Type exports from schemas
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type TodoFilter = z.infer<typeof todoFilterSchema>;
