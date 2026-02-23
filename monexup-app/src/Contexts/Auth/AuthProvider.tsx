import React, { useState } from 'react';
import { useAuth } from 'nauth-react';
import ProviderResult from '../../DTO/Contexts/ProviderResult';
import IAuthProvider from '../../DTO/Contexts/IAuthProvider';
import AuthContext from './AuthContext';
import AuthSession from '../../DTO/Domain/AuthSession';
import { LanguageEnum } from '../../DTO/Enum/LanguageEnum';

export default function AuthProvider(props: any) {

  const { user, token, isLoading, login, logout: nauthLogout } = useAuth();
  const [language, setLanguage] = useState<LanguageEnum>(LanguageEnum.English);
  const [localSession, setLocalSession] = useState<AuthSession>(null);

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
        nauthLogout();
        setLocalSession(null);
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
