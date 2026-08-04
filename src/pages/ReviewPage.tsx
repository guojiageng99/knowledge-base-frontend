import { CheckOutlined, CloseOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Layout, Modal, Popconfirm, Space, Statistic, Table, Tabs, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '@/services';
import type { ReviewTask } from '@/types';

const labels = { pending: '待审核', approved: '已通过', rejected: '已驳回' } as const;

export default function ReviewPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState<ReviewTask>();
  const [comment, setComment] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [page, nextStats] = await Promise.all([
        reviewService.getReviewTasks({ status: tab, page: 1, pageSize: 100, keyword: keyword || undefined }),
        reviewService.getReviewStats(),
      ]);
      setTasks(page.list); setStats(nextStats as unknown as { pending: number; approved: number; rejected: number });
    } finally { setLoading(false); }
  }, [keyword, tab]);
  useEffect(() => { void load(); }, [load]);

  const review = async (task: ReviewTask, status: 'approved' | 'rejected', reason?: string) => {
    if (status === 'rejected' && !reason?.trim()) { message.warning('驳回时请填写审核意见'); return; }
    await reviewService.reviewDocument(task.id, { status, comment: reason });
    message.success(status === 'approved' ? '审核已通过' : '文档已驳回');
    setRejecting(undefined); setComment(''); await load();
  };
  const columns: ColumnsType<ReviewTask> = [
    { title: '文档标题', dataIndex: 'documentTitle', render: (value, row) => <Button type="link" onClick={() => navigate(`/documents/${row.documentId}`)}>{value}</Button> },
    { title: '作者', dataIndex: ['documentAuthor', 'username'] },
    { title: '状态', dataIndex: 'status', render: (value: ReviewTask['status']) => <Tag color={value === 'pending' ? 'gold' : value === 'approved' ? 'green' : 'red'}>{labels[value]}</Tag> },
    { title: '轮次', dataIndex: 'reviewRound' },
    { title: '提交时间', dataIndex: 'createdAt' },
    { title: '操作', render: (_, row) => <Space><Button icon={<EyeOutlined />} onClick={() => navigate(`/documents/${row.documentId}`)}>预览</Button>{row.status === 'pending' && <><Popconfirm title="确认通过该文档？" onConfirm={() => void review(row, 'approved')}><Button type="link" icon={<CheckOutlined />}>通过</Button></Popconfirm><Button danger type="link" icon={<CloseOutlined />} onClick={() => setRejecting(row)}>驳回</Button></>}</Space> },
  ];
  const pending = tasks.filter((task) => task.status === 'pending');
  const batchApprove = async () => { if (!pending.length) return message.info('当前没有待审核任务'); await reviewService.batchReview(pending.map((task) => task.id), { status: 'approved' }); message.success(`已批量通过 ${pending.length} 个任务`); await load(); };

  return <Layout className="workspace-layout"><header className="workspace-header"><Typography.Title level={4}>Knowledge Base</Typography.Title><Button onClick={() => navigate('/')}>返回首页</Button></header><main className="workspace-main"><div className="page-title-row"><div><Typography.Title level={3}>文档审核</Typography.Title><Typography.Text type="secondary">管理文档提交、审核通过与驳回记录</Typography.Text></div><Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button></div><Space wrap style={{ marginBottom: 16 }}><Card><Statistic title="待审核" value={stats.pending} /></Card><Card><Statistic title="已通过" value={stats.approved} /></Card><Card><Statistic title="已驳回" value={stats.rejected} /></Card></Space><section className="table-toolbar"><Input prefix={<SearchOutlined />} value={keyword} onChange={(event) => setKeyword(event.target.value)} onPressEnter={() => void load()} placeholder="搜索文档标题" /><Button type="primary" icon={<SearchOutlined />} onClick={() => void load()}>搜索</Button>{tab === 'pending' && <Button onClick={() => void batchApprove()}>批量通过</Button>}</section><Tabs activeKey={tab} onChange={(value) => setTab(value as typeof tab)} items={Object.entries(labels).map(([key, label]) => ({ key, label }))} /><Table rowKey="id" loading={loading} columns={columns} dataSource={tasks} pagination={false} /></main><Modal title="驳回文档" open={Boolean(rejecting)} onCancel={() => setRejecting(undefined)} onOk={() => rejecting && void review(rejecting, 'rejected', comment)} okText="确认驳回"><Input.TextArea rows={4} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="请输入驳回原因" maxLength={500} showCount /></Modal></Layout>;
}
