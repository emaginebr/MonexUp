import React from 'react';
import IBillingProvider from '../../DTO/Contexts/IBillingProvider';

const BillingContext = React.createContext<IBillingProvider>(null);

export default BillingContext;
