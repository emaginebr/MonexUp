import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from 'nauth-react';
import ProviderResult from '../../DTO/Contexts/ProviderResult';
import IAuthProvider from '../../DTO/Contexts/IAuthProvider';
import AuthContext from './AuthContext';
import NetworkContext from '../Network/NetworkContext';
import AuthSession from '../../DTO/Domain/AuthSession';
import { LanguageEnum } from '../../DTO/Enum/LanguageEnum';
import AuthFactory from '../../Business/Factory/AuthFactory';

export default function AuthProvider(props: any) {

  const { user, token, isLoading, login, logout: nauthLogout } = useAuth();
  const networkCtx = useContext(NetworkContext);
  const [language, setLanguage] = useState<LanguageEnum>(LanguageEnum.English);
  const [localSession, setLocalSession] = useState<AuthSession>(null);

  // Business layer reads session directly from localStorage via AuthBusiness.
  // nauth-react persists its own token under `nauth_token` but never writes
  // the `login-with-metamask:auth` legacy blob AuthBusiness expects for
  // userId/email/hash. Mirror the session over whenever nauth updates it.
  useEffect(() => {
    // Only sync when we actually have a fresh session — do NOT wipe on the
    // first (loading) tick or we race the app into 401s while nauth is still
    // rehydrating from storage.
    if (isLoading) return;
    if (user && token) {
      AuthFactory.AuthBusiness.setSession({
        userId: user.userId,
        email: user.email,
        name: user.name,
        hash: user.hash,
        token,
        isAdmin: user.isAdmin,
        language,
      } as AuthSession);
    }
  }, [user, token, language, isLoading]);

  const buildSession = (): AuthSession => {
    if (user && token) {
      return {
        userId: user.userId,
        email: user.email,
        name: user.name,
        hash: user.hash,
        token: token,
        isAdmin: user.isAdmin,
        language: language
      };
    }
    return localSession;
  };

  const authProviderValue: IAuthProvider = {
    loading: isLoading,
    language: language,
    sessionInfo: buildSession(),

    setSession: (session: AuthSession) => {
      setLocalSession(session);
    },
    setLanguage: (value: LanguageEnum) => {
      setLanguage(value);
    },
    loginWithEmail: async (email: string, password: string) => {
      let ret: Promise<ProviderResult>;
      try {
        const loggedUser = await login({ email, password });
        if (loggedUser) {
          return {
            ...ret,
            sucesso: true,
            mensagemSucesso: "User Logged"
          };
        }
        return {
          ...ret,
          sucesso: false,
          mensagemErro: "Login failed"
        };
      }
      catch (err: any) {
        return {
          ...ret,
          sucesso: false,
          mensagemErro: err?.message || JSON.stringify(err)
        };
      }
    },
    logout: function (): ProviderResult {
      try {
        networkCtx?.clear?.();
        nauthLogout();
        setLocalSession(null);
        AuthFactory.AuthBusiness.cleanSession();
        return {
          sucesso: true,
          mensagemErro: "",
          mensagemSucesso: ""
        };
      } catch (err) {
        return {
          sucesso: false,
          mensagemErro: "Falha ao tenta executar o logout",
          mensagemSucesso: ""
        };
      }
    },
    loadUserSession: async () => {
      let ret: Promise<ProviderResult>;
      const session = buildSession();
      if (session) {
        return {
          ...ret,
          sucesso: true
        };
      }
      return {
        ...ret,
        sucesso: false,
        mensagemErro: "Session not load"
      };
    }
  };

  return (
    <AuthContext.Provider value={authProviderValue}>
      {props.children}
    </AuthContext.Provider>
  );
}
