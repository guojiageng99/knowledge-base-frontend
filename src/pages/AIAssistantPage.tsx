import { DeleteOutlined, PlusOutlined, SendOutlined, RobotOutlined, UserOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Layout, List, Select, Space, Switch, Tag, Tooltip, Typography, message } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useMemo, useState } from 'react';
import { useAIStore } from '@/stores';
import { aiService } from '@/services';
import type { AIMessage } from '@/types';

const { Sider, Content, Header } = Layout;

export default function AIAssistantPage() {
  const { conversations, currentConversation, availableModels, selectedModel, isLoading, isStreaming, currentResponse,
    fetchConversations, fetchModels, createConversation, selectConversation, deleteConversation, sendMessage, setSelectedModel, ragEnabled, toggleRag } = useAIStore();
  const [input, setInput] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState<string | number | null>(null);
  useEffect(() => { void fetchConversations(); void fetchModels(); }, [fetchConversations, fetchModels]);
  const messages = currentConversation?.messages ?? [];
  const quickQuestions = useMemo(() => ['如何创建一篇知识文档？', '知识库支持哪些功能？', '帮我总结一下知识库的使用流程'], []);

  const submit = async () => {
    const value = input.trim(); if (!value || isLoading) return;
    setInput('');
    try { await sendMessage(value); } catch (error) { message.error(error instanceof Error ? error.message : 'AI服务请求失败'); }
  };
  const feedback = async (item: AIMessage, type: 'like' | 'dislike') => {
    if (!currentConversation || String(item.id).startsWith('local-')) return;
    setSendingFeedback(item.id);
    try { await aiService.submitFeedback({ messageId: item.id, conversationId: currentConversation.id, type }); message.success('感谢反馈'); } finally { setSendingFeedback(null); }
  };
  return <Layout className="ai-layout">
    <Sider width={280} theme="light" className="ai-sidebar">
      <div className="ai-sidebar-header"><Typography.Title level={4}>AI助手</Typography.Title><Button type="primary" icon={<PlusOutlined />} onClick={() => void createConversation('新对话')}>新对话</Button></div>
      <List loading={isLoading && conversations.length === 0} dataSource={conversations} locale={{ emptyText: '暂无对话' }} renderItem={(item) => <List.Item className={`ai-conversation-item ${String(item.id) === String(currentConversation?.id) ? 'active' : ''}`} onClick={() => void selectConversation(item)}>
        <Typography.Text ellipsis>{item.title || '新对话'}</Typography.Text><Button type="text" danger icon={<DeleteOutlined />} onClick={(event) => { event.stopPropagation(); void deleteConversation(item.id); }} />
      </List.Item>} />
    </Sider>
    <Content className="ai-content">
      <Header className="ai-header"><Space><RobotOutlined /><Typography.Title level={4}>AI知识库助手</Typography.Title></Space><Space><Tooltip title={ragEnabled ? '关闭知识库搜索' : '开启知识库搜索'}><Switch checked={ragEnabled} onChange={toggleRag} checkedChildren="知识库" unCheckedChildren="通用" /></Tooltip><Select value={selectedModel} options={availableModels.map((m) => ({ value: m.key, label: m.displayName }))} onChange={setSelectedModel} placeholder="选择模型" /></Space></Header>
      <main className="ai-chat-shell">
        <div className="ai-messages">{messages.length === 0 && !isStreaming ? <Empty description={<Space direction="vertical"><span>你好，我是知识库AI助手</span><Space wrap>{quickQuestions.map((question) => <Button key={question} onClick={() => setInput(question)}>{question}</Button>)}</Space></Space>} /> : messages.map((item) => <MessageBubble key={String(item.id)} item={item} onFeedback={feedback} feedbackLoading={sendingFeedback === item.id} />)}{isStreaming && <MessageBubble item={{ id: 'streaming', role: 'assistant', content: currentResponse || '正在思考…' }} />}</div>
        <div className="ai-input-area"><Input.TextArea value={input} onChange={(e) => setInput(e.target.value)} onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); void submit(); } }} placeholder="输入你的问题，按 Enter 发送" autoSize={{ minRows: 2, maxRows: 6 }} disabled={isLoading} /><Button type="primary" icon={<SendOutlined />} onClick={() => void submit()} loading={isLoading}>发送</Button></div>
      </main>
    </Content>
  </Layout>;
}

function MessageBubble({ item, onFeedback, feedbackLoading }: { item: AIMessage; onFeedback?: (item: AIMessage, type: 'like' | 'dislike') => void; feedbackLoading?: boolean }) {
  const user = item.role === 'user';
  return <div className={`ai-message-row ${user ? 'user' : 'assistant'}`}><div className="ai-avatar">{user ? <UserOutlined /> : <RobotOutlined />}</div><div className="ai-message-body"><div className="ai-message-meta">{user ? '你' : 'AI助手'}{item.createTime || item.timestamp ? ` · ${new Date(item.createTime || item.timestamp!).toLocaleTimeString()}` : ''}</div><div className="ai-message-content">{user ? item.content : <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>}</div>{item.citations?.length ? <div className="ai-citations"><Typography.Text type="secondary">引用来源</Typography.Text><Space wrap>{item.citations.map((citation) => <Tooltip key={citation.index} title={citation.excerpt}><Tag color="blue">[{citation.index}] {citation.documentTitle}</Tag></Tooltip>)}</Space></div> : null}{!user && onFeedback && !String(item.id).startsWith('local-') && <Space className="ai-message-actions"><Button type="text" size="small" icon={<LikeOutlined />} loading={feedbackLoading} onClick={() => onFeedback(item, 'like')} /><Button type="text" size="small" icon={<DislikeOutlined />} loading={feedbackLoading} onClick={() => onFeedback(item, 'dislike')} /></Space>}</div></div>;
}
