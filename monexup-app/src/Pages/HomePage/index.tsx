import { useContext, useEffect, useState } from "react";
import Hero from "./Hero";
import Footer from "./Footer";
import Features from "./Features";
import Pricing from "./Pricing";
import NetworkPart from "./NetworkPart";
import UserPart from "./UserPart";
import UserContext from "../../Contexts/User/UserContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import AuthContext from "../../Contexts/Auth/AuthContext";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";

/**
 * HomePage — composes the redesigned marketing surface.
 *
 * Section order (per `docs/design/home-redesign.html`):
 *   Header (sticky navbar, dark)
 *   Hero (dark, mesh gradient, headline + dashboard mock)
 *   angular divider (dark → light)
 *   Features (light)
 *   NetworkPart (light)  ← consumes NetworkContext
 *   Pricing (light)
 *   UserPart (light)     ← consumes UserContext
 *   angular divider (light → dark)
 *   Footer (dark)
 */
export default function HomePage() {
  const userContext = useContext(UserContext);
  const networkContext = useContext(NetworkContext);
  const authContext = useContext(AuthContext);

  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");

  const throwError = (message: string) => {
    setMessageText(message);
    setShowMessage(true);
  };

  useEffect(() => {
    // Home is public — `userContext.list` calls NAuth's authenticated
    // searchUsers endpoint. Guard so anonymous visitors don't see a 401
    // toast on landing; the "top partners" widget just renders empty.
    if (authContext.sessionInfo) {
      userContext.list(3).then((ret) => {
        if (!ret.sucesso) {
          throwError(ret.mensagemErro);
        }
      });
    }
    networkContext.listAll().then((ret) => {
      if (!ret.sucesso) {
        throwError(ret.mensagemErro);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <MessageToast
        dialog={MessageToastEnum.Error}
        showMessage={showMessage}
        messageText={messageText}
        onClose={() => setShowMessage(false)}
      />
      <Hero />
      <div className="angular-divider" aria-hidden="true" />
      <Features />
      <NetworkPart
        loading={networkContext.loading}
        networks={networkContext.networks}
      />
      <Pricing />
      <UserPart
        loading={userContext.loadingList}
        users={userContext.users}
      />
      <div className="angular-divider angular-divider--up" aria-hidden="true" />
      <Footer />
    </>
  );
}
