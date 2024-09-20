import { Classes } from "@blueprintjs/core";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export enum ThemeSetting {
    LIGHT = "light",
    DARK = "dark",
}

export const THEME_SETTING_ATOM = atomWithStorage<ThemeSetting>("theme", ThemeSetting.LIGHT);

export const OPENAPI_KEY_ATOM = atomWithStorage<string>("openapi_key", "");
