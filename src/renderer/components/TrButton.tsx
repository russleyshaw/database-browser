export interface TrButtonProps extends React.HTMLAttributes<HTMLTableRowElement> {
    onClick?: () => void;
    children?: React.ReactNode;
}

export default function TrButton({ children, ...props }: TrButtonProps) {
    return (
        <tr
            onClick={props.onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    props.onClick?.();
                }
            }}
            tabIndex={0}
            role="button"
            {...props}
        >
            {children}
        </tr>
    );
}
