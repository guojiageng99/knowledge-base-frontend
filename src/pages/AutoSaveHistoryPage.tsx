import { ArrowLeftOutlined, HistoryOutlined, RollbackOutlined } from '@ant-design/icons';
import { Button, Layout, List, Spin, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { documentService } from '@/services/document.service';
import type { AutoSaveHistoryItem } from '@/types';

export default function AutoSaveHistoryPage() {
  const { id } = useParams(); const navigate = useNavigate(); const documentId = Number(id);
  const [history, setHistory] = useState<AutoSaveHistoryItem[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { void documentService.getAutoSaveHistory(documentId).then((page) => setHistory(page.records)).catch(() => message.error('Unable to load automatic-save history.')).finally(() => setLoading(false)); }, [documentId]);
  const restore = async (snapshotId: string) => {
    try { const snapshot = await documentService.getAutoSaveSnapshot(documentId, snapshotId); await documentService.saveDocumentContent(documentId, snapshot.content || ''); message.success('Snapshot content restored.'); navigate(`/documents/${documentId}/edit`); } catch { message.error('Unable to restore snapshot.'); }
  };
  return <Layout className="workspace-layout"><header className="workspace-header"><Typography.Title level={4}>Knowledge Base</Typography.Title><Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/documents/${documentId}/edit`)}>Back to editor</Button></header><main className="workspace-main"><div className="page-title-row"><div><Typography.Title level={3}><HistoryOutlined /> Automatic-save history</Typography.Title><Typography.Text type="secondary">Restore a saved Markdown snapshot when needed.</Typography.Text></div></div><Spin spinning={loading}><List dataSource={history} locale={{ emptyText: 'No automatic-save snapshots yet.' }} renderItem={(item) => <List.Item actions={[<Button key="restore" icon={<RollbackOutlined />} onClick={() => void restore(item.id)}>Restore</Button>]}><List.Item.Meta title={item.title || 'Untitled document'} description={<><div>{item.contentPreview || 'No preview'}</div><Typography.Text type="secondary">{dayjs(item.savedAt).format('YYYY-MM-DD HH:mm:ss')} · {item.contentLength ?? 0} chars</Typography.Text></>} /></List.Item>} /></Spin></main></Layout>;
}
