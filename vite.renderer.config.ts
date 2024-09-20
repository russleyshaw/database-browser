import path from "node:path";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig } from "vite";
import { pluginExposeRenderer } from "./vite.base.config";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config
export default defineConfig((env) => {
    const forgeEnv = env as ConfigEnv<"renderer">;
    const { root, mode, forgeConfigSelf } = forgeEnv;
    const name = forgeConfigSelf.name ?? "";

    return {
        root,
        mode,
        base: "./",
        build: {
            outDir: `.vite/renderer/${name}`,
        },
        plugins: [
            pluginExposeRenderer(name),
            TanStackRouterVite({
                routesDirectory: "./src/renderer/routes",
                generatedRouteTree: "./src/renderer/routeTree.gen.ts",
            }),
            react(),
        ],
        resolve: {
            preserveSymlinks: true,
            alias: {
                "@common": path.resolve(__dirname, "src/common"),
            },
        },
        clearScreen: false,
    } as UserConfig;
});
