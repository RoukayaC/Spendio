import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/hono"
import type { InferResponseType } from "hono"

type ResponseType = InferResponseType<typeof client.api.categories.$get>

export const useGetCategories = () => {
  const query = useQuery<ResponseType, Error>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await client.api.categories.$get()

      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      return await response.json()
    },
  })

  return query
}
