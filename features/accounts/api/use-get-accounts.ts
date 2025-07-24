import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.accounts.$get>;

export const useGetAccount = () => {
  const query = useQuery<ResponseType, Error>({
    queryKey: ["account"],
    queryFn: async () => {
      const response = await client.api.accounts.$get({});
      if (!response.ok) {
        throw new Error("Faild to fetch accounts");
      }
      return await response.json();
    },
  });
  return query;
};
