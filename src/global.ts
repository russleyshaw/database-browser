import { OverlayToaster } from "@blueprintjs/core";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();
export const TOASTER = await OverlayToaster.createAsync({ position: "bottom" });

export const IS_DEV_MODE = import.meta.env.DEV;
