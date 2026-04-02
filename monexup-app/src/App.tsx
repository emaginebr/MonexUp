import { Routes, Route, Outlet } from "react-router-dom";
import { NAuthProvider } from 'nauth-react';
import 'nauth-react/styles';
import './styles/nauth-overrides.scss';
import Menu from "./Components/Menu";
import AdminLayout from "./Components/AdminLayout";
import ContextBuilder from './Contexts/Utils/ContextBuilder';
import AuthProvider from './Contexts/Auth/AuthProvider';
import EditAccountPage from './Pages/EditAccountPage';
import NewAccountPage from './Pages/NewAccountPage';
import ResetPasswordPage from './Pages/ResetPasswordPage';
import PasswordPage from './Pages/PasswordPage';
import LoginPage from './Pages/LoginPage';
import RecoveryPage from './Pages/RecoveryPage';
import UserProvider from './Contexts/User/UserProvider';
import HomePage from './Pages/HomePage';
import NetworkPage from './Pages/NetworkPage';
import DashboardPage from './Pages/DashboardPage';
import NetworkEditPage from './Pages/NetworkEditPage';
import NetworkListPage from './Pages/NetworkListPage';
import ProductPage from './Pages/ProductPage';
import NetworkInsertPage from './Pages/NetworkInsertPage';
import NetworkProvider from './Contexts/Network/NetworkProvider';
import ProfileProvider from './Contexts/Profile/ProfileProvider';
import ProfileListPage from './Pages/ProfileListPage';
import ProfileEditPage from './Pages/ProfileEditPage';
import UserSearchPage from './Pages/UserSearchPage';
import ProductProvider from './Contexts/Product/ProductProvider';
import MenuNetwork from './Components/MenuNetwork';
import RequestAccessPage from './Pages/RequestAccessPage';
import OrderProvider from './Contexts/Order/OrderProvider';
import Error404Page from './Pages/Error404Page';
import OrderSearchPage from './Pages/OrderSearchPage';
import SellerAddPage from './Pages/SellerAddPage';
import SellerPage from './Pages/SellerPage';
import InvoiceProvider from './Contexts/Invoice/InvoiceProvider';
import InvoiceSearchPage from './Pages/InvoiceSearchPage';
import NetworkFooter from './Pages/NetworkPage/NetworkFooter';
import MenuUser from './Components/MenuUser';
import ImageProvider from './Contexts/Image/ImageProvider';
import { TemplateProvider } from './packages/template';
import { ProxyPayProvider } from 'proxypay-react';
import CheckoutSuccessPage from './Pages/CheckoutSuccessPage';

function Layout() {
  return (
    <div>
      <Menu />
      <Outlet />
    </div>
  );
}

function LayoutAdmin() {
  return (
    <div>
      <Menu />
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </div>
  );
}

function LayoutNetwork() {
  return (
    <div>
      <MenuNetwork />
      <Outlet />
      <NetworkFooter />
    </div>
  );
}

function LayoutUser() {
  return (
    <div>
      <MenuUser />
      <Outlet />
      <NetworkFooter />
    </div>
  );
}

const proxyPayConfig = {
  baseUrl: process.env.REACT_APP_PROXYPAY_API_URL || '',
  clientId: process.env.REACT_APP_PROXYPAY_CLIENT_ID || '',
  tenantId: process.env.REACT_APP_PROXYPAY_TENANT_ID || 'monexup'
};

const nauthConfig = {
  apiUrl: process.env.REACT_APP_NAUTH_API_URL || process.env.REACT_APP_API_URL || '',
  enableFingerprinting: true,
  language: 'pt',
  redirectOnUnauthorized: '/account/login',
};

function App() {
  const ContextContainer = ContextBuilder([
    AuthProvider, UserProvider, NetworkProvider, ProfileProvider, ProductProvider,
    OrderProvider, InvoiceProvider, ImageProvider, TemplateProvider
  ]);

  return (
    <ProxyPayProvider config={proxyPayConfig}>
    <NAuthProvider config={nauthConfig}>
    <ContextContainer>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="new-seller" element={<SellerAddPage />} />
          <Route path="network">
            <Route index element={<NetworkInsertPage />} />
            <Route path="search" element={<NetworkListPage />} />
          </Route>
          <Route path="account">
            <Route index element={<LoginPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="edit-account" element={<EditAccountPage />} />
            <Route path="new-account" element={<NewAccountPage />} />
            <Route path="recovery-password" element={<RecoveryPage />} />
            <Route path="change-password" element={<PasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>
        <Route path="admin" element={<LayoutAdmin />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="network" element={<NetworkEditPage />} />
          <Route path="teams">
            <Route index element={<UserSearchPage />} />
            <Route path=":pageNum" element={<UserSearchPage />} />
          </Route>
          <Route path="orders" element={<OrderSearchPage />} />
          <Route path="invoices" element={<InvoiceSearchPage />} />
          <Route path="team-structure">
            <Route index element={<ProfileListPage />} />
            <Route path="new" element={<ProfileEditPage />} />
            <Route path=":profileId" element={<ProfileEditPage />} />
          </Route>
          <Route path="edit-account" element={<EditAccountPage />} />
        </Route>
        <Route path="@" element={<LayoutUser />}>
          <Route path=":sellerSlug">
            <Route index element={<SellerPage />} />
            <Route path="account">
              <Route index element={<LoginPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="edit-account" element={<EditAccountPage />} />
              <Route path="new-account" element={<NewAccountPage />} />
              <Route path="recovery-password" element={<RecoveryPage />} />
              <Route path="change-password" element={<PasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>
            <Route path=":productSlug" element={<ProductPage />} />
          </Route>
          <Route index element={<Error404Page />} />
        </Route>
        <Route path=":networkSlug" element={<LayoutNetwork />}>
          <Route index element={<NetworkPage />} />
          <Route path="new-seller" element={<SellerAddPage />} />
          <Route path="request-access" element={<RequestAccessPage />} />
          <Route path="account">
            <Route index element={<LoginPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="edit-account" element={<EditAccountPage />} />
            <Route path="new-account" element={<NewAccountPage />} />
            <Route path="recovery-password" element={<RecoveryPage />} />
            <Route path="change-password" element={<PasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
          <Route path=":productSlug" element={<ProductPage />} />
          <Route path="@">
            <Route path=":sellerSlug">
              <Route index element={<SellerPage />} />
              <Route path="new-seller" element={<SellerAddPage />} />
              <Route path="request-access" element={<RequestAccessPage />} />
              <Route path=":productSlug" element={<ProductPage />} />
            </Route>
            <Route index element={<Error404Page />} />
          </Route>
        </Route>
        <Route path="*" element={<Error404Page />} />
      </Routes>
    </ContextContainer>
    </NAuthProvider>
    </ProxyPayProvider>
  );
}

export default App;
