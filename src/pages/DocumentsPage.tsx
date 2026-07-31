import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Layout, message, Popconfirm, Select, Space, Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '@/stores';
import type { KnowledgeDocument } from '@/types';

const statusOptions = [
  { value: 0, label: '草稿', color: 'default' },
  { value: 1, label: '已发布', color: 'green' },
  { value: 2, label: '已归档', color: 'gold' },
];

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { documents, isLoading, total, current, size, filter, fetchDocuments, deleteDocument } = useDocumentStore();
  const [keyword, setKeyword] = useState(filter.keyword ?? '');

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const reload = (params = {}) => void fetchDocuments(params);
  const reset = () => {
    setKeyword('');
    reload({ current: 1, keyword: undefined, status: undefined });
  };

  const columns: ColumnsType<KnowledgeDocument> = [
    {
      title: '标题', dataIndex: 'title', key: 'title', ellipsis: true,
      render: (title, document) => <Button type="link" onClick={() => navigate(`/documents/${document.id}`)}>{title}</Button>,
    },
    { title: '分类', dataIndex: 'categoryName', key: 'category', width: 130, render: (value, document) => value || document.categoryId || '-' },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status: number) => {
        const option = statusOptions.find((item) => item.value === status);
        return <Tag color={option?.color}>{option?.label ?? '未知'}</Tag>;
      },
    },
    { title: '作者', dataIndex: 'authorName', key: 'author', width: 130, render: (value, document) => value || document.author?.username || '-' },
    { title: '浏览', dataIndex: 'viewCount', key: 'viewCount', width: 80 },
    { title: '点赞', dataIndex: 'likeCount', key: 'likeCount', width: 80 },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 170, render: (value) => value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-' },
    {
      title: '操作', key: 'actions', width: 140,
      render: (_, document) => <Space size={0}>
        <Tooltip title="查看"><Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/documents/${document.id}`)} /></Tooltip>
        <Tooltip title="编辑"><Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/documents/${document.id}/edit`)} /></Tooltip>
        <Popconfirm title="确定删除该文档？" onConfirm={async () => {
          await deleteDocument(document.id);
          message.success('文档已删除');
          reload();
        }}>
          <Tooltip title="删除"><Button type="text" danger icon={<DeleteOutlined />} /></Tooltip>
        </Popconfirm>
      </Space>,
    },
  ];

  return <Layout className="workspace-layout">
    <header className="workspace-header"><Typography.Title level={4}>知识库</Typography.Title><Button onClick={() => navigate('/')}>返回工作台</Button></header>
    <main className="workspace-main">
      <div className="page-title-row"><div><Typography.Title level={3}>文档</Typography.Title><Typography.Text type="secondary">查询、创建和管理知识文档</Typography.Text></div><Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/documents/create')}>新建文档</Button></div>
      <section className="table-toolbar">
        <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} onPressEnter={() => reload({ keyword, current: 1 })} placeholder="搜索标题、摘要或标签" prefix={<SearchOutlined />} allowClear />
        <Select value={filter.status} onChange={(status) => reload({ status, current: 1 })} options={statusOptions} placeholder="全部状态" allowClear />
        <Button type="primary" icon={<SearchOutlined />} onClick={() => reload({ keyword, current: 1 })}>搜索</Button>
        <Button icon={<ReloadOutlined />} onClick={reset} aria-label="重置筛选" />
      </section>
      <Table className="documents-table" columns={columns} dataSource={documents} rowKey="id" loading={isLoading} scroll={{ x: 900 }} pagination={{
        current, pageSize: size, total, showSizeChanger: true, showQuickJumper: true, showTotal: (count) => `共 ${count} 条`,
        onChange: (nextCurrent, nextSize) => reload({ current: nextCurrent, size: nextSize }),
      }} />
    </main>
  </Layout>;
}
