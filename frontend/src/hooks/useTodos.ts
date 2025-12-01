import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todosApi } from "../api/todos";
import type { CreateTodoRequest, UpdateTodoRequest } from "../types/todo";

export function useTodos(completed?: boolean) {
  const queryClient = useQueryClient();

  const todosQuery = useQuery({
    queryKey: ["todos", { completed }],
    queryFn: () => todosApi.getAll(completed),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTodoRequest) => todosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      todosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => todosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return {
    todos: todosQuery.data?.todos ?? [],
    isLoading: todosQuery.isLoading,
    error: todosQuery.error,
    createTodo: createMutation.mutate,
    updateTodo: updateMutation.mutate,
    deleteTodo: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
