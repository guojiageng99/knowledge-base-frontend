import { CloudServerOutlined, DatabaseOutlined, ReloadOutlined, SaveOutlined, SecurityScanOutlined, SettingOutlined, ToolOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Divider, Form, Input, InputNumber, Layout, Progress, Row, Select, Spin, Statistic, Switch, Tabs, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import settingsService from '@/services/settings.service';
import { useAppStore } from '@/stores';
import type { SystemSettings } from '@/types';

type SettingsTab = 'basic' | 'security' | 'storage' | 'notification' | 'ai' | 'status';

const tabItems = [
  { key: 'basic', label: 'Basic', icon: <SettingOutlined /> },
  { key: 'security', label: 'Security', icon: <SecurityScanOutlined /> },
  { key: 'storage', label: 'Storage', icon: <CloudServerOutlined /> },
  { key: 'notification', label: 'Notifications', icon: <ToolOutlined /> },
  { key: 'ai', label: 'AI', icon: <ToolOutlined /> },
  { key: 'status', label: 'System status', icon: <DatabaseOutlined /> },
] as const;

export default function SettingsPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const refreshAppConfig = useAppStore((state) => state.refreshAppConfig);
  const [settings, setSettings] = useState<SystemSettings>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [basicForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [storageForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [aiForm] = Form.useForm();

  const forms: Record<Exclude<SettingsTab, 'status'>, typeof basicForm> = {
    basic: basicForm, security: securityForm, storage: storageForm, notification: notificationForm, ai: aiForm,
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
      basicForm.setFieldsValue(data.basic);
      securityForm.setFieldsValue(data.security);
      storageForm.setFieldsValue(data.storage);
      notificationForm.setFieldsValue(data.notification);
      aiForm.setFieldsValue(data.ai);
    } catch {
      message.error('Unable to load system settings');
    } finally {
      setLoading(false);
    }
  }, [aiForm, basicForm, message, notificationForm, securityForm, storageForm]);

  useEffect(() => { void load(); }, [load]);

  const save = async (section: Exclude<SettingsTab, 'status'>) => {
    try {
      const values = await forms[section].validateFields();
      setSaving(true);
      await settingsService.updateSettings(section, values);
      await refreshAppConfig();
      await load();
      message.success('Settings saved');
    } catch (error: unknown) {
      if (!(error instanceof Error && 'errorFields' in error)) message.error('Unable to save settings');
    } finally {
      setSaving(false);
    }
  };

  const clearCache = async () => {
    try { message.success(await settingsService.clearCache()); } catch { message.error('Unable to clear cache'); }
  };
  const createBackup = async () => {
    try { message.success(await settingsService.createBackup()); await load(); } catch { message.error('Unable to create backup'); }
  };

  const content: Record<SettingsTab, React.ReactNode> = {
    basic: <Form form={basicForm} layout="vertical"><Form.Item name="systemName" label="System name" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="systemDescription" label="System description"><Input.TextArea rows={2} /></Form.Item><Row gutter={16}><Col xs={24} md={12}><Form.Item name="defaultLanguage" label="Default language"><Select options={[{ value: 'zh-CN', label: 'Simplified Chinese' }, { value: 'en-US', label: 'English' }]} /></Form.Item></Col><Col xs={24} md={12}><Form.Item name="timezone" label="Timezone"><Input /></Form.Item></Col></Row><Form.Item name="allowRegistration" label="Allow registration" valuePropName="checked"><Switch /></Form.Item><Form.Item name="requireApproval" label="Require review before publication" valuePropName="checked"><Switch /></Form.Item><Form.Item name="enableComments" label="Enable comments" valuePropName="checked"><Switch /></Form.Item><Form.Item name="enableAI" label="Enable AI" valuePropName="checked"><Switch /></Form.Item><Form.Item name="enableAIWriting" label="Enable AI writing" valuePropName="checked"><Switch /></Form.Item><Form.Item name="enableFullTextSearch" label="Enable full-text search" valuePropName="checked"><Switch /></Form.Item><Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void save('basic')}>Save basic settings</Button></Form>,
    security: <Form form={securityForm} layout="vertical"><Form.Item name="passwordPolicy" label="Password policy"><Select options={['low', 'medium', 'high'].map((value) => ({ value, label: value }))} /></Form.Item><Row gutter={16}><Col xs={24} md={12}><Form.Item name="sessionTimeout" label="Session timeout (seconds)"><InputNumber min={300} max={86400} className="full-width" /></Form.Item></Col><Col xs={24} md={12}><Form.Item name="passwordMinLength" label="Minimum password length"><InputNumber min={4} max={32} className="full-width" /></Form.Item></Col></Row><Form.Item name="loginMaxRetry" label="Maximum login retries"><InputNumber min={1} max={20} className="full-width" /></Form.Item><Form.Item name="enable2FA" label="Enable two-factor authentication" valuePropName="checked"><Switch /></Form.Item><Form.Item name="ipRestriction" label="Enable IP restriction" valuePropName="checked"><Switch /></Form.Item><Form.Item name="requireSpecialChar" label="Require special character" valuePropName="checked"><Switch /></Form.Item><Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void save('security')}>Save security settings</Button></Form>,
    storage: <Form form={storageForm} layout="vertical"><Form.Item name="maxFileSize" label="Maximum file size (MB)" getValueProps={(value: number) => ({ value: Math.round((value || 0) / 1048576) })} getValueFromEvent={(value: number | null) => (value || 0) * 1048576}><InputNumber min={1} max={2048} addonAfter="MB" className="full-width" /></Form.Item><Form.Item name="allowedFileTypes" label="Allowed file types" getValueProps={(value: string | string[]) => ({ value: Array.isArray(value) ? value : (value || '').split(',').filter(Boolean) })} getValueFromEvent={(value: string[]) => value.join(',')}><Select mode="tags" tokenSeparators={[',']} placeholder="Enter an extension and press Enter" /></Form.Item><Form.Item name="storageEndpoints" label="Storage endpoint"><Input /></Form.Item><Form.Item name="storageBucket" label="Storage bucket"><Input /></Form.Item><Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void save('storage')}>Save storage settings</Button></Form>,
    notification: <Form form={notificationForm} layout="vertical"><Form.Item name="emailEnabled" label="Enable email notifications" valuePropName="checked"><Switch /></Form.Item><Form.Item name="emailHost" label="Email host"><Input /></Form.Item><Form.Item name="emailPort" label="Email port"><InputNumber min={1} max={65535} className="full-width" /></Form.Item><Form.Item name="websocketEnabled" label="Enable WebSocket notifications" valuePropName="checked"><Switch /></Form.Item><Form.Item name="notificationRetentionDays" label="Notification retention (days)"><InputNumber min={1} max={365} className="full-width" /></Form.Item><Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void save('notification')}>Save notification settings</Button></Form>,
    ai: <Form form={aiForm} layout="vertical"><Form.Item name="aiModelName" label="AI model"><Input /></Form.Item><Form.Item name="embeddingModel" label="Embedding model"><Input /></Form.Item><Row gutter={16}><Col xs={24} md={16}><Form.Item name="milvusHost" label="Milvus host"><Input /></Form.Item></Col><Col xs={24} md={8}><Form.Item name="milvusPort" label="Milvus port"><InputNumber min={1} max={65535} className="full-width" /></Form.Item></Col></Row><Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void save('ai')}>Save AI settings</Button></Form>,
    status: settings?.status ? <><Row gutter={[16, 16]}><Col xs={24} sm={12} lg={6}><Card size="small"><Statistic title="Version" value={settings.status.version} /></Card></Col><Col xs={24} sm={12} lg={6}><Card size="small"><Statistic title="Database" value={settings.status.dbStatus} /></Card></Col><Col xs={24} sm={12} lg={6}><Card size="small"><Statistic title="Documents" value={settings.status.documentCount} /></Card></Col><Col xs={24} sm={12} lg={6}><Card size="small"><Statistic title="Users" value={settings.status.userCount} /></Card></Col></Row><Divider /><Typography.Text>Storage usage</Typography.Text><Progress percent={Math.min(100, Math.round((settings.status.usedStorage / Math.max(1, settings.status.totalStorage)) * 100))} format={() => `${Math.round(settings.status.usedStorage / 1073741824)} GB / ${Math.round(settings.status.totalStorage / 1073741824)} GB`} /><Divider /><Typography.Paragraph>Started: {settings.status.startTime}<br />Last backup: {settings.status.lastBackupTime}</Typography.Paragraph><Button icon={<ReloadOutlined />} onClick={() => void clearCache()}>Clear cache</Button><Button type="primary" style={{ marginLeft: 8 }} onClick={() => void createBackup()}>Create backup</Button></> : null,
  };

  return <Layout className="workspace-layout"><header className="workspace-header"><Typography.Title level={4}>Knowledge Base</Typography.Title><Button onClick={() => navigate('/')}>Back to dashboard</Button></header><main className="workspace-main"><div className="page-title-row"><div><Typography.Title level={3}><SettingOutlined /> System settings</Typography.Title><Typography.Text type="secondary">Configure platform behavior, integrations, and runtime options.</Typography.Text></div><Button icon={<ReloadOutlined />} onClick={() => void load()}>Reload</Button></div><Card>{loading ? <div className="page-spinner"><Spin size="large" /></div> : <Tabs items={tabItems.map((tab) => ({ key: tab.key, label: <span>{tab.icon} {tab.label}</span>, children: <div className="settings-content">{content[tab.key]}</div> }))} />}</Card></main></Layout>;
}
