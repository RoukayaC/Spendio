import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/hono"
import type { InferRequestType, InferResponseType } from "hono"
import { toast } from "sonner"

type ResponseType = InferResponseType<typeof client.api.categories.$post>
type RequestType = InferRequestType<typeof client.api.categories.$post>["json"]

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.categories.$post({ json })

      if (!response.ok) {
        throw new Error("Failed to create category")
      }

      return await response.json()
    },
    onSuccess: () => {
      toast.success("Category created successfully")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category")
    },
  })

  return mutation
}
