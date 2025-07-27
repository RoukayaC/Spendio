import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import type { InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.transactions.$get>;

export const useGetTransaction = (id?: string) => {
  return useQuery<ResponseType, Error>({
    queryKey: ["transaction", { id }],
    queryFn: async () => {
      const response = await client.api.transactions.$get({
        query: { accountId: id },
        
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transaction");
      }
      return await response.json();
    },
  });
};
