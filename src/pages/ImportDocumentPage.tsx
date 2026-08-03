import { InboxOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Layout, Progress, Upload, message, Typography } from 'antd';
import type { UploadProps } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '@/services/document.service';
import { fileService } from '@/services/file.service';

async function moveRemoteImages(content: string) {
  const pattern = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  let result = content;
  for (const match of content.matchAll(pattern)) {
    try {
      const uploaded = await fileService.uploadFromUrl(match[2].replace(/^`|`$/g, ''));
      if (uploaded.fileUrl) result = result.replace(match[0], `![${match[1]}](${uploaded.fileUrl})`);
    } catch { /* Keep the original URL when the file service cannot reach it. */ }
  }
  return result.replace(/<!--[^>]*-->/g, '');
}

export default function ImportDocumentPage() {
  const navigate = useNavigate(); const [uploading, setUploading] = useState(false); const [progress, setProgress] = useState(0);
  const handleFile = async (file: File) => {
    if (!/\.(md|markdown)$/i.test(file.name)) { message.error('Only Markdown files are supported'); return false; }
    setUploading(true); setProgress(15);
    try {
      const content = await moveRemoteImages(await file.text()); setProgress(60);
      const id = await documentService.createDocument({ title: file.name.replace(/\.(md|markdown)$/i, ''), summary: '', content, status: 0 });
      setProgress(100); message.success('Document imported to drafts'); navigate(`/documents/${id}/edit`);
    } catch { message.error('Document import failed'); } finally { setUploading(false); }
    return false;
  };
  const props: UploadProps = { accept: '.md,.markdown', showUploadList: false, beforeUpload: (file) => void handleFile(file) };
  return <Layout className="workspace-layout"><header className="workspace-header"><Typography.Title level={4}>Knowledge Base</Typography.Title><Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/documents')}>Back</Button></header><main className="import-main"><div className="page-title-row"><div><Typography.Title level={3}>Import Markdown</Typography.Title><Typography.Text type="secondary">Import a Markdown document as a draft</Typography.Text></div></div><Card><Upload.Dragger {...props} disabled={uploading}><p className="ant-upload-drag-icon"><InboxOutlined /></p><p className="ant-upload-text">Click or drag a Markdown file here</p><p className="ant-upload-hint">Supports .md and .markdown. Remote images are copied to file storage.</p></Upload.Dragger>{uploading && <Progress percent={progress} status="active" />}</Card><Alert className="import-tips" showIcon type="info" message="Imported documents are saved as drafts and can be edited before publishing." /></main></Layout>;
}
