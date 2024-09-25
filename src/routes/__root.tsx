import { SETTINGS_MODEL } from "@/components/SettingsDialog";
import { Titlebar } from "@/components/Titlebar";
import { THEME_STORE, useTheme } from "@/models/theme";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { observer } from "mobx-react";

export const Route = createRootRoute({
    component: observer(() => {
        useTheme(THEME_STORE);

        return (
            <div className="flex flex-col grow h-full overflow-hidden items-stretch">
                <Titlebar />

                <Outlet />

                {SETTINGS_MODEL.values.isDebug && (
                    <>
                        <ReactQueryDevtools />
                        <TanStackRouterDevtools />
                    </>
                )}
            </div>
        );
    }),
});
