import { MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, Result, Spin, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import './PublicAuthPage.css';

export default function ActivateAccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<'ready' | 'loading' | 'success' | 'error'>('ready');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setDetail('This activation link is missing its token.');
      setState('error');
      return;
    }
    if (!token) { setDetail('This invitation link is missing its token.'); setState('error'); }
  }, [searchParams]);

  const accept = async (values: { password: string; confirmPassword: string }) => {
    const token = searchParams.get('token');
    if (!token) return;
    setState('loading');
    try { setDetail(await authService.acceptInvite({ ...values, token })); setState('success'); }
    catch (error) { message.error(error instanceof Error ? error.message : 'Invitation activation failed'); setState('ready'); }
  };

  return <main className="public-auth-page"><section className="public-auth-panel">
    {state === 'loading' ? <div className="public-auth-loading"><Spin size="large" /><Typography.Paragraph>Activating your account...</Typography.Paragraph></div> : state === 'ready' ? <>
      <Typography.Title level={3}>Accept invitation</Typography.Title>
      <Typography.Paragraph type="secondary">Set a password to join the enterprise knowledge base.</Typography.Paragraph>
      <Form layout="vertical" onFinish={accept} className="public-auth-form">
        <Form.Item label="Password" name="password" rules={[{ required: true, min: 8 }]}><Input.Password /></Form.Item>
        <Form.Item label="Confirm password" name="confirmPassword" dependencies={['password']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { return value === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('Passwords do not match')); } })]}><Input.Password /></Form.Item>
        <Button type="primary" htmlType="submit" block>Activate account</Button>
      </Form>
    </> : <Result
      icon={state === 'success' ? <MailOutlined /> : undefined}
      status={state}
      title={state === 'success' ? 'Account activated' : 'Activation failed'}
      subTitle={detail}
      extra={<Button type="primary" onClick={() => navigate('/login')}>Go to sign in</Button>}
    />}
  </section></main>;
}
