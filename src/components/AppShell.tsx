import {
  AppstoreOutlined, BellOutlined, BookOutlined, FileTextOutlined, FolderOpenOutlined,
  HistoryOutlined, LogoutOutlined, RobotOutlined, SearchOutlined, SettingOutlined,
  TeamOutlined, UserOutlined,
} from '@ant-design/icons';
import { Badge, Button, Dropdown, Layout, Menu, Tooltip, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, useNotificationStore } from '@/stores';

interface AppShellProps {
  index: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

const primaryItems = [
  { key: '/', icon: <BookOutlined />, label: '工作台' },
  { key: '/documents', icon: <FileTextOutlined />, label: '文档' },
  { key: '/categories', icon: <AppstoreOutlined />, label: '分类' },
  { key: '/search', icon: <SearchOutlined />, label: '检索' },
];

const secondaryItems = [
  { key: '/files', icon: <FolderOpenOutlined />, label: '文件' },
  { key: '/drafts', icon: <HistoryOutlined />, label: '草稿' },
  { key: '/ai', icon: <RobotOutlined />, label: '智能助手' },
  { key: '/admin/teams', icon: <TeamOutlined />, label: '团队' },
];

function selectedKey(pathname: string) {
  if (pathname === '/') return '/';
  return [...primaryItems, ...secondaryItems].find((item) => item.key !== '/' && pathname.startsWith(item.key))?.key;
}

export default function AppShell({ index, title, description, actions, children, contentClassName = '' }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const activeKey = selectedKey(location.pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const accountMenu = [
    { key: 'profile', icon: <UserOutlined />, label: '个人资料', onClick: () => navigate('/profile') },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, danger: true, label: '退出登录', onClick: () => void handleLogout() },
  ];

  return (
    <Layout className="app-shell">
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <Layout.Sider className="app-sider" width={224} theme="light" trigger={null}>
        <button className="app-brand" onClick={() => navigate('/')} aria-label="返回工作台">
          <span className="app-brand-mark"><BookOutlined /></span>
          <span>企业知识库</span>
        </button>
        <p className="app-nav-label">知识管理</p>
        <Menu mode="inline" selectedKeys={activeKey ? [activeKey] : []} items={primaryItems} onClick={({ key }) => navigate(key)} />
        <p className="app-nav-label app-nav-label-secondary">协作与工具</p>
        <Menu mode="inline" selectedKeys={activeKey ? [activeKey] : []} items={secondaryItems} onClick={({ key }) => navigate(key)} />
        <div className="app-sider-bottom">
          <Button type="text" icon={<SettingOutlined />} onClick={() => navigate('/admin/settings')}>系统设置</Button>
        </div>
      </Layout.Sider>
      <Layout className="app-stage">
        <header className="app-topbar">
          <div className="app-mobile-brand"><BookOutlined /> 企业知识库</div>
          <div className="app-topbar-actions">
            <Tooltip title="全局检索"><Button type="text" aria-label="全局检索" icon={<SearchOutlined />} onClick={() => navigate('/search')} /></Tooltip>
            <Badge count={unreadCount} size="small" overflowCount={99}>
              <Tooltip title="通知"><Button type="text" aria-label="通知" icon={<BellOutlined />} onClick={() => navigate('/notifications')} /></Tooltip>
            </Badge>
            <Dropdown menu={{ items: accountMenu }} trigger={['click']} placement="bottomRight">
              <Button type="text" className="app-user-entry" icon={<UserOutlined />} aria-label="账户菜单">
                {user?.realName || user?.nickname || user?.username || '个人中心'}
              </Button>
            </Dropdown>
          </div>
        </header>
        <nav className="app-mobile-nav" aria-label="主要功能">
          {primaryItems.map((item) => <Button key={item.key} type="text" className={activeKey === item.key ? 'active' : ''} icon={item.icon} onClick={() => navigate(item.key)}>{item.label}</Button>)}
        </nav>
        <main id="main-content" className={`app-content ${contentClassName}`}>
          <section className="page-heading">
            <div>
              <p className="page-index">{index}</p>
              <Typography.Title level={1}>{title}</Typography.Title>
              <Typography.Paragraph>{description}</Typography.Paragraph>
            </div>
            {actions && <div className="page-actions">{actions}</div>}
          </section>
          {children}
        </main>
      </Layout>
    </Layout>
  );
}
