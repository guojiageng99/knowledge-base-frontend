import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Input, Layout, List, Space, Spin, Tag, Typography, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { reviewService } from '@/services';
import { documentService } from '@/services/document.service';
import type { KnowledgeDocument, ReviewTask } from '@/types';

export default function DocumentReviewWorkspacePage() {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const id = Number(documentId);
  const [document, setDocument] = useState<KnowledgeDocument | null>(null);
  const [currentTask, setCurrentTask] = useState<ReviewTask | null>(null);
  const [history, setHistory] = useState<ReviewTask[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [nextDocument, nextTask, nextHistory] = await Promise.all([
        documentService.getDocument(id), reviewService.getCurrentReviewTask(id), reviewService.getReviewHistory(id),
      ]);
      setDocument(nextDocument); setCurrentTask(nextTask); setHistory(nextHistory);
    } finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  const submitReview = async (status: 'approved' | 'rejected') => {
    if (!currentTask) return message.warning('There is no pending review task');
    if (status === 'rejected' && !comment.trim()) return message.warning('Rejection comment is required');
    setSubmitting(true);
    try {
      await reviewService.reviewDocument(currentTask.id, { status, comment: comment.trim() || undefined });
      message.success(status === 'approved' ? 'Review approved' : 'Document rejected');
      await load();
    } finally { setSubmitting(false); }
  };

  if (loading || !document) return <div className="page-spinner"><Spin /></div>;
  return <Layout className="workspace-layout"><header className="workspace-header"><Typography.Title level={4}>Review workspace</Typography.Title><Space><Button icon={<ReloadOutlined />} onClick={() => void load()}>Refresh</Button><Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/reviews')}>Back</Button></Space></header><main className="review-workspace-main"><div className="page-title-row"><div><Typography.Title level={2}>{document.title}</Typography.Title><Typography.Text type="secondary">Author: {document.authorName || document.author?.username || '-'}</Typography.Text></div><Tag color={document.status === 3 ? 'gold' : document.status === 1 ? 'green' : 'default'}>{document.status === 3 ? 'Pending review' : document.status === 1 ? 'Published' : 'Draft'}</Tag></div><section className="review-workspace-grid"><Card title="Document content"><ReactMarkdown>{document.content || 'No content'}</ReactMarkdown></Card><Card title="Review action"><Space direction="vertical" style={{ width: '100%' }}><Input.TextArea rows={7} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Review comment" /><Space><Button type="primary" icon={<CheckOutlined />} loading={submitting} disabled={!currentTask} onClick={() => void submitReview('approved')}>Approve</Button><Button danger icon={<CloseOutlined />} loading={submitting} disabled={!currentTask} onClick={() => void submitReview('rejected')}>Reject</Button></Space></Space></Card></section><Divider /><Card title="Review history"><List dataSource={history} locale={{ emptyText: 'No review history' }} renderItem={(item) => <List.Item><List.Item.Meta title={`${item.status} · round ${item.reviewRound}`} description={`${item.comment || 'No comment'} · ${item.createdAt}`} /></List.Item>} /></Card></main></Layout>;
}
