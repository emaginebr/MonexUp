import './App.css';
import { Routes, Route, Outlet, Link } from "react-router-dom";
import Menu from "./Components/Menu";
import ContextBuilder from './Contexts/Utils/ContextBuilder';
import AuthProvider from './Contexts/Auth/AuthProvider';
import UserPage from './Pages/UserPage';
import PasswordPage from './Pages/PasswordPage';
import LoginPage from './Pages/LoginPage';
import RecoveryPage from './Pages/RecoveryPage';
import UserProvider from './Contexts/User/UserProvider';
import HomePage from './Pages/HomePage';
import SellerPage from './Pages/SellerPage';
import NetworkPage from './Pages/NetworkPage';
import DashboardPage from './Pages/DashboardPage';
import NetworkEditPage from './Pages/NetworkEditPage';
import NetworkListPage from './Pages/NetworkListPage';
import TeamStructurePage from './Pages/TeamStructurePage';
import TeamStructureEditPage from './Pages/TeamStructureEditPage';
import TeamPage from './Pages/TeamPage';
import OrderListPage from './Pages/OrderListPage';
import InvoiceListPage from './Pages/InvoiceListPage';
import ProductListPage from './Pages/ProductListPage';
import ProductEditPage from './Pages/ProductEditPage';
import ProductPage from './Pages/ProductPage';
import NetworkInsertPage from './Pages/NetworkInsertPage';
import NetworkProvider from './Contexts/Network/NetworkProvider';

function Error404() {
  return (
    <div>
      <h2>Error 404</h2>
    </div>
  );
}

function Layout() {
  return (
    <div>
      <Menu />
      <Outlet />
    </div>
  );
}

function App() {
  const ContextContainer = ContextBuilder([AuthProvider, UserProvider, NetworkProvider]);

  return (
    <ContextContainer>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="new-seller" element={<SellerPage />} />
          <Route path="network">
            <Route index element={<NetworkInsertPage />} />
            <Route path="search" element={<NetworkListPage />} />
          </Route>
          <Route path="network" element={<NetworkEditPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="edit-account" element={<UserPage />} />
          <Route path="new-account" element={<UserPage />} />
          <Route path="recovery-password" element={<RecoveryPage />} />
          <Route path="change-password" element={<PasswordPage />} />
          <Route path="minha-rede">
            <Route index element={<NetworkPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="network" element={<NetworkEditPage />} />
            <Route path="teams" element={<TeamPage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="invoices" element={<InvoiceListPage />} />
            <Route path="products">
              <Route index element={<ProductListPage />} />
              <Route path="new" element={<ProductEditPage />} />
              <Route path=":id" element={<ProductEditPage />} />
            </Route>
            <Route path="p">
              <Route path=":id" element={<ProductPage />} />
            </Route>
            <Route path="team-structure">
              <Route index element={<TeamStructurePage />} />
              <Route path="new" element={<TeamStructureEditPage />} />
              <Route path=":id" element={<TeamStructureEditPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </ContextContainer>
  );
}

export default App;
