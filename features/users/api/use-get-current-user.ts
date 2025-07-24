import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.users.me.$get>;

export const useGetCurrentUser = () => {
  return useQuery<ResponseType, Error>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const response = await client.api.users.me.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch current user");
      }

      return await response.json();
    },
  });
};