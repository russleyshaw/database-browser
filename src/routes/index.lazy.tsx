import { SplashScreen } from "@/views/splashscreen";
import { createLazyFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react";

export const Route = createLazyFileRoute("/")({
    component: observer(() => {
        return <SplashScreen />;
    }),
});
