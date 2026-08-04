import { LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Result, Steps, Typography, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import './PublicAuthPage.css';

interface EmailForm { email: string; }
interface CodeForm { code: string; }
interface PasswordForm { password: string; confirmPassword: string; }

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const sendCode = async ({ email: value }: EmailForm) => { setLoading(true); try { await authService.sendResetCode({ email: value }); setEmail(value); setStep(1); message.success('Verification code sent.'); } catch (error) { message.error(error instanceof Error ? error.message : 'Unable to send verification code.'); } finally { setLoading(false); } };
  const verifyCode = async ({ code: value }: CodeForm) => { setLoading(true); try { await authService.verifyResetCode({ email, code: value }); setCode(value); setStep(2); } catch (error) { message.error(error instanceof Error ? error.message : 'Invalid verification code.'); } finally { setLoading(false); } };
  const reset = async ({ password }: PasswordForm) => { setLoading(true); try { await authService.resetPassword({ email, code, newPassword: password }); setStep(3); } catch (error) { message.error(error instanceof Error ? error.message : 'Password reset failed.'); } finally { setLoading(false); } };

  return <main className="public-auth-page"><Card className="public-auth-panel" bordered={false}>
    {step < 3 ? <><Typography.Title level={3}>Reset password</Typography.Title><Steps current={step} size="small" items={[{ title: 'Email' }, { title: 'Code' }, { title: 'New password' }]} />
      {step === 0 && <Form<EmailForm> layout="vertical" onFinish={sendCode} className="public-auth-form"><Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}><Input prefix={<MailOutlined />} /></Form.Item><Button type="primary" htmlType="submit" block loading={loading}>Send code</Button></Form>}
      {step === 1 && <Form<CodeForm> layout="vertical" onFinish={verifyCode} className="public-auth-form"><Typography.Paragraph type="secondary">Enter the six-digit code sent to {email}.</Typography.Paragraph><Form.Item label="Verification code" name="code" rules={[{ required: true, pattern: /^\d{6}$/, message: 'Enter a six-digit code' }]}><Input prefix={<SafetyOutlined />} inputMode="numeric" maxLength={6} /></Form.Item><Button type="primary" htmlType="submit" block loading={loading}>Verify code</Button><Button type="link" block onClick={() => setStep(0)}>Use another email</Button></Form>}
      {step === 2 && <Form<PasswordForm> layout="vertical" onFinish={reset} className="public-auth-form"><Form.Item label="New password" name="password" rules={[{ required: true }, { min: 8 }]}><Input.Password prefix={<LockOutlined />} /></Form.Item><Form.Item label="Confirm new password" name="confirmPassword" dependencies={['password']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { return !value || value === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('Passwords do not match')); } })]}><Input.Password prefix={<LockOutlined />} /></Form.Item><Button type="primary" htmlType="submit" block loading={loading}>Reset password</Button></Form>}
    </> : <Result status="success" title="Password reset complete" subTitle="You can now sign in with the new password." extra={<Button type="primary" onClick={() => navigate('/login')}>Go to sign in</Button>} />}
  </Card></main>;
}
