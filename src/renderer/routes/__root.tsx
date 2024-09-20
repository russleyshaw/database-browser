import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useAtomValue } from "jotai";
import { observer } from "mobx-react";

export const Route = createRootRoute({
    component: observer(() => {
        return (
            <>
                <Outlet />

                <ReactQueryDevtools />
                <TanStackRouterDevtools />
            </>
        );
    }),
});
