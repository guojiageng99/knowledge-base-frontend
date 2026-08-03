import { AppstoreOutlined, ClockCircleOutlined, FileTextOutlined, InboxOutlined, LogoutOutlined, StarOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Layout, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Layout className="dashboard-layout">
      <header className="dashboard-header">
        <Typography.Title level={4}>知识库</Typography.Title>
        <Space>
          <span><UserOutlined /> {user?.nickname || user?.realName || user?.username}</span>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>退出</Button>
        </Space>
      </header>
      <main className="dashboard-main">
        <Typography.Title level={2}>欢迎回来</Typography.Title>
        <Typography.Paragraph type="secondary">认证状态已建立，可以开始访问受保护的知识库功能。</Typography.Paragraph>
        <Card title="当前用户" style={{ maxWidth: 720 }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
            <Descriptions.Item label="姓名">{user?.realName || user?.nickname || '-'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{user?.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="部门">{user?.department || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="Documents" style={{ maxWidth: 720, marginTop: 16 }}>
          <Button type="primary" icon={<FileTextOutlined />} onClick={() => navigate('/documents')}>
            Manage documents
          </Button>
        </Card>
        <Space wrap style={{ marginTop: 16 }}>
          <Button icon={<AppstoreOutlined />} onClick={() => navigate('/categories')}>Manage categories</Button>
          <Button icon={<UserOutlined />} onClick={() => navigate('/users')}>Manage users</Button>
          <Button icon={<InboxOutlined />} onClick={() => navigate('/drafts')}>Drafts</Button>
          <Button icon={<StarOutlined />} onClick={() => navigate('/favorites')}>My favorites</Button>
          <Button icon={<ClockCircleOutlined />} onClick={() => navigate('/recent-access')}>Recent access</Button>
        </Space>
      </main>
    </Layout>
  );
}
