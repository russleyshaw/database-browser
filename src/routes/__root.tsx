import { RootLayout } from "@/layouts/RootLayout";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { observer } from "mobx-react";

export const Route = createRootRoute({
    notFoundComponent: (props) => <div>Not Found</div>,
    component: observer(() => {
        return (
            <RootLayout>
                <Outlet />
            </RootLayout>
        );
    }),
});
