import React from 'react';
import IProductLinkProvider from '../../DTO/Contexts/IProductLinkProvider';

const ProductLinkContext = React.createContext<IProductLinkProvider>(null);

export default ProductLinkContext;
