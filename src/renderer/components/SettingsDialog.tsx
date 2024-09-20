import {
    Button,
    ButtonGroup,
    Callout,
    Card,
    CardList,
    Dialog,
    DialogBody,
    DialogFooter,
    FormGroup,
    H3,
    Icon,
    type IconName,
    IconSize,
    InputGroup,
    Intent,
    Label,
    Spinner,
    SpinnerSize,
    Tooltip,
} from "@blueprintjs/core";
import { assertExists, assertKeyOfObject } from "@common/utils";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState } from "react";
import { useDebounce } from "react-use";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { OPENAPI_KEY_ATOM, THEME_SETTING_ATOM, ThemeSetting } from "../models/settings";
import { useOpenAI } from "../openai";

const SETTINGS_TABS = {
    general: { name: "General", icon: "cog" },
    database: { name: "Database", icon: "database" },
} satisfies Record<string, { name: string; icon: IconName }>;
type SettingsTabKey = keyof typeof SETTINGS_TABS;

interface SettingsDialogProps {
    onClose: () => void;
}

export function SettingsDialog({ onClose }: SettingsDialogProps) {
    const [selectedTabKey, setSelectedTabKey] = useState<SettingsTabKey>("general");

    const tabs = Array.from(Object.entries(SETTINGS_TABS));

    return (
        <Dialog title="Settings" isOpen onClose={onClose}>
            <DialogBody className="grid left-pane-grid gap-2">
                <CardList bordered>
                    {tabs.map(([tabName, tab]) => (
                        <Card
                            className="active:bg-gray-100"
                            interactive
                            key={tabName}
                            onClick={() => {
                                assertKeyOfObject(SETTINGS_TABS, tabName);
                                setSelectedTabKey(tabName);
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <Icon icon={tab.icon} />
                                {tab.name}
                            </div>
                        </Card>
                    ))}
                </CardList>

                <div>
                    {selectedTabKey === "general" && <GeneralSettings />}
                    {selectedTabKey === "database" && <DatabaseSettings />}
                </div>
            </DialogBody>

            <DialogFooter />
        </Dialog>
    );
}

function GeneralSettings() {
    const [themeSetting, setThemeSetting] = useAtom(THEME_SETTING_ATOM);
    const [openaiKey, setOpenaiKey] = useAtom(OPENAPI_KEY_ATOM);

    return (
        <>
            <H3>General Settings</H3>

            <FormGroup>
                <Label>Theme</Label>
                <ButtonGroup>
                    <Button icon="console">System</Button>
                    <Button
                        active={themeSetting === ThemeSetting.LIGHT}
                        onClick={() => {
                            setThemeSetting(ThemeSetting.LIGHT);
                        }}
                        icon="lightbulb"
                    >
                        Light
                    </Button>
                    <Button
                        active={themeSetting === ThemeSetting.DARK}
                        onClick={() => {
                            setThemeSetting(ThemeSetting.DARK);
                        }}
                        icon="moon"
                    >
                        Dark
                    </Button>
                </ButtonGroup>
            </FormGroup>

            <OpenAiKeyInput openaiKey={openaiKey} setOpenaiKey={setOpenaiKey} />
        </>
    );
}

function DatabaseSettings() {
    return (
        <>
            <div>Database Settings</div>
        </>
    );
}

function OpenAiKeyInput({ openaiKey, setOpenaiKey }: { openaiKey: string; setOpenaiKey: (key: string) => void }) {
    const debouncedOpenaiKey = useDebouncedValue(openaiKey, 1000);

    const openai = useOpenAI(debouncedOpenaiKey ?? "");

    const chatCompletionQuery = useQuery({
        queryKey: ["openai", "test", debouncedOpenaiKey],
        enabled: !!openai,
        queryFn: async () => {
            assertExists(openai);
            return openai.chat.completions.create({
                messages: [{ role: "user", content: 'Say "This is a test."' }],
                model: "gpt-3.5-turbo",
            });
        },
    });

    const chatMsg = chatCompletionQuery.data?.choices?.[0].message.content ?? "";
    const isValidApiKey = chatMsg.toLowerCase().includes("this is a test");

    let titleIcon = null;
    let titleIntent: Intent = Intent.NONE;
    let helperText = "";
    if (chatCompletionQuery.isLoading) {
        titleIcon = <Spinner size={SpinnerSize.SMALL} />;
    } else if (chatCompletionQuery.isSuccess) {
        if (isValidApiKey) {
            titleIntent = Intent.SUCCESS;
            helperText = chatMsg;
            titleIcon = (
                <Tooltip content={chatMsg}>
                    <Icon intent={Intent.SUCCESS} icon="tick-circle" />
                </Tooltip>
            );
        } else {
            titleIntent = Intent.DANGER;
            helperText = chatMsg;
            titleIcon = (
                <Tooltip content={chatMsg} isOpen>
                    <Icon intent={Intent.DANGER} icon="cross-circle" />
                </Tooltip>
            );
        }
    } else if (chatCompletionQuery.isError) {
        titleIntent = Intent.DANGER;
        helperText = chatCompletionQuery.error?.message ?? chatCompletionQuery.error?.toString() ?? "";
        titleIcon = (
            <Tooltip content={helperText} isOpen>
                <Icon intent={Intent.DANGER} icon="cross-circle" />
            </Tooltip>
        );
    }

    return (
        <FormGroup helperText={helperText}>
            <Label>
                <div className="flex items-center gap-2">
                    <span>OpenAI API Key</span>
                    {titleIcon}
                </div>
            </Label>
            <InputGroup
                intent={titleIntent}
                placeholder="sk-..."
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
            />
        </FormGroup>
    );
}
