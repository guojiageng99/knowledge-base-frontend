import { ClearOutlined, DownloadOutlined, FileMarkdownOutlined, FilePdfOutlined, FileTextOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Input, Radio, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useDocumentStore } from '@/stores';
import { documentService } from '@/services/document.service';
import type { KnowledgeDocument } from '@/types';

const statusLabels: Record<number, { label: string; color: string }> = {
  0: { label: 'Draft', color: 'default' },
  1: { label: 'Published', color: 'green' },
  2: { label: 'Archived', color: 'orange' },
};

function fileNameFromHeader(header?: string) {
  const match = header?.match(/filename\*=UTF-8''([^"';]+)/i);
  return match ? decodeURIComponent(match[1]) : `documents_export_${dayjs().format('YYYYMMDDHHmmss')}.zip`;
}

export default function ExportDataPage() {
  const { documents, isLoading, total, current, size, fetchDocuments } = useDocumentStore();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<number | undefined>();
  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);
  const [format, setFormat] = useState<'pdf' | 'markdown'>('pdf');
  const [exporting, setExporting] = useState(false);

  const load = (params: Record<string, unknown> = {}) => fetchDocuments({
    current: 1,
    size,
    keyword: keyword || undefined,
    status,
    ...params,
  });

  useEffect(() => {
    void load();
  }, []);

  const exportSelected = async () => {
    if (selectedIds.length === 0) return;
    setExporting(true);
    try {
      const response = await documentService.batchExportDocuments({ documentIds: selectedIds.map(String), format });
      const blob = response.data;
      if (blob.type.includes('application/json')) {
        const body = JSON.parse(await blob.text()) as { message?: string };
        throw new Error(body.message || 'Export failed');
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileNameFromHeader(response.headers['content-disposition']);
      anchor.click();
      URL.revokeObjectURL(url);
      message.success(`Exported ${selectedIds.length} documents`);
    } finally {
      setExporting(false);
    }
  };

  const columns: ColumnsType<KnowledgeDocument> = [
    { title: 'Title', dataIndex: 'title', ellipsis: true, render: (title: string) => <Space><FileTextOutlined />{title}</Space> },
    { title: 'Author', dataIndex: 'authorName', width: 140, render: (value: string | undefined) => value || '-' },
    { title: 'Status', dataIndex: 'status', width: 120, render: (value: number) => <Tag color={statusLabels[value]?.color}>{statusLabels[value]?.label ?? 'Unknown'}</Tag> },
    { title: 'Updated', dataIndex: 'updateTime', width: 180, render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-' },
  ];

  return <main className="workspace-main">
    <div className="page-title-row"><div><Typography.Title level={3}>Export data</Typography.Title><Typography.Text type="secondary">Select documents and download a PDF or Markdown ZIP archive.</Typography.Text></div></div>
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space wrap>
        <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} onPressEnter={() => void load()} allowClear prefix={<SearchOutlined />} placeholder="Search documents" style={{ width: 260 }} />
        <Select value={status} onChange={setStatus} allowClear placeholder="All statuses" style={{ width: 160 }} options={[{ value: 0, label: 'Draft' }, { value: 1, label: 'Published' }, { value: 2, label: 'Archived' }]} />
        <Button type="primary" icon={<SearchOutlined />} onClick={() => void load()}>Search</Button>
        <Button icon={<ReloadOutlined />} onClick={() => void load()}>Refresh</Button>
        {selectedIds.length > 0 && <Button icon={<ClearOutlined />} onClick={() => setSelectedIds([])}>Clear selection</Button>}
      </Space>
    </Card>
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space><Typography.Text strong>Export format</Typography.Text><Radio.Group value={format} onChange={(event) => setFormat(event.target.value)}><Radio.Button value="pdf"><FilePdfOutlined /> PDF</Radio.Button><Radio.Button value="markdown"><FileMarkdownOutlined /> Markdown</Radio.Button></Radio.Group></Space>
        <Button type="primary" icon={<DownloadOutlined />} disabled={selectedIds.length === 0} loading={exporting} onClick={() => void exportSelected()}>Export selected ({selectedIds.length})</Button>
      </Space>
      {selectedIds.length > 0 && <Alert type="info" showIcon style={{ marginTop: 12 }} message={`The selected ${selectedIds.length} documents will be exported as a ${format.toUpperCase()} ZIP archive.`} />}
    </Card>
    <Card size="small"><Table rowKey="id" columns={columns} dataSource={documents} loading={isLoading} rowSelection={{ selectedRowKeys: selectedIds, onChange: setSelectedIds }} pagination={{ current, pageSize: size, total, showSizeChanger: true, onChange: (nextCurrent, nextSize) => void load({ current: nextCurrent, size: nextSize }) }} scroll={{ x: 720 }} /></Card>
  </main>;
}
