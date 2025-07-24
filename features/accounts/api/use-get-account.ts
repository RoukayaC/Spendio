import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import type { InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.accounts.$get>;

export const useGetAccount = (id?: string) => {
  return useQuery<ResponseType, Error>({
    queryKey: ["account", { id }],
    queryFn: async () => {
      const response = await client.api.accounts.$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch account");
      }
      return await response.json();
    },
  });
};
