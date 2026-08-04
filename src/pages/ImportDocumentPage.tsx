import { InboxOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Layout, List, Progress, Tag, Upload, message, Typography } from 'antd';
import type { UploadProps } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '@/services/document.service';
import { useAppStore } from '@/stores';
import './ImportDocumentPage.css';

async function moveRemoteImages(content: string) {
  const pattern = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  let result = content;
  for (const match of content.matchAll(pattern)) {
    try {
      const uploadedUrl = await documentService.uploadImageFromUrl(match[2].replace(/^`|`$/g, ''));
      if (uploadedUrl) result = result.replace(match[0], `![${match[1]}](${uploadedUrl})`);
    } catch { /* Keep the original URL when the file service cannot reach it. */ }
  }
  return result.replace(/<!--[^>]*-->/g, '');
}

export default function ImportDocumentPage() {
  const navigate = useNavigate();
  const maxFileSize = useAppStore((state) => state.maxFileSize);
  const allowedFileTypes = useAppStore((state) => state.allowedFileTypes).split(',').map((type) => type.trim().toLowerCase());
  const supportedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'];
  const [uploading, setUploading] = useState(false); const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Array<{ fileName: string; success: boolean; documentId?: number; error?: string }>>([]);
  const handleFiles = async (files: File[]) => {
    setUploading(true); setProgress(0);
    const nextResults: Array<{ fileName: string; success: boolean; documentId?: number; error?: string }> = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]; const extension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!supportedTypes.includes(extension) || !allowedFileTypes.includes(extension)) nextResults.push({ fileName: file.name, success: false, error: `Unsupported file type: .${extension}` });
      else if (file.size > maxFileSize) nextResults.push({ fileName: file.name, success: false, error: `File exceeds ${Math.round(maxFileSize / 1048576)} MB` });
      else {
        try {
          const result = extension === 'md' ? await importMarkdown(file) : await documentService.uploadAndParseDocument(file);
          nextResults.push({ fileName: file.name, success: true, documentId: result.documentId });
        } catch { nextResults.push({ fileName: file.name, success: false, error: 'Document import failed' }); }
      }
      setProgress(Math.round(((index + 1) / files.length) * 100));
      setResults([...nextResults]);
    }
    setUploading(false);
    if (nextResults.some((result) => result.success)) message.success('Import completed');
  };
  const importMarkdown = async (file: File) => {
    const content = await moveRemoteImages(await file.text());
    const documentId = await documentService.createDocument({ title: file.name.replace(/\.(md|markdown)$/i, ''), summary: '', content, status: 0 });
    return { documentId };
  };
  const props: UploadProps = { accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md', multiple: true, showUploadList: false, beforeUpload: (file, files) => { if (file !== files[files.length - 1]) return false; void handleFiles(files as File[]); return false; } };
  return <Layout className="workspace-layout"><header className="workspace-header"><Typography.Title level={4}>Knowledge Base</Typography.Title><Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/documents')}>Back</Button></header><main className="import-main"><div className="page-title-row"><div><Typography.Title level={3}>Import documents</Typography.Title><Typography.Text type="secondary">Parse office, PDF, text, and Markdown files into draft documents.</Typography.Text></div></div><Card><Upload.Dragger {...props} disabled={uploading}><p className="ant-upload-drag-icon"><InboxOutlined /></p><p className="ant-upload-text">Click or drag files here</p><p className="ant-upload-hint">PDF, Word, Excel, PowerPoint, TXT, and Markdown. Maximum {Math.round(maxFileSize / 1048576)} MB per file.</p></Upload.Dragger>{uploading && <Progress percent={progress} status="active" />}{results.length > 0 && <List className="import-results" dataSource={results} renderItem={(result) => <List.Item actions={result.documentId ? [<Button type="link" onClick={() => navigate(`/documents/${result.documentId}/edit`)}>Edit</Button>] : []}><List.Item.Meta title={result.fileName} description={result.error || 'Draft created'} /><Tag color={result.success ? 'green' : 'red'}>{result.success ? 'Imported' : 'Failed'}</Tag></List.Item>} />}</Card><Alert className="import-tips" showIcon type="info" message="Imported documents are saved as drafts and can be edited before publishing." /></main></Layout>;
}
