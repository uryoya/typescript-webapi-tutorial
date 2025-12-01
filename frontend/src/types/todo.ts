export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TodosResponse = {
  todos: Todo[];
};

export type TodoResponse = {
  todo: Todo;
};

export type CreateTodoRequest = {
  title: string;
};

export type UpdateTodoRequest = {
  title?: string;
  completed?: boolean;
};

export type TodoFilter = "all" | "completed" | "active";
