import {
  Avatar, Button, Card, Col, Divider, Form, Input, Layout, Modal, Row, Space, Statistic, Typography, Upload, message,
} from 'antd';
import { ArrowLeftOutlined, CameraOutlined, LockOutlined, LogoutOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import type { RcFile, UploadRequestOption } from 'rc-upload/lib/interface';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fileService } from '@/services/file.service';
import { userService, type UserProfileForm } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import type { User, UserStatistics } from '@/types';

const emptyStats: UserStatistics = { documentCount: 0, likeCount: 0, viewCount: 0, commentCount: 0 };

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const [form] = Form.useForm<UserProfileForm>();
  const [passwordForm] = Form.useForm<{ oldPassword: string; newPassword: string; confirmPassword: string }>();
  const [stats, setStats] = useState(emptyStats);
  const [saving, setSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar);

  useEffect(() => {
    if (!user) return;
    form.setFieldsValue({ ...user, phone: user.phone ?? undefined });
    setAvatar(user.avatar);
    void userService.getUserStats().then(setStats).catch(() => setStats(emptyStats));
  }, [form, user]);

  const displayName = useMemo(() => user?.realName || user?.nickname || user?.username || 'User', [user]);
  const saveProfile = async () => {
    const values = await form.validateFields();
    const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value === '' ? undefined : value])) as UserProfileForm;
    setSaving(true);
    try {
      await userService.updateProfile(payload);
      const nextUser: User = { ...user, ...payload, username: payload.username ?? user?.username ?? '' };
      updateUser(nextUser);
      message.success('Profile updated');
    } finally { setSaving(false); }
  };
  const changePassword = async () => {
    const values = await passwordForm.validateFields();
    setPasswordSaving(true);
    try {
      await userService.changePassword(values.oldPassword, values.newPassword);
      message.success('Password changed');
      passwordForm.resetFields();
      setPasswordOpen(false);
    } finally { setPasswordSaving(false); }
  };
  const uploadAvatar = async (options: UploadRequestOption) => {
    try {
      const file = options.file as RcFile;
      const id = user?.id ?? user?.userId;
      if (!id) throw new Error('User ID is unavailable');
      const result = await fileService.uploadAvatar(file, id);
      setAvatar(result.fileUrl);
      form.setFieldValue('avatar', result.fileUrl);
      options.onSuccess?.(result);
      message.success('Avatar uploaded');
    } catch (error) {
      options.onError?.(error as Error);
    }
  };
  return <Layout className="workspace-layout">
    <header className="workspace-header"><Space><Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} /><Typography.Title level={4}>Personal Center</Typography.Title></Space><Space><Button icon={<LockOutlined />} onClick={() => setPasswordOpen(true)}>Change password</Button><Button danger icon={<LogoutOutlined />} onClick={() => void logout()}>Log out</Button></Space></header>
    <main className="profile-main">
      <section className="profile-hero"><Space align="start" size={18}><Upload showUploadList={false} accept="image/*" customRequest={uploadAvatar} beforeUpload={(file) => file.size <= 5 * 1024 * 1024 || Upload.LIST_IGNORE}><Avatar size={88} src={avatar} icon={<UserOutlined />} /></Upload><div><Typography.Title level={2}>{displayName}</Typography.Title><Typography.Text type="secondary">@{user?.username}</Typography.Text><div className="profile-avatar-hint"><CameraOutlined /> Change avatar</div></div></Space><Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void saveProfile()}>Save profile</Button></section>
      <Row gutter={[16, 16]} className="profile-stats"><Col xs={12} md={6}><Card><Statistic title="Documents" value={stats.documentCount} /></Card></Col><Col xs={12} md={6}><Card><Statistic title="Likes received" value={stats.likeCount} /></Card></Col><Col xs={12} md={6}><Card><Statistic title="Views" value={stats.viewCount} /></Card></Col><Col xs={12} md={6}><Card><Statistic title="Comments" value={stats.commentCount} /></Card></Col></Row>
      <Card title="Profile information"><Form form={form} layout="vertical"><Form.Item name="avatar" hidden><Input /></Form.Item><Row gutter={16}><Col xs={24} md={12}><Form.Item label="Username" name="username" rules={[{ required: true, min: 4, max: 20 }]}><Input /></Form.Item></Col><Col xs={24} md={12}><Form.Item label="Real name" name="realName"><Input /></Form.Item></Col><Col xs={24} md={12}><Form.Item label="Email" name="email" rules={[{ type: 'email' }]}><Input /></Form.Item></Col><Col xs={24} md={12}><Form.Item label="Phone" name="phone"><Input /></Form.Item></Col><Col xs={24} md={12}><Form.Item label="Department" name="department"><Input /></Form.Item></Col><Col xs={24} md={12}><Form.Item label="Position" name="position"><Input /></Form.Item></Col><Col span={24}><Form.Item label="Personal bio" name="remark"><Input.TextArea rows={5} maxLength={500} showCount /></Form.Item></Col></Row></Form></Card>
      <Divider />
      <Typography.Text type="secondary">Account created: {user?.createTime || '-'}</Typography.Text>
    </main>
    <Modal title="Change password" open={passwordOpen} confirmLoading={passwordSaving} onOk={() => void changePassword()} onCancel={() => setPasswordOpen(false)}><Form form={passwordForm} layout="vertical"><Form.Item label="Current password" name="oldPassword" rules={[{ required: true }]}><Input.Password /></Form.Item><Form.Item label="New password" name="newPassword" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item><Form.Item label="Confirm new password" name="confirmPassword" dependencies={['newPassword']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { return !value || value === getFieldValue('newPassword') ? Promise.resolve() : Promise.reject(new Error('Passwords do not match')); } })]}><Input.Password /></Form.Item></Form></Modal>
  </Layout>;
}
