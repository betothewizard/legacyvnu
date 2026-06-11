import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message || "Đã xảy ra lỗi khi tải dữ liệu");
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(error.message || "Yêu cầu không thành công");
    },
  }),
});
