import { ClockCircleOutlined, ExclamationCircleOutlined, EyeOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import { documentService } from '@/services/document.service';
import type { KnowledgeDocument, ShareVO } from '@/types';

type ViewState = 'loading' | 'verify' | 'content' | 'error';

export default function ShareViewerPage() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<ViewState>('loading');
  const [share, setShare] = useState<ShareVO | null>(null);
  const [document, setDocument] = useState<KnowledgeDocument | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const load = async (pwd?: string) => {
    if (!shareId) return;
    try { setDocument(await documentService.accessPublicShare(shareId, pwd)); setState('content'); }
    catch (e) { setError((e as Error).message); setState(share?.requirePassword ? 'verify' : 'error'); }
  };
  useEffect(() => { if (shareId) void documentService.getPublicShareInfo(shareId).then((info) => { setShare(info); if (info.requirePassword) setState('verify'); else void load(); }).catch(() => setState('error')); }, [shareId]);
  if (state === 'loading') return <div className="page-spinner"><Spin size="large" /></div>;
  if (state === 'verify') return <main className="detail-main"><Card title={<><LockOutlined /> Password required</>} style={{ maxWidth: 440, margin: '80px auto' }}>
    <Typography.Paragraph>{share?.title}</Typography.Paragraph><Input.Password value={password} onChange={(e) => setPassword(e.target.value)} onPressEnter={() => void load(password)} /><Typography.Text type="danger">{error}</Typography.Text><Button type="primary" block style={{ marginTop: 16 }} onClick={() => void load(password)}>Verify and view</Button>
  </Card></main>;
  if (state !== 'content' || !document) return <main className="detail-main"><Card><ExclamationCircleOutlined /> Unable to access this share</Card></main>;
  return <main className="detail-main"><Card><Typography.Title>{document.title}</Typography.Title><Space><span><UserOutlined /> {document.authorName}</span><span><ClockCircleOutlined /> {share?.shareTime}</span><span><EyeOutlined /> {document.viewCount}</span></Space></Card><Card style={{ marginTop: 16 }}><ReactMarkdown remarkPlugins={[remarkGfm]}>{document.content || ''}</ReactMarkdown></Card><Button style={{ marginTop: 16 }} onClick={() => navigate('/login')}>Open knowledge base</Button></main>;
}
