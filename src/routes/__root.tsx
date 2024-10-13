import { SqlLogOutput } from "@/components/SqlLogOutput";
import { RootLayout } from "@/layouts/RootLayout";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { observer } from "mobx-react";

export const Route = createRootRoute({
    component: observer(Component),
});

function Component() {
    return (
        <RootLayout>
            <Outlet />
            <SqlLogOutput />
        </RootLayout>
    );
}
