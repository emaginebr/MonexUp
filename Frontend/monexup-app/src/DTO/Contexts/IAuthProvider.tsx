import AuthSession from "../Domain/AuthSession";
import ProviderResult from "./ProviderResult";


interface IAuthProvider {
    loading: boolean;
    sessionInfo: AuthSession;
    //bindMetaMaskWallet: (name: string, email: string, fromReferralCode: string) => Promise<ProviderResult>;
    //checkUserRegister: () => Promise<ProviderResult>;
    setSession: (session: AuthSession) => void;
    loginWithEmail: (email: string, password: string) => Promise<ProviderResult>;
    logout: () => ProviderResult;
    loadUserSession: () => void;
    //updateUser: (name: string, email: string) => Promise<ProviderResult>;
}

export default IAuthProvider;