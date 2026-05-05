import React, { useContext } from 'react';
import { ProxyPayProvider } from 'proxypay-react';
import NetworkContext from '../Contexts/Network/NetworkContext';

const tenantId = process.env.REACT_APP_PROXYPAY_TENANT_ID || process.env.REACT_APP_TENANT_ID || 'monexup';
const baseUrl = process.env.REACT_APP_PROXYPAY_API_URL || '';

interface Props {
  children: React.ReactNode;
}

export default function NetworkAwareProxyPayProvider({ children }: Props) {
  const networkCtx = useContext(NetworkContext);
  const clientId = networkCtx?.userNetwork?.network?.proxypayClientId || '';

  if (!clientId) {
    return <>{children}</>;
  }

  const config = { baseUrl, clientId, tenantId };
  return <ProxyPayProvider config={config}>{children}</ProxyPayProvider>;
}
