import { Button, ButtonGroup, Intent } from "@blueprintjs/core";
import { appWindow } from "@tauri-apps/api/window";

export interface TitlebarProps {
    title?: string;
    children?: React.ReactNode;
}

export function Titlebar({ title, children }: TitlebarProps) {
    return (
        <div data-tauri-drag-region className="p-1 flex flex-row h-8 z-[1000]">
            <div className="flex flex-row items-center gap-2">
                <div>{title ?? document.title}</div>
                {children}
                <span className="text-xs text-gray-500 font-mono select-none">{window.location.href}</span>
            </div>
            <div data-tauri-drag-region className="flex-1">
                &nbsp;
            </div>
            <ButtonGroup minimal>
                <Button minimal intent={Intent.WARNING} small onClick={() => appWindow.minimize()} icon="minus" />
                <Button
                    minimal
                    intent={Intent.SUCCESS}
                    small
                    onClick={() => appWindow.toggleMaximize()}
                    icon="small-square"
                />
                <Button minimal intent={Intent.DANGER} small onClick={() => appWindow.close()} icon="cross" />
            </ButtonGroup>
        </div>
    );
}
