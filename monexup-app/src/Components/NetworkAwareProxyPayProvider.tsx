import React, { useContext } from 'react';
import { ProxyPayProvider } from 'proxypay-react';
import NetworkContext from '../Contexts/Network/NetworkContext';

// ProxyPay tenant is fixed to "monexup" — the invoices live under the
// MonexUp tenant regardless of which network/env config is loaded. Hardcoding
// avoids the "wrong tenant" 400s when env vars drift.
const tenantId = 'monexup';
const baseUrl = process.env.REACT_APP_PROXYPAY_API_URL || '';

interface Props {
  children: React.ReactNode;
}

export default function NetworkAwareProxyPayProvider({ children }: Props) {
  const networkCtx = useContext(NetworkContext);
  // Admin-authenticated flows populate `userNetwork` (chain + role); public
  // vendor / storefront routes only populate `network` via getBySlug. Fall
  // back so PixPayment gets a ClientId on both paths.
  const clientId =
    networkCtx?.userNetwork?.network?.proxypayClientId ||
    networkCtx?.network?.proxypayClientId ||
    '';

  if (!clientId) {
    return <>{children}</>;
  }

  const config = { baseUrl, clientId, tenantId };
  return <ProxyPayProvider config={config}>{children}</ProxyPayProvider>;
}
