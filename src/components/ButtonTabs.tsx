import { Button, ButtonGroup } from "@blueprintjs/core";

export interface ButtonTabEntry<T> {
    name: string;
    value: T;
}

export interface ButtonTabProps<T> {
    tabs: ButtonTabEntry<T>[];
    selectedTab: T | null;
    onSelectTab: (tab: T) => void;
    onCloseTab?: (tab: T) => void;
    isClosable?: boolean;
}

export function ButtonTabs<T>({ tabs, selectedTab, onSelectTab, onCloseTab, isClosable = true }: ButtonTabProps<T>) {
    return (
        <ButtonGroup>
            {tabs.map((tab) => (
                <Button
                    small
                    active={tab.value === selectedTab || false}
                    key={tab.name}
                    type="button"
                    onClick={() => onSelectTab(tab.value)}
                >
                    <div className="flex flex-row gap-2 items-center">
                        <span>{tab.name}</span>

                        {isClosable && <Button minimal small icon="cross" onClick={() => onCloseTab?.(tab.value)} />}
                    </div>
                </Button>
            ))}
        </ButtonGroup>
    );
}
