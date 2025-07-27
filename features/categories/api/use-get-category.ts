import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/hono"
import type { InferResponseType } from "hono"

type ResponseType = InferResponseType<(typeof client.api.categories)[":id"]["$get"]>

export const useGetCategory = (id?: string) => {
  return useQuery<ResponseType, Error>({
    enabled: !!id,
    queryKey: ["category", { id }],
    queryFn: async () => {
      const response = await client.api.categories[":id"]["$get"]({
        param: { id: id! },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch category")
      }

      return await response.json()
    },
  })
}
