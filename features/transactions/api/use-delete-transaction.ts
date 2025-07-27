import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/hono"
import type { InferResponseType } from "hono"
import { toast } from "sonner"

type ResponseType = InferResponseType<(typeof client.api.transactions)[":id"]["$delete"]>

export const useDeleteTransaction = (id?: string) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.transactions[":id"]["$delete"]({
        param: { id: id! },
      })

      if (!response.ok) {
        throw new Error("Failed to delete transaction")
      }

      return await response.json()
    },
    onSuccess: () => {
      toast.success("Transaction deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["transaction", { id }] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete transaction")
    },
  })

  return mutation
}
