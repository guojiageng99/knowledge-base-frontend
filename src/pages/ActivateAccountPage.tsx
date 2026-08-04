import { MailOutlined } from '@ant-design/icons';
import { Button, Result, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import './PublicAuthPage.css';

export default function ActivateAccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setDetail('This activation link is missing its token.');
      setState('error');
      return;
    }
    authService.verifyEmail(token)
      .then((message) => { setDetail(message || 'Your account is ready to use.'); setState('success'); })
      .catch((error: Error) => { setDetail(error.message || 'Account activation failed.'); setState('error'); });
  }, [searchParams]);

  return <main className="public-auth-page"><section className="public-auth-panel">
    {state === 'loading' ? <div className="public-auth-loading"><Spin size="large" /><Typography.Paragraph>Activating your account...</Typography.Paragraph></div> : <Result
      icon={state === 'success' ? <MailOutlined /> : undefined}
      status={state}
      title={state === 'success' ? 'Account activated' : 'Activation failed'}
      subTitle={detail}
      extra={<Button type="primary" onClick={() => navigate('/login')}>Go to sign in</Button>}
    />}
  </section></main>;
}
