import { DownloadOutlined, EditOutlined, LikeOutlined, ShareAltOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { Button, DatePicker, Divider, Form, Input, Layout, Modal, Select, Space, Spin, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import { useDocumentStore } from '@/stores';
import { useFavoriteStore } from '@/stores';
import { documentService } from '@/services/document.service';
import type { ShareForm, ShareVO } from '@/types';

function statusLabel(status: number) {
  if (status === 1) return 'Published';
  if (status === 2) return 'Archived';
  return 'Draft';
}

export default function DocumentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const documentId = Number(id);
  const { currentDocument, isLoading, fetchDocument, likeDocument } = useDocumentStore();
  const { toggleFavorite, checkFavorite, isFavorited } = useFavoriteStore();
  const favorite = currentDocument ? isFavorited(currentDocument.id) : false;
  const [shareVisible, setShareVisible] = useState(false);
  const [shares, setShares] = useState<ShareVO[]>([]);
  const [creatingShare, setCreatingShare] = useState(false);
  const [shareForm] = Form.useForm<ShareForm>();

  useEffect(() => {
    if (documentId) void fetchDocument(documentId, true);
  }, [documentId, fetchDocument]);

  useEffect(() => {
    if (documentId) void checkFavorite(documentId);
  }, [documentId, checkFavorite]);

  const openShare = async () => {
    if (!currentDocument) return;
    setShareVisible(true);
    setShares(await documentService.getDocumentShares(currentDocument.id));
  };

  const createShare = async (values: ShareForm) => {
    if (!currentDocument) return;
    setCreatingShare(true);
    try {
      const expireTime = values.expireTime
        ? (values.expireTime as unknown as { format: (pattern: string) => string }).format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      const data = { ...values, expireTime, documentId: currentDocument.id };
      const created = await documentService.createShare(data);
      setShares((current) => [created, ...current]);
      shareForm.resetFields();
      message.success('Share link created');
    } finally {
      setCreatingShare(false);
    }
  };

  const downloadPdf = async () => {
    if (!currentDocument) return;
    const blob = await documentService.downloadDocumentPdf(currentDocument.id);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${currentDocument.title}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !currentDocument) return <div className="page-spinner"><Spin /></div>;

  return (
    <Layout className="workspace-layout">
      <header className="workspace-header">
        <Typography.Title level={4}>Knowledge Base</Typography.Title>
        <Button onClick={() => navigate('/documents')}>Back to documents</Button>
      </header>
      <main className="detail-main">
        <article className="document-article">
          <div className="article-actions">
            <Button icon={<EditOutlined />} onClick={() => navigate(`/documents/${currentDocument.id}/edit`)}>
              Edit
            </Button>
            <Button icon={<DownloadOutlined />} onClick={() => void downloadPdf()}>Download PDF</Button>
            <Button icon={<ShareAltOutlined />} onClick={() => void openShare()}>Share</Button>
          </div>
          <Typography.Title>{currentDocument.title}</Typography.Title>
          <Space wrap>
            <Tag>{statusLabel(currentDocument.status)}</Tag>
            <Typography.Text type="secondary">
              {currentDocument.authorName || currentDocument.author?.username || 'System user'}
            </Typography.Text>
            <Typography.Text type="secondary">Views {currentDocument.viewCount}</Typography.Text>
          </Space>
          <Divider />
          {currentDocument.summary && (
            <Typography.Paragraph type="secondary" className="document-summary">
              {currentDocument.summary}
            </Typography.Paragraph>
          )}
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentDocument.content || 'No document content'}
            </ReactMarkdown>
          </div>
          <Divider />
          <Button icon={<LikeOutlined />} onClick={() => void likeDocument(currentDocument.id)}>
            Like {currentDocument.likeCount}
          </Button>
          <Button
            icon={favorite ? <StarFilled /> : <StarOutlined />}
            type={favorite ? 'primary' : 'default'}
            onClick={() => void toggleFavorite(currentDocument.id)}
          >
            {favorite ? '收藏中' : '收藏'} {currentDocument.favoriteCount}
          </Button>
        </article>
      </main>
      <Modal title="Share document" open={shareVisible} onCancel={() => setShareVisible(false)} footer={null} width={640} destroyOnClose>
        <Form form={shareForm} layout="vertical" onFinish={(values) => void createShare(values)} initialValues={{ shareType: 1, expireType: 1, accessLimit: 0, requirePassword: 0 }}>
          <Form.Item name="shareType" label="Share type"><Select options={[{ value: 1, label: 'Public link' }, { value: 2, label: 'Private share' }]} /></Form.Item>
          <Form.Item name="expireType" label="Expiration"><Select options={[{ value: 1, label: 'Never expires' }, { value: 2, label: 'Custom time' }]} /></Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, next) => prev.expireType !== next.expireType}>
            {({ getFieldValue }) => getFieldValue('expireType') === 2 ? <Form.Item name="expireTime" label="Expires at" getValueProps={(value) => ({ value })}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item> : null}
          </Form.Item>
          <Form.Item name="accessLimit" label="Access limit"><Select options={[{ value: 0, label: 'Unlimited' }, { value: 10, label: '10 times' }, { value: 50, label: '50 times' }, { value: 100, label: '100 times' }]} /></Form.Item>
          <Form.Item name="requirePassword" label="Password protection"><Select options={[{ value: 0, label: 'No password' }, { value: 1, label: 'Require password' }]} /></Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, next) => prev.requirePassword !== next.requirePassword}>
            {({ getFieldValue }) => getFieldValue('requirePassword') === 1 ? <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item> : null}
          </Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea maxLength={200} showCount /></Form.Item>
          <Button type="primary" htmlType="submit" loading={creatingShare}>Create share link</Button>
        </Form>
        <Divider />
        <Typography.Title level={5}>Existing links</Typography.Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          {shares.map((share) => <Space key={share.shareId} style={{ justifyContent: 'space-between', width: '100%' }}>
            <span>{share.shareTypeDesc} {share.requirePassword ? '(password)' : ''} {share.accessCount}/{share.accessLimit || 'unlimited'}</span>
            <Button onClick={() => void navigator.clipboard.writeText(`${window.location.origin}/share/${share.shareId}`)}>Copy link</Button>
            <Button danger onClick={() => void documentService.deleteShare(share.shareId).then(() => setShares((current) => current.filter((item) => item.shareId !== share.shareId)))}>Delete</Button>
          </Space>)}
        </Space>
      </Modal>
    </Layout>
  );
}
