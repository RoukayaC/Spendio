import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import type { InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.transactions.$get>;

export const useGetTransactions = (params?: {
  accountId?: string;
  categoryId?: string;
}) => {
  const query = useQuery<ResponseType, Error>({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const response = await client.api.transactions.$get({
        query: {
          accountId: params?.accountId,
          categoryId: params?.categoryId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      return await response.json();
    },
  });

  return query;
};
