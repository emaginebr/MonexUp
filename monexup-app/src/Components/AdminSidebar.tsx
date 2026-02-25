import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faCog, faUserCog, faUserGroup, faList, faDollar, faBox } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import NetworkContext from '../Contexts/Network/NetworkContext';
import { UserRoleEnum } from '../DTO/Enum/UserRoleEnum';

interface AdminSidebarProps {
  show: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ show, onClose }: AdminSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const networkContext = useContext(NetworkContext);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <div className={`mnx-sidebar-overlay ${show ? 'show' : ''}`} onClick={onClose} />
      <nav className={`mnx-sidebar ${show ? 'show' : ''}`}>
        <div className="mnx-sidebar-header">
          <h6>{networkContext.userNetwork?.network?.name || 'MonexUp'}</h6>
          <small>{t('dashboard_title') || 'Dashboard'}</small>
        </div>

        <div className="mnx-sidebar-section-title">{t('menu') || 'Menu'}</div>
        <div
          className={`mnx-sidebar-link ${isActive('/admin/dashboard') || location.pathname === '/admin' ? 'active' : ''}`}
          onClick={() => handleNav('/admin/dashboard')}
        >
          <FontAwesomeIcon icon={faChartLine} fixedWidth />
          <span>Dashboard</span>
        </div>

        {networkContext.currentRole >= UserRoleEnum.NetworkManager && (
          <>
            <div className="mnx-sidebar-section-title">{t('dashboard_networks_title') || 'Network'}</div>
            <div
              className={`mnx-sidebar-link ${isActive('/admin/network') ? 'active' : ''}`}
              onClick={() => handleNav('/admin/network')}
            >
              <FontAwesomeIcon icon={faCog} fixedWidth />
              <span>{t('preferences')}</span>
            </div>
            <div
              className={`mnx-sidebar-link ${isActive('/admin/team-structure') ? 'active' : ''}`}
              onClick={() => handleNav('/admin/team-structure')}
            >
              <FontAwesomeIcon icon={faUserCog} fixedWidth />
              <span>{t('team_structure')}</span>
            </div>
            <div
              className={`mnx-sidebar-link ${isActive('/admin/teams') ? 'active' : ''}`}
              onClick={() => handleNav('/admin/teams')}
            >
              <FontAwesomeIcon icon={faUserGroup} fixedWidth />
              <span>{t('teams')}</span>
            </div>
          </>
        )}

        {networkContext.currentRole >= UserRoleEnum.Seller && (
          <>
            <div className="mnx-sidebar-section-title">{t('finances')}</div>
            <div
              className={`mnx-sidebar-link ${isActive('/admin/orders') ? 'active' : ''}`}
              onClick={() => handleNav('/admin/orders')}
            >
              <FontAwesomeIcon icon={faList} fixedWidth />
              <span>{t('orders')}</span>
            </div>
            <div
              className={`mnx-sidebar-link ${isActive('/admin/invoices') ? 'active' : ''}`}
              onClick={() => handleNav('/admin/invoices')}
            >
              <FontAwesomeIcon icon={faDollar} fixedWidth />
              <span>{t('invoices')}</span>
            </div>
            <div
              className={`mnx-sidebar-link ${isActive('/admin/products') ? 'active' : ''}`}
              onClick={() => handleNav('/admin/products')}
            >
              <FontAwesomeIcon icon={faBox} fixedWidth />
              <span>{t('products')}</span>
            </div>
          </>
        )}
      </nav>
    </>
  );
}
