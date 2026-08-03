import { EditOutlined, LikeOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { Button, Divider, Layout, Space, Spin, Tag, Typography } from 'antd';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import { useDocumentStore } from '@/stores';
import { useFavoriteStore } from '@/stores';

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

  useEffect(() => {
    if (documentId) void fetchDocument(documentId, true);
  }, [documentId, fetchDocument]);

  useEffect(() => {
    if (documentId) void checkFavorite(documentId);
  }, [documentId, checkFavorite]);

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
    </Layout>
  );
}
