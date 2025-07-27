import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/hono"
import type { InferRequestType, InferResponseType } from "hono"
import { toast } from "sonner"

type ResponseType = InferResponseType<(typeof client.api.categories)[":id"]["$patch"]>
type RequestType = InferRequestType<(typeof client.api.categories)[":id"]["$patch"]>

export const useEditCategory = (id?: string) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<ResponseType, Error, RequestType["json"]>({
    mutationFn: async (json) => {
      const response = await client.api.categories[":id"]["$patch"]({
        param: { id: id! },
        json,
      })

      if (!response.ok) {
        throw new Error("Failed to edit category")
      }

      return await response.json()
    },
    onSuccess: () => {
      toast.success("Category updated successfully")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["category", { id }] })
    },
    onError: (error) => {
      toast.error(error.message || "Failed to edit category")
    },
  })

  return mutation
}
