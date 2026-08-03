import { ArrowLeftOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Layout, message, Select, Space, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { documentService } from '@/services/document.service';

const { TextArea } = Input;

export default function DocumentEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || 'documents';
  const documentId = id ? Number(id) : undefined;
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState<number>();
  const [isPublic, setIsPublic] = useState(1);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!documentId) return;
    setLoading(true);
    void Promise.all([documentService.getDocument(documentId), documentService.getDocumentContent(documentId)])
      .then(([document, documentContent]) => {
        setTitle(document.title || '');
        setSummary(document.summary || '');
        setCategoryId(document.categoryId);
        setIsPublic(document.isPublic ?? 1);
        setContent(documentContent || document.content || '');
      })
      .catch(() => message.error('加载文档失败'))
      .finally(() => setLoading(false));
  }, [documentId]);

  const save = async (status: 0 | 1) => {
    if (!title.trim()) {
      message.error('请输入文档标题');
      return;
    }
    setSaving(true);
    try {
      const metadata = { title: title.trim(), summary, categoryId, status, isPublic, documentType: 1, source: 1, allowComment: 1 };
      if (documentId) {
        await documentService.updateDocument(documentId, metadata);
        await documentService.saveDocumentContent(documentId, content);
      } else {
        const newId = await documentService.createDocument({ ...metadata, content: '' });
        await documentService.saveDocumentContent(newId, content);
      }
      message.success(status === 0 ? '草稿已保存' : '文档已发布');
      navigate(from === 'drafts' ? '/drafts' : '/documents');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout className="workspace-layout">
      <header className="workspace-header">
        <Typography.Title level={4}>知识库</Typography.Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(from === 'drafts' ? '/drafts' : '/documents')}>返回</Button>
      </header>
      <main className="editor-main">
        <div className="page-title-row">
          <div>
            <Typography.Title level={3}>{documentId ? '编辑文档' : '创建文档'}</Typography.Title>
            <Typography.Text type="secondary">正文存储在 MongoDB，文档元数据存储在 MySQL。</Typography.Text>
          </div>
          <Space>
            <Button onClick={() => void save(0)} icon={<SaveOutlined />} loading={saving}>保存草稿</Button>
            <Button type="primary" onClick={() => void save(1)} icon={<SendOutlined />} loading={saving}>发布</Button>
          </Space>
        </div>
        <Spin spinning={loading || saving}>
          <section className="document-editor-shell">
            <div className="document-editor-pane">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="输入文档标题" size="large" />
              <TextArea value={content} onChange={(event) => setContent(event.target.value)} className="document-content-input" placeholder="输入 Markdown 内容" />
            </div>
            <div className="document-preview-pane">
              <Typography.Text strong>实时预览</Typography.Text>
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return match ? (
                        <SyntaxHighlighter style={oneLight} language={match[1]} PreTag="div">
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : <code className={className}>{children}</code>;
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
            <aside className="document-editor-settings">
              <Typography.Text strong>文档设置</Typography.Text>
              <Typography.Text>文档描述</Typography.Text>
              <TextArea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} placeholder="简要描述文档内容" />
              <Typography.Text>分类</Typography.Text>
              <Input type="number" value={categoryId} onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : undefined)} placeholder="分类 ID" />
              <Typography.Text>可见性</Typography.Text>
              <Select value={isPublic} onChange={setIsPublic} options={[{ value: 0, label: '私有' }, { value: 1, label: '团队可见' }, { value: 2, label: '公开' }]} />
            </aside>
          </section>
        </Spin>
      </main>
    </Layout>
  );
}
