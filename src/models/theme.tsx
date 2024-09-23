import { zodLocalStorageGetItem, zodLocalStorageSetItem } from "@/lib/zod";
import { Button, ButtonGroup, Classes } from "@blueprintjs/core";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { z } from "zod";

const THEME_SETTING_KEY = "theme-setting";

export const ThemeSettingSchema = z.enum(["system", "light", "dark"]);
export type ThemeSetting = z.infer<typeof ThemeSettingSchema>;

export const ThemeModeSchema = z.enum(["light", "dark"]);
export type ThemeMode = z.infer<typeof ThemeModeSchema>;

class ThemeModel {
    setting: ThemeSetting;
    systemMode: ThemeMode;

    constructor() {
        const setting = zodLocalStorageGetItem(THEME_SETTING_KEY, ThemeSettingSchema);
        this.setting = setting ?? ThemeSettingSchema.Enum.system;

        const darkModeMq = window.matchMedia("(prefers-color-scheme: dark)");
        this.systemMode = darkModeMq.matches ? ThemeModeSchema.Enum.dark : ThemeModeSchema.Enum.light;

        darkModeMq.addEventListener("change", (e) => {
            this.systemMode = e.matches ? ThemeModeSchema.Enum.dark : ThemeModeSchema.Enum.light;
        });

        makeAutoObservable(this);
    }

    setSetting(setting: ThemeSetting) {
        this.setting = setting;
        zodLocalStorageSetItem(THEME_SETTING_KEY, ThemeSettingSchema, this.setting);
    }

    get mode(): ThemeMode {
        if (this.setting === ThemeSettingSchema.Enum.system) {
            return this.systemMode;
        }

        return this.setting === ThemeSettingSchema.Enum.dark ? ThemeModeSchema.Enum.dark : ThemeModeSchema.Enum.light;
    }
}

export const THEME_STORE = new ThemeModel();

export function useTheme(model: ThemeModel) {
    useEffect(() => {
        if (model.mode === ThemeModeSchema.Enum.dark) {
            document.body.classList.add(Classes.DARK);
        } else {
            document.body.classList.remove(Classes.DARK);
        }
    }, [model.mode]);
}

interface ThemeSelectProps {
    model: ThemeModel;
}

export const ThemeSelect = observer((props: ThemeSelectProps) => {
    const { model } = props;

    return (
        <ButtonGroup>
            <Button
                active={model.setting === ThemeSettingSchema.Enum.system}
                onClick={() => model.setSetting(ThemeSettingSchema.Enum.system)}
                icon="console"
            >
                System
            </Button>
            <Button
                active={model.setting === ThemeSettingSchema.Enum.light}
                onClick={() => model.setSetting(ThemeSettingSchema.Enum.light)}
                icon="lightbulb"
            >
                Light
            </Button>
            <Button
                active={model.setting === ThemeSettingSchema.Enum.dark}
                onClick={() => model.setSetting(ThemeSettingSchema.Enum.dark)}
                icon="moon"
            >
                Dark
            </Button>
        </ButtonGroup>
    );
});
