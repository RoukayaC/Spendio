import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/hono"
import type { InferResponseType } from "hono"
import { toast } from "sonner"

type ResponseType = InferResponseType<(typeof client.api.categories)[":id"]["$delete"]>

export const useDeleteCategory = (id?: string) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.categories[":id"]["$delete"]({
        param: { id: id! },
      })

      if (!response.ok) {
        throw new Error("Failed to delete category")
      }

      return await response.json()
    },
    onSuccess: () => {
      toast.success("Category deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["category", { id }] })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete category")
    },
  })

  return mutation
}
