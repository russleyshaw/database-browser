import { OverlayToaster } from "@blueprintjs/core";
import { QueryClient } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

export const queryClient = new QueryClient();
export const TOASTER = await OverlayToaster.createAsync(
    { position: "bottom" },
    {
        domRenderer: (toaster, containerElement) => createRoot(containerElement).render(toaster),
    },
);

export const IS_DEV_MODE = import.meta.env.DEV;
