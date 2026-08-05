import { BookOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, InputNumber, Tabs, Typography, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores';
import './LoginPage.css';

interface LoginForm { username: string; password: string; }
interface RegisterForm {
  username: string;
  realName: string;
  email: string;
  phone?: string;
  teamId?: number;
  password: string;
  confirmPassword: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [registerForm] = Form.useForm<RegisterForm>();

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

  const handleRegister = async (values: RegisterForm) => {
    setLoading(true);
    try {
      const response = await authService.register(values);
      message.success(response.message || '注册成功，请前往邮箱完成激活');
      registerForm.resetFields();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '注册失败，请稍后重试');
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
        <Tabs items={[
          {
            key: 'login', label: '登录', children: <>
              <Alert className="login-hint" message="初始管理员：admin / 123456" type="info" showIcon />
              <Form<LoginForm> layout="vertical" onFinish={handleLogin} requiredMark={false} autoComplete="on">
                <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}><Input prefix={<UserOutlined />} placeholder="用户名或邮箱" autoFocus /></Form.Item>
                <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}><Input.Password prefix={<LockOutlined />} placeholder="输入密码" /></Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>登录</Button>
                <Button type="link" block onClick={() => navigate('/forgot-password')}>忘记密码</Button>
              </Form>
            </>,
          },
          {
            key: 'register', label: '注册', children: <Form<RegisterForm> form={registerForm} layout="vertical" onFinish={handleRegister} requiredMark={false} autoComplete="on">
              <Form.Item label="账号" name="username" rules={[{ required: true }, { min: 4, max: 20 }]}><Input prefix={<UserOutlined />} /></Form.Item>
              <Form.Item label="姓名" name="realName" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email' }]}><Input prefix={<MailOutlined />} /></Form.Item>
              <Form.Item label="手机号" name="phone"><Input /></Form.Item>
              <Form.Item label="团队 ID" name="teamId"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
              <Form.Item label="密码" name="password" rules={[{ required: true }, { min: 8 }]}><Input.Password prefix={<LockOutlined />} /></Form.Item>
              <Form.Item label="确认密码" name="confirmPassword" dependencies={['password']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('两次输入的密码不一致')); } })]}><Input.Password /></Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>创建账号</Button>
            </Form>,
          },
        ]} />
      </Card>
    </main>
  );
}
