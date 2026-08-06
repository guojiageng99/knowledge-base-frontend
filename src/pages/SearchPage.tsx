import { HistoryOutlined, RobotOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Empty, Input, List, Radio, Space, Spin, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '@/components/AppShell';
import searchService from '@/services/search.service';
import type { SearchHistory, SearchResult } from '@/types';

export default function SearchPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [mode, setMode] = useState<'keyword' | 'hybrid'>('keyword');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const loadHistory = async () => { try { setHistory(await searchService.history()); } catch { setHistory([]); setSearchError(true); } };
  useEffect(() => { void loadHistory(); }, []);
  const search = async (value = keyword) => { if (!value.trim()) return; setLoading(true); setSearchError(false); try { const page = await searchService.search({ keyword: value.trim(), searchMode: mode, size: 20, topK: 20, enableRerank: mode === 'hybrid' }); setResults(page.records ?? []); await loadHistory(); } catch { setSearchError(true); } finally { setLoading(false); } };
  return <AppShell index="04 / 检索" title="检索知识" description="按关键词查找已发布内容；需要语义理解时可切换到智能检索。">
    <section className="search-hero panel-surface"><div className="search-input-row"><Input size="large" value={keyword} onChange={(event) => setKeyword(event.target.value)} onPressEnter={() => void search()} prefix={<SearchOutlined />} placeholder="输入主题、标题或关键词" /><Button size="large" type="primary" icon={<SearchOutlined />} onClick={() => void search()}>开始检索</Button></div><div className="search-mode-row"><Typography.Text type="secondary">检索方式</Typography.Text><Radio.Group value={mode} onChange={(event) => setMode(event.target.value)}><Radio.Button value="keyword">关键词</Radio.Button><Radio.Button value="hybrid"><RobotOutlined /> 智能检索</Radio.Button></Radio.Group></div></section>
    <div className="search-layout"><section className="search-results">{searchError && <Alert className="page-alert" type="error" showIcon message="检索暂时不可用" description="请稍后再试，或切换为关键词检索。" action={<Button size="small" onClick={() => void search()}>重试</Button>} />}<Spin spinning={loading}>{!loading && results.length === 0 ? <div className="search-empty"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={keyword ? '没有找到匹配内容，换个词试试。' : '输入关键词，开始查找团队知识。'} /></div> : <List dataSource={results} renderItem={(item) => <List.Item><Card className="search-result-card" title={<Button type="link" onClick={() => navigate(`/documents/${item.id}`)}>{item.title}</Button>}><Typography.Paragraph ellipsis={{ rows: 3 }}>{item.summary || '暂无摘要'}</Typography.Paragraph><Space wrap>{item.categoryName && <Tag>{item.categoryName}</Tag>}{item.creatorName && <Tag>{item.creatorName}</Tag>}{item.score !== undefined && mode === 'hybrid' && <Tag color="green">匹配度 {item.score.toFixed(2)}</Tag>}</Space></Card></List.Item>} />}</Spin></section><aside className="search-history panel-surface"><Typography.Text strong><HistoryOutlined /> 最近检索</Typography.Text><List size="small" dataSource={history} locale={{ emptyText: '暂时没有检索记录' }} renderItem={(item) => <List.Item><Button type="link" onClick={() => { setKeyword(item.keyword); void search(item.keyword); }}>{item.keyword}</Button></List.Item>} /></aside></div>
  </AppShell>;
}
