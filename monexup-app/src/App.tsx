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
import HomeHeader from './Pages/HomePage/Header';
import HomeFooter from './Pages/HomePage/Footer';
import MiniFooter from './Components/MiniFooter';
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
      <HomeHeader />
      <Outlet />
    </div>
  );
}

function LayoutAdmin() {
  return (
    <div>
      <HomeHeader />
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

/**
 * LayoutMarketing — public marketing shell that reuses the redesigned
 * dark Header + Footer from the Home route. Used by /new-seller (and
 * its slug-scoped variants) so the seller signup page matches the new
 * editorial-brutalist visual language instead of the legacy Bootstrap
 * <Menu /> chrome.
 */
function LayoutMarketing() {
  return (
    <div>
      <HomeHeader />
      <Outlet />
      <HomeFooter />
    </div>
  );
}

/**
 * LayoutDashboard — post-login shell for the redesigned dashboard.
 * Reuses the dark Home header (so navigation, user menu and logout stay
 * consistent with the rest of the app) and pairs it with a slim
 * `<MiniFooter />` instead of the marketing 4-column footer. Used only
 * by the `/admin` index and `/admin/dashboard` routes — every other
 * `/admin/*` route still uses `LayoutAdmin` (sidebar + AdminLayout).
 */
function LayoutDashboard() {
  return (
    <div>
      <HomeHeader />
      <Outlet />
      <MiniFooter />
    </div>
  );
}

const tenantId = process.env.REACT_APP_TENANT_ID || 'monexup';

const proxyPayConfig = {
  baseUrl: process.env.REACT_APP_PROXYPAY_API_URL || '',
  clientId: process.env.REACT_APP_PROXYPAY_CLIENT_ID || '',
  tenantId: process.env.REACT_APP_PROXYPAY_TENANT_ID || tenantId,
};

const nauthConfig = {
  apiUrl: process.env.REACT_APP_NAUTH_API_URL || process.env.REACT_APP_API_URL || '',
  enableFingerprinting: true,
  language: 'pt',
  headers: { 'X-Tenant-Id': tenantId },
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
        {/* Marketing-shell routes (Tailwind dark Header/Footer) — keep
            the seller signup pages OUT of the legacy <Menu /> chrome so they
            inherit the redesigned home aesthetic. */}
        <Route element={<LayoutMarketing />}>
          <Route path="new-seller" element={<SellerAddPage />} />
          <Route path=":networkSlug/new-seller" element={<SellerAddPage />} />
          <Route path=":networkSlug/@/:sellerSlug/new-seller" element={<SellerAddPage />} />
          <Route path=":networkSlug/request-access" element={<RequestAccessPage />} />
          <Route path=":networkSlug/@/:sellerSlug/request-access" element={<RequestAccessPage />} />
        </Route>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="network">
            <Route index element={<NetworkInsertPage />} />
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
        <Route element={<LayoutAdmin />}>
          <Route path="network/search" element={<NetworkListPage />} />
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
