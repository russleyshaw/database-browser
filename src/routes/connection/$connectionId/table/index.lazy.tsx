import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/connection/$connectionId/table/")({
    component: () => <div>Hello /connection/$connectionId/table/!</div>,
});
