import React, { useContext, useState } from 'react';
import ProviderResult from '../../DTO/Contexts/ProviderResult';
import IAuthProvider from '../../DTO/Contexts/IAuthProvider';
import AuthContext from './AuthContext';
import AuthFactory from '../../Business/Factory/AuthFactory';
import AuthSession from '../../DTO/Domain/AuthSession';
import UserFactory from '../../Business/Factory/UserFactory';
import UserInfo from '../../DTO/Domain/UserInfo';

export default function AuthProvider(props: any) {

  const [loading, setLoading] = useState(false);
  const [sessionInfo, _setSessionInfo] = useState<AuthSession>(null);

  const authProviderValue: IAuthProvider = {
    loading: loading,
    sessionInfo: sessionInfo,

    setSession: (session: AuthSession) => {
      console.log(JSON.stringify(session));
      _setSessionInfo(session);
      AuthFactory.AuthBusiness.setSession(session);
    },
    loginWithEmail: async (email: string, password: string) => {
      let ret: Promise<ProviderResult>;
      setLoading(true);
      try {
        let retLog = await UserFactory.UserBusiness.loginWithEmail(email, password);
        if (retLog.sucesso) {
          let retTok = await UserFactory.UserBusiness.getTokenAuthorized(email, password);
          if (retTok.sucesso) {
            authProviderValue.setSession({
              ...sessionInfo,
              userId: retLog.dataResult.userId,
              hash: retLog.dataResult.hash,
              token: retTok.dataResult,
              isAdmin: retLog.dataResult.isAdmin,
              name: retLog.dataResult.name,
              email: retLog.dataResult.email,
            });
            setLoading(false);
            return {
              ...ret,
              sucesso: true,
              mensagemSucesso: "User Logged"
            };
          }
          else {
            setLoading(false);
            return {
              ...ret,
              sucesso: false,
              mensagemErro: retTok.mensagem
            };
          }
        }
        else {
          setLoading(false);
          return {
            ...ret,
            sucesso: false,
            mensagemErro: retLog.mensagem
          };
        }
      }
      catch (err) {
        setLoading(false);
        return {
          ...ret,
          sucesso: false,
          mensagemErro: JSON.stringify(err)
        };
      }
    },
    logout: function (): ProviderResult {
      try {
        AuthFactory.AuthBusiness.cleanSession();
        _setSessionInfo(null);
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
      
        let session = await AuthFactory.AuthBusiness.getSession();
        if (session) {
          authProviderValue.setSession(session);
        }
    }
  };

  return (
    <AuthContext.Provider value={authProviderValue}>
      {props.children}
    </AuthContext.Provider>
  );
}
