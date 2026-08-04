import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
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
      message.success('Signed in successfully.');
      navigate('/', { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterForm) => {
    setLoading(true);
    try {
      const response = await authService.register(values);
      message.success(response.message || 'Registration complete. Check your email to activate the account.');
      registerForm.resetFields();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-intro" aria-label="Knowledge Base">
        <p className="eyebrow">KNOWLEDGE BASE</p>
        <h1>Knowledge Base</h1>
        <p>Organize, preserve, and find your team's working knowledge.</p>
      </section>
      <Card className="login-card" bordered={false}>
        <Typography.Title level={3}>Access</Typography.Title>
        <Typography.Paragraph type="secondary">Sign in or create an account for the knowledge base.</Typography.Paragraph>
        <Tabs items={[
          {
            key: 'login', label: 'Sign in', children: <>
              <Alert className="login-hint" message="Demo account: admin / 123456" type="info" showIcon />
              <Form<LoginForm> layout="vertical" onFinish={handleLogin} requiredMark={false} autoComplete="on">
                <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Enter your username' }]}><Input prefix={<UserOutlined />} placeholder="Username" autoFocus /></Form.Item>
                <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Enter your password' }]}><Input.Password prefix={<LockOutlined />} placeholder="Password" /></Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>Sign in</Button>
                <Button type="link" block onClick={() => navigate('/forgot-password')}>Forgot password?</Button>
              </Form>
            </>,
          },
          {
            key: 'register', label: 'Register', children: <Form<RegisterForm> form={registerForm} layout="vertical" onFinish={handleRegister} requiredMark={false} autoComplete="on">
              <Form.Item label="Username" name="username" rules={[{ required: true }, { min: 4, max: 20 }]}><Input prefix={<UserOutlined />} /></Form.Item>
              <Form.Item label="Real name" name="realName" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}><Input prefix={<MailOutlined />} /></Form.Item>
              <Form.Item label="Phone" name="phone"><Input /></Form.Item>
              <Form.Item label="Team ID" name="teamId"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
              <Form.Item label="Password" name="password" rules={[{ required: true }, { min: 8 }]}><Input.Password prefix={<LockOutlined />} /></Form.Item>
              <Form.Item label="Confirm password" name="confirmPassword" dependencies={['password']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('Passwords do not match')); } })]}><Input.Password prefix={<LockOutlined />} /></Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>Create account</Button>
            </Form>,
          },
        ]} />
      </Card>
    </main>
  );
}
