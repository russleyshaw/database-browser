import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/index.css";

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";

import "normalize.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

// const test = await invoke("greet", { name: "World" });
// console.log(test);

import { assertExists } from "@/lib/utils";
import { BlueprintProvider } from "@blueprintjs/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { queryClient } from "./global";

const rootEl = document.getElementById("root");
assertExists(rootEl);

const Root = observer(() => {
    return (
        <StrictMode>
            <BlueprintProvider>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router} />
                </QueryClientProvider>
            </BlueprintProvider>
        </StrictMode>
    );
});
const root = createRoot(rootEl);
root.render(<Root />);

// window.addEventListener("error", (event) => {
//     TOASTER.show({ intent: Intent.DANGER, message: event.error.message });
// });
