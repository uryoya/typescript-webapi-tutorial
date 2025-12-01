import { useState } from "react";
import { TodoFilterComponent } from "./components/TodoFilter";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { useTodos } from "./hooks/useTodos";
import type { TodoFilter } from "./types/todo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function App() {
  const [filter, setFilter] = useState<TodoFilter>("all");

  const completedFilter =
    filter === "all" ? undefined : filter === "completed" ? true : false;

  const {
    todos,
    isLoading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    isCreating,
  } = useTodos(completedFilter);

  const handleCreate = (title: string) => {
    createTodo({ title });
  };

  const handleToggle = (id: string, completed: boolean) => {
    updateTodo({ id, data: { completed } });
  };

  const handleDelete = (id: string) => {
    deleteTodo(id);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-destructive text-center">
              エラーが発生しました: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">📝 ToDo App</CardTitle>
          </CardHeader>
          <CardContent>
            <TodoForm onSubmit={handleCreate} isLoading={isCreating} />

            <TodoFilterComponent
              currentFilter={filter}
              onFilterChange={setFilter}
            />

            <TodoList
              todos={todos}
              onToggle={handleToggle}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
