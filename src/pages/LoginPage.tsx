import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import './LoginPage.css';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登录成功');
      navigate('/', { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-intro" aria-label="Knowledge Base">
        <p className="eyebrow">KNOWLEDGE BASE</p>
        <h1>知识库</h1>
        <p>集中整理、沉淀和检索团队知识。</p>
      </section>
      <Card className="login-card" bordered={false}>
        <Typography.Title level={3}>登录</Typography.Title>
        <Typography.Paragraph type="secondary">使用你的账号访问知识库</Typography.Paragraph>
        <Alert className="login-hint" message="演示账号：admin / 123456" type="info" showIcon />
        <Form<LoginForm> layout="vertical" onFinish={handleLogin} requiredMark={false} autoComplete="on">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" autoFocus />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form>
      </Card>
    </main>
  );
}
