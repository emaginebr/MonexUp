import React from 'react';
import IInviteProvider from '../../DTO/Contexts/IInviteProvider';

const InviteContext = React.createContext<IInviteProvider>(null);

export default InviteContext;
