import { ReactNode } from "react";

interface EmptyStateProps {
    title: string;
    message?: string;
    icon?: ReactNode;
}

export default function EmptyState({ title, message, icon }: EmptyStateProps) {
    return (
        <div className="text-center py-5">
            {icon && <div className="mb-3 fs-1 text-muted">{icon}</div>}
            <h4 className="mb-2">{title}</h4>
            {message && <p className="text-muted mb-0">{message}</p>}
        </div>
    );
}
