import type {
  CreateTodoRequest,
  TodoResponse,
  TodosResponse,
  UpdateTodoRequest,
} from "../types/todo";

const API_BASE = "/api";

export const todosApi = {
  async getAll(completed?: boolean): Promise<TodosResponse> {
    const params = new URLSearchParams();
    if (completed !== undefined) {
      params.set("completed", String(completed));
    }
    const url = `${API_BASE}/todos${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch todos");
    }
    return response.json();
  },

  async getById(id: string): Promise<TodoResponse> {
    const response = await fetch(`${API_BASE}/todos/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch todo");
    }
    return response.json();
  },

  async create(data: CreateTodoRequest): Promise<TodoResponse> {
    const response = await fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to create todo");
    }
    return response.json();
  },

  async update(id: string, data: UpdateTodoRequest): Promise<TodoResponse> {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to update todo");
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete todo");
    }
  },
};
