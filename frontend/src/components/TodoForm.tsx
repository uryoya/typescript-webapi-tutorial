import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TodoFormProps = {
  onSubmit: (title: string) => void;
  isLoading?: boolean;
};

export function TodoForm({ onSubmit, isLoading }: TodoFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="新しいタスクを入力..."
        disabled={isLoading}
      />
      <Button
        type="submit"
        disabled={isLoading || !title.trim()}
        className="bg-black hover:bg-black/90 text-white"
      >
        追加
      </Button>
    </form>
  );
}
