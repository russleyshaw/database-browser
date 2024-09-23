import { Button, type IconName, type Intent, Tooltip } from "@blueprintjs/core";
import { useState } from "react";

interface ConfirmIconButtonProps {
    icon: IconName;
    intent?: Intent;
    confirmIcon: IconName;
    confirmIntent?: Intent;
    confirmText?: string;
    onConfirm: () => void;
}

export default function ConfirmIconButton({
    icon,
    intent,
    confirmIcon,
    confirmIntent,
    confirmText,
    onConfirm,
}: ConfirmIconButtonProps) {
    const [confirm, setConfirm] = useState(false);

    function onClick() {
        if (confirm) {
            setConfirm(false);
            onConfirm();
            return;
        }

        setConfirm(true);
    }

    return (
        <Tooltip isOpen={confirm && !!confirmText} content={confirmText}>
            <Button
                icon={confirm ? confirmIcon : icon}
                intent={confirm ? confirmIntent : intent}
                onBlur={() => setConfirm(false)}
                onClick={onClick}
            />
        </Tooltip>
    );
}
