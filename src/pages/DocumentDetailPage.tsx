import { CommentOutlined, CopyOutlined, DownloadOutlined, EditOutlined, HistoryOutlined, LikeFilled, LikeOutlined, ReloadOutlined, RobotOutlined, ShareAltOutlined, StarFilled, StarOutlined, StopOutlined } from '@ant-design/icons';
import { Button, DatePicker, Divider, Form, Input, Layout, List, Modal, Select, Space, Spin, Tag, Typography, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import { useDocumentStore } from '@/stores';
import { useFavoriteStore } from '@/stores';
import { documentService } from '@/services/document.service';
import { commentService } from '@/services/comment.service';
import aiService from '@/services/ai.service';
import versionService from '@/services/version.service';
import type { DocumentVersion } from '@/types';
import type { Comment, ShareForm, ShareVO } from '@/types';

function statusLabel(status: number) {
  if (status === 1) return 'Published';
  if (status === 2) return 'Archived';
  return 'Draft';
}

export default function DocumentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const documentId = id;
  const { currentDocument, isLoading, fetchDocument, likeDocument, updateFavoriteStatus } = useDocumentStore();
  const { toggleFavorite, checkFavorite, isFavorited } = useFavoriteStore();
  const favorite = currentDocument ? isFavorited(currentDocument.id) : false;
  const [shareVisible, setShareVisible] = useState(false);
  const [shares, setShares] = useState<ShareVO[]>([]);
  const [creatingShare, setCreatingShare] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [shareForm] = Form.useForm<ShareForm>();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [streamedSummary, setStreamedSummary] = useState('');
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [versionsVisible, setVersionsVisible] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareResult, setCompareResult] = useState<string>();
  const summaryAbortRef = useRef<AbortController | null>(null);
  const isSummarizingRef = useRef(false);

  useEffect(() => () => {
    summaryAbortRef.current?.abort();
    summaryAbortRef.current = null;
    isSummarizingRef.current = false;
  }, [documentId]);

  const handleGenerateSummary = async () => {
    const document = useDocumentStore.getState().currentDocument;
    if (!document || !documentId || isSummarizingRef.current) return;
    if (!document.content?.trim()) { message.warning('文档内容为空，无法生成摘要'); return; }
    isSummarizingRef.current = true;
    setIsSummarizing(true);
    setStreamedSummary('');
    setSummaryError(null);
    const controller = new AbortController();
    summaryAbortRef.current = controller;
    try {
      await aiService.generateDocSummaryStream({ content: document.content, title: document.title, length: 200 },
        (chunk) => setStreamedSummary((current) => current + chunk),
        async (result) => {
          const summary = result.processedContent || '';
          setStreamedSummary(summary);
          try {
            await documentService.updateSummary(documentId, summary);
            useDocumentStore.getState().setCurrentDocument({ ...document, summary });
            message.success('AI摘要已生成并保存');
          } catch { message.warning('摘要已生成，但保存失败'); }
        },
        (error) => setSummaryError(error),
        controller.signal);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setSummaryError(error instanceof Error ? error.message : '摘要生成失败');
    } finally {
      setIsSummarizing(false);
      isSummarizingRef.current = false;
      summaryAbortRef.current = null;
    }
  };

  const stopSummary = () => { summaryAbortRef.current?.abort(); setIsSummarizing(false); isSummarizingRef.current = false; };
  const copySummary = async () => { const summary = streamedSummary || currentDocument?.summary; if (!summary) return; await navigator.clipboard.writeText(summary); message.success('摘要已复制'); };

  useEffect(() => {
    if (documentId) void fetchDocument(documentId, true);
  }, [documentId, fetchDocument]);

  useEffect(() => {
    if (documentId) void checkFavorite(documentId);
  }, [documentId, checkFavorite]);

  const loadComments = async () => {
    if (!documentId) return;
    setCommentsLoading(true);
    try {
      const page = await commentService.getDocumentComments(documentId, { current: 1, size: 50 });
      setComments(page.records);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    void loadComments();
  }, [documentId]);

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

  const handleLike = async () => {
    if (!currentDocument) return;
    const wasLiked = currentDocument.isLiked ?? false;
    await likeDocument(currentDocument.id);
    message.success(wasLiked ? 'Like removed' : 'Document liked');
  };

  const handleFavorite = async () => {
    if (!currentDocument) return;
    const next = await toggleFavorite(currentDocument.id);
    updateFavoriteStatus(currentDocument.id, next);
    message.success(next ? 'Added to favorites' : 'Removed from favorites');
  };

  const submitComment = async () => {
    if (!currentDocument || !commentContent.trim()) return;
    setSubmittingComment(true);
    try {
      await commentService.createComment({ documentId: currentDocument.id, content: commentContent.trim() });
      setCommentContent('');
      await loadComments();
      await fetchDocument(currentDocument.id);
      message.success('Comment posted');
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleCommentLike = async (comment: Comment) => {
    const wasLiked = comment.isLiked;
    const delta = wasLiked ? -1 : 1;
    const updateComment = (isLiked: boolean, countDelta: number) => setComments((items) => items.map((item) => item.id === comment.id
      ? { ...item, isLiked, likeCount: Math.max(0, item.likeCount + countDelta) }
      : item));
    updateComment(!wasLiked, delta);
    try {
      if (wasLiked) await commentService.unlikeComment(comment.id);
      else await commentService.likeComment(comment.id);
    } catch (error) {
      updateComment(wasLiked, -delta);
      throw error;
    }
  };

  const openVersions = async () => {
    if (!documentId) return;
    setVersionsVisible(true);
    setVersionsLoading(true);
    try {
      const page = await versionService.page(documentId);
      setVersions(page.records ?? []);
    } finally {
      setVersionsLoading(false);
    }
  };

  const restoreVersion = (versionId: string) => {
    if (!documentId) return;
    Modal.confirm({
      title: '恢复这个正式版本吗？',
      content: '恢复后会把当前文档内容切换为该版本，并保留现有版本记录。',
      okText: '确认恢复',
      cancelText: '取消',
      onOk: async () => {
        await versionService.restore(documentId, versionId, '从文档详情页恢复');
        message.success('版本已恢复');
        setVersionsVisible(false);
        await fetchDocument(documentId, true);
      },
    });
  };

  const compareVersions = async () => {
    if (!documentId || compareIds.length !== 2) return;
    setCompareResult(await versionService.compare(documentId, compareIds[0], compareIds[1]));
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
            <Button icon={<HistoryOutlined />} onClick={() => void openVersions()}>版本历史</Button>
            <Button type="primary" icon={isSummarizing ? <StopOutlined /> : currentDocument.summary ? <ReloadOutlined /> : <RobotOutlined />} onClick={isSummarizing ? stopSummary : () => void handleGenerateSummary()}>{isSummarizing ? '停止摘要' : currentDocument.summary ? '重新生成摘要' : 'AI生成摘要'}</Button>
            <Button icon={<EditOutlined />} onClick={() => { const title = encodeURIComponent(currentDocument.title || ''); const content = encodeURIComponent((currentDocument.content || '').slice(0, 500)); navigate(`/ai-writing?title=${title}&content=${content}`); }}>AI写作</Button>
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
          {(streamedSummary || summaryError) && <section style={{ marginBottom: 16 }}><Space style={{ marginBottom: 8 }}><Typography.Title level={4} style={{ margin: 0 }}>AI摘要</Typography.Title><Button size="small" icon={<CopyOutlined />} onClick={() => void copySummary()}>复制</Button></Space>{summaryError && <Typography.Paragraph type="danger">{summaryError}</Typography.Paragraph>}{streamedSummary && <div className="document-summary markdown-content">{streamedSummary}</div>}</section>}
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentDocument.content || 'No document content'}
            </ReactMarkdown>
          </div>
          <Divider />
          <Button icon={currentDocument.isLiked ? <LikeFilled /> : <LikeOutlined />} type={currentDocument.isLiked ? 'primary' : 'default'} onClick={() => void handleLike()}>
            {currentDocument.isLiked ? 'Liked' : 'Like'} {currentDocument.likeCount}
          </Button>
          <Button
            icon={favorite ? <StarFilled /> : <StarOutlined />}
            type={favorite ? 'primary' : 'default'}
            onClick={() => void handleFavorite()}
          >
            {favorite ? '收藏中' : '收藏'} {currentDocument.favoriteCount}
          </Button>
          <Divider />
          {currentDocument.allowComment === 1 && <section>
            <Typography.Title level={4}><CommentOutlined /> Comments ({currentDocument.commentCount})</Typography.Title>
            <Input.TextArea value={commentContent} onChange={(event) => setCommentContent(event.target.value)} maxLength={1000} showCount rows={3} placeholder="Share your thoughts" />
            <Button type="primary" style={{ marginTop: 12 }} loading={submittingComment} onClick={() => void submitComment()}>Post comment</Button>
            <List
              loading={commentsLoading}
              dataSource={comments}
              locale={{ emptyText: 'No comments yet' }}
              renderItem={(comment) => <List.Item key={comment.id}>
                <List.Item.Meta
                  title={comment.commenterName || 'User'}
                  description={<><Typography.Paragraph style={{ marginBottom: 8 }}>{comment.content}</Typography.Paragraph><Space><Typography.Text type="secondary">{comment.createdAt}</Typography.Text><Button size="small" type="text" icon={comment.isLiked ? <LikeFilled /> : <LikeOutlined />} onClick={() => void toggleCommentLike(comment)}>{comment.likeCount}</Button></Space></>}
                />
              </List.Item>}
            />
          </section>}
        </article>
      </main>
      <Modal title="正式版本历史" open={versionsVisible} onCancel={() => setVersionsVisible(false)} footer={null} width={760} destroyOnClose>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Typography.Text type="secondary">选择两个版本后可对比：</Typography.Text>
            <Select mode="multiple" value={compareIds} onChange={setCompareIds} maxCount={2} style={{ minWidth: 320 }} placeholder="选择版本" options={versions.map((item) => ({ value: item.id, label: `v${item.version} ${item.createdAt || ''}` }))} />
            <Button disabled={compareIds.length !== 2} onClick={() => void compareVersions()}>对比</Button>
          </Space>
          {compareResult && <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', maxHeight: 220, overflow: 'auto' }}>{compareResult}</Typography.Paragraph>}
          <List loading={versionsLoading} dataSource={versions} locale={{ emptyText: '暂无正式版本记录' }} renderItem={(item) => <List.Item actions={[<Button key="restore" onClick={() => restoreVersion(item.id)}>恢复</Button>]}><List.Item.Meta title={`版本 v${item.version} ${item.title || ''}`} description={`${item.changeDescription || '未填写变更说明'} · ${item.operatorName || '系统用户'} · ${item.createdAt || ''}`} /></List.Item>} />
        </Space>
      </Modal>
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
