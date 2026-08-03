import { DeleteOutlined, EditOutlined, EyeOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Layout, Popconfirm, Space, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '@/services/document.service';
import type { KnowledgeDocument } from '@/types';

export default function DraftsPage() {
  const navigate = useNavigate(); const [rows, setRows] = useState<KnowledgeDocument[]>([]); const [total, setTotal] = useState(0); const [loading, setLoading] = useState(false); const [keyword, setKeyword] = useState(''); const [page, setPage] = useState(1);
  const load = async (current = page) => { setLoading(true); try { const result = await documentService.getDocuments({ current, size: 10, status: 0, keyword: keyword || undefined }); setRows(result.records); setTotal(result.total); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [page]);
  const remove = async (id: number) => { await documentService.deleteDocument(id); await load(); message.success('Draft deleted'); };
  const columns: ColumnsType<KnowledgeDocument> = [{ title: 'Title', dataIndex: 'title', render: (value, row) => <Button type="link" onClick={() => navigate(`/documents/${row.id}`)}>{value}</Button> }, { title: 'Author', dataIndex: 'authorName', render: (value) => value || '-' }, { title: 'Words', dataIndex: 'contentLength', render: (value, row) => value ?? row.wordCount ?? 0 }, { title: 'Updated', dataIndex: 'updateTime', render: (value) => value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-' }, { title: 'Actions', render: (_, row) => <Space><Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/documents/${row.id}/edit?from=drafts`)} /><Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/documents/${row.id}`)} /><Popconfirm title="Delete this draft?" onConfirm={() => void remove(row.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm></Space> }];
  return <Layout className="workspace-layout"><header className="workspace-header"><Typography.Title level={4}>Knowledge Base</Typography.Title><Button onClick={() => navigate('/')}>Back to dashboard</Button></header><main className="workspace-main"><div className="page-title-row"><div><Typography.Title level={3}>Drafts</Typography.Title><Typography.Text type="secondary">Review and publish unfinished documents</Typography.Text></div><Button type="primary" icon={<UploadOutlined />} onClick={() => navigate('/documents/import')}>Import Markdown</Button></div><section className="table-toolbar"><Input value={keyword} onChange={(e) => setKeyword(e.target.value)} onPressEnter={() => { setPage(1); void load(1); }} placeholder="Search drafts" /><Button type="primary" onClick={() => { setPage(1); void load(1); }}>Search</Button><Button icon={<ReloadOutlined />} onClick={() => void load()} /></section><Table className="documents-table" rowKey="id" loading={loading} locale={{ emptyText: <Empty description="No drafts" /> }} columns={columns} dataSource={rows} pagination={{ current: page, pageSize: 10, total, onChange: setPage }} /></main></Layout>;
}
