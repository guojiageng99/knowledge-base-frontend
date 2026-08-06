import { BookOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import './LoginPage.css';

interface LoginForm { username: string; password: string; }
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
      message.error(error instanceof Error ? error.message : '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-intro" aria-label="企业知识库">
        <div className="login-brand">
          <BookOutlined />
          <span>企业知识库</span>
        </div>
        <div className="login-index" aria-hidden="true">
          <span>01 / 文档</span>
          <span>02 / 分类</span>
          <span>03 / 协作</span>
          <span>04 / 沉淀</span>
        </div>
        <div className="login-intro-copy">
          <p className="eyebrow">TEAM REFERENCE</p>
          <h1>把经验留在<br />找得到的地方。</h1>
          <p>项目资料、制度与工作笔记，统一归档，随时查阅。</p>
        </div>
        <p className="login-footnote">内部协作空间</p>
      </section>
      <Card className="login-card" bordered={false}>
        <Typography.Title level={3}>进入知识库</Typography.Title>
        <Typography.Paragraph type="secondary">使用你的账号继续。</Typography.Paragraph>
        <>
              <Form<LoginForm> layout="vertical" onFinish={handleLogin} requiredMark={false} autoComplete="on">
                <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}><Input prefix={<UserOutlined />} placeholder="用户名或邮箱" autoFocus /></Form.Item>
                <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}><Input.Password prefix={<LockOutlined />} placeholder="输入密码" /></Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>登录</Button>
                <Button type="link" block onClick={() => navigate('/forgot-password')}>忘记密码</Button>
              </Form>
        </>
      </Card>
    </main>
  );
}
