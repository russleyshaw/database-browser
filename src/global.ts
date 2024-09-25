import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const IS_DEV_MODE = import.meta.env.DEV;
