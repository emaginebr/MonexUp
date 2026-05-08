import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useIsAdmin } from "../../../Hooks/useIsAdmin";

export default function RequireAdmin({ children }: PropsWithChildren) {
    const isAdmin = useIsAdmin();
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
}
