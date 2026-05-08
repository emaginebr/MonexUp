import { useContext } from "react";
import AuthContext from "../Contexts/Auth/AuthContext";

export function useIsAdmin(): boolean {
    const auth = useContext(AuthContext);
    return auth?.sessionInfo?.isAdmin === true;
}
