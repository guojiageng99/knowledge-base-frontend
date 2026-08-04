import { BellOutlined, CheckOutlined, DeleteOutlined, FilterOutlined, FileTextOutlined, ReloadOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Drawer, Empty, List, Segmented, Select, Space, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/stores';
import type { SystemNotification } from '@/types';

const typeLabels: Record<SystemNotification['type'], string> = { system: 'System', comment: 'Comment', mention: 'Mention', review: 'Review', like: 'Like' };
const typeColors: Record<SystemNotification['type'], string> = { system: 'blue', comment: 'cyan', mention: 'purple', review: 'orange', like: 'red' };

export default function NotificationCenterPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotificationStore();
  const [status, setStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [type, setType] = useState<SystemNotification['type'] | undefined>();
  const [selected, setSelected] = useState<SystemNotification | null>(null);

  const load = () => fetchNotifications({ current: 1, size: 100, notificationType: type, isRead: status === 'all' ? undefined : status === 'read' ? 1 : 0 });
  useEffect(() => { void load(); void fetchUnreadCount(); }, [status, type]);

  const filtered = useMemo(() => notifications.filter((item) => !type || item.type === type), [notifications, type]);
  const handleRead = async (item: SystemNotification) => { if (!item.read) await markAsRead(item.id); };
  const handleDelete = async (item: SystemNotification) => { await deleteNotification(item.id); if (selected?.id === item.id) setSelected(null); message.success('Notification deleted'); };
  const openLink = (item: SystemNotification) => { void handleRead(item); if (item.link) navigate(item.link); };

  return (
    <main className="notification-main">
      <div className="page-title-row">
        <div><Typography.Title level={2}><BellOutlined /> Notification center</Typography.Title><Typography.Text type="secondary">All your system messages in one place</Typography.Text></div>
        <Space><Badge count={unreadCount} showZero><Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button></Badge><Button icon={<CheckOutlined />} disabled={!unreadCount} onClick={() => void markAllAsRead()}>Mark all read</Button><Button danger icon={<DeleteOutlined />} disabled={!notifications.length} onClick={() => void clearAll()}>Clear all</Button></Space>
      </div>
      <Card>
        <Space wrap style={{ marginBottom: 18 }}><Segmented value={status} onChange={(value) => setStatus(value as typeof status)} options={[{ label: 'All', value: 'all' }, { label: 'Unread', value: 'unread' }, { label: 'Read', value: 'read' }]} /><Select allowClear placeholder="Notification type" value={type} onChange={setType} style={{ width: 160 }} suffixIcon={<FilterOutlined />} options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))} /></Space>
        <List loading={isLoading} locale={{ emptyText: <Empty description="No notifications" /> }} dataSource={filtered} renderItem={(item) => (
          <List.Item actions={[!item.read && <Button key="read" type="text" icon={<CheckOutlined />} onClick={() => void handleRead(item)}>Mark read</Button>, <Button key="delete" type="text" danger icon={<DeleteOutlined />} onClick={() => void handleDelete(item)} />]}>
            <List.Item.Meta avatar={<Badge dot={!item.read}><BellOutlined style={{ fontSize: 22, color: item.read ? '#8c8c8c' : '#1677ff' }} /></Badge>} title={<Space><Button type="link" style={{ padding: 0, fontWeight: item.read ? 400 : 600 }} onClick={() => { setSelected(item); void handleRead(item); }}>{item.title}</Button><Tag color={typeColors[item.type]}>{typeLabels[item.type]}</Tag></Space>} description={<><Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 4 }}>{item.content}</Typography.Paragraph><Typography.Text type="secondary">{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}</Typography.Text></>} />
          </List.Item>
        )} />
      </Card>
      <Drawer title={selected?.title} open={Boolean(selected)} onClose={() => setSelected(null)} extra={selected?.link && <Button icon={<FileTextOutlined />} onClick={() => selected && openLink(selected)}>Open</Button>}>
        {selected && <Space direction="vertical" size="middle" style={{ width: '100%' }}><Tag color={typeColors[selected.type]}>{typeLabels[selected.type]}</Tag><Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selected.content}</Typography.Paragraph><Typography.Text type="secondary">{dayjs(selected.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Typography.Text></Space>}
      </Drawer>
    </main>
  );
}
