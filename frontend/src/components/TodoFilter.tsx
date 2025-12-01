import type { TodoFilter } from "../types/todo";
import { Button } from "@/components/ui/button";

type TodoFilterProps = {
  currentFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
};

export function TodoFilterComponent({
  currentFilter,
  onFilterChange,
}: TodoFilterProps) {
  const filters: { label: string; value: TodoFilter }[] = [
    { label: "全て", value: "all" },
    { label: "未完了", value: "active" },
    { label: "完了済み", value: "completed" },
  ];

  return (
    <div className="flex gap-2 mb-4">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          variant={currentFilter === filter.value ? "default" : "outline"}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
