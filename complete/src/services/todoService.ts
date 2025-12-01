import { randomUUID } from "node:crypto";
import type { CreateTodoInput, Todo, UpdateTodoInput } from "../types/todo.js";

class TodoService {
  private todos: Map<string, Todo> = new Map();

  async findAll(completed?: boolean): Promise<Todo[]> {
    const todos = Array.from(this.todos.values());
    if (completed !== undefined) {
      return todos.filter((todo) => todo.completed === completed);
    }
    return todos;
  }

  async findById(id: string): Promise<Todo | null> {
    return this.todos.get(id) || null;
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    const now = new Date();
    const todo: Todo = {
      id: randomUUID(),
      title: input.title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    this.todos.set(todo.id, todo);
    return todo;
  }

  async update(id: string, input: UpdateTodoInput): Promise<Todo | null> {
    const todo = this.todos.get(id);
    if (!todo) {
      return null;
    }

    const updated: Todo = {
      ...todo,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.completed !== undefined && { completed: input.completed }),
      updatedAt: new Date(),
    };

    this.todos.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.todos.delete(id);
  }
}

export const todoService = new TodoService();
