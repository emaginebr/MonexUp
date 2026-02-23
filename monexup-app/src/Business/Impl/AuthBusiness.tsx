import AuthSession from "../../DTO/Domain/AuthSession";
import IAuthBusiness from "../Interfaces/IAuthBusiness";

const NAUTH_TOKEN_KEY = 'nauth_token';
const LS_KEY = 'login-with-metamask:auth';

const AuthBusiness : IAuthBusiness = {
  getSession: () => {
    const token = window.localStorage.getItem(NAUTH_TOKEN_KEY);
    if (token) {
      const ls = window.localStorage.getItem(LS_KEY);
      const savedSession = ls && JSON.parse(ls);
      return {
        ...savedSession,
        token: token
      };
    }
    const ls = window.localStorage.getItem(LS_KEY);
    return ls && JSON.parse(ls);
  },
  setSession: (session: AuthSession) => {
    localStorage.setItem(LS_KEY, JSON.stringify(session));
    if (session?.token) {
      localStorage.setItem(NAUTH_TOKEN_KEY, session.token);
    }
  },
  cleanSession: () => {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(NAUTH_TOKEN_KEY);
  }
}

export default AuthBusiness;
