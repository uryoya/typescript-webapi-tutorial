import type { Todo } from "../types/todo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-card border rounded-lg hover:shadow-md transition-shadow">
      <Checkbox
        checked={todo.completed}
        onChange={(e) => onToggle(todo.id, e.currentTarget.checked)}
      />
      <span
        className={cn(
          "flex-1",
          todo.completed && "line-through text-muted-foreground"
        )}
      >
        {todo.title}
      </span>
      <Button
        onClick={() => onDelete(todo.id)}
        variant="destructive"
        size="icon"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
