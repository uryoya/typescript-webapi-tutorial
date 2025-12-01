import type { Todo } from "../types/todo";
import { TodoItem } from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

export function TodoList({
  todos,
  onToggle,
  onDelete,
  isLoading,
}: TodoListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        タスクがありません
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
