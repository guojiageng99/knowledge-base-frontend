import { ClearOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Empty, List, Popconfirm, Space, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accessService } from '@/services/access.service';
import type { DocumentAccess } from '@/types';

export default function RecentAccessPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DocumentAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); try { setItems(await accessService.getRecentAccess(20)); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const remove = async (id: number) => { await accessService.deleteAccess(id); setItems((current) => current.filter((item) => item.documentId !== id)); };
  const clear = async () => { await accessService.clearAllAccess(); setItems([]); };

  return <main className="detail-main">
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Typography.Title level={2} style={{ margin: 0 }}><FileTextOutlined /> Recent access</Typography.Title>
        {items.length > 0 && <Popconfirm title="Clear recent access?" onConfirm={() => void clear()}><Button danger icon={<ClearOutlined />}>Clear</Button></Popconfirm>}
      </Space>
      {loading ? <Spin /> : items.length === 0 ? <Empty description="No recent access" /> : <List
        dataSource={items}
        renderItem={(item) => <List.Item actions={[<Popconfirm key="remove" title="Remove this record?" onConfirm={() => void remove(item.documentId)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>]}>
          <Card hoverable style={{ width: '100%' }} onClick={() => navigate(`/documents/${item.documentId}`)}>
            <List.Item.Meta title={item.documentTitle} description={item.summary || item.accessTime} />
          </Card>
        </List.Item>}
      />}
    </Space>
  </main>;
}
