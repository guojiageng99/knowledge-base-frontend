import { ApartmentOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Empty, Input, Layout, Spin, Typography } from 'antd';
import * as echarts from 'echarts';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import graphService from '@/services/graph.service';
import type { GraphData, GraphNode } from '@/types';

export default function KnowledgeGraphPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<GraphData>();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false); const [unavailable, setUnavailable] = useState(false); const chartRef = useRef<HTMLDivElement>(null);
  const load = async (value = '') => { setLoading(true); setUnavailable(false); try { setData(value.trim() ? await graphService.search(value.trim()) : await graphService.getData()); } catch { setData(undefined); setUnavailable(true); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!chartRef.current || !data?.nodes.length) return;
    const chart = echarts.init(chartRef.current);
    chart.setOption({ tooltip: { formatter: (params: { data: GraphNode }) => `<strong>${params.data.name}</strong><br/>${params.data.type}` }, series: [{ type: 'graph', layout: 'force', roam: true, draggable: true, data: data.nodes.map((node) => ({ id: node.id, name: node.name, category: node.type, value: node.type, symbolSize: node.size ?? 24, itemStyle: { color: node.color } })), links: data.edges.map((edge) => ({ source: edge.source, target: edge.target, value: edge.label || edge.relation })), edgeSymbol: ['none', 'arrow'], edgeSymbolSize: 7, label: { show: true, position: 'right', formatter: '{b}' }, lineStyle: { color: '#9aa5b1', curveness: 0.12 }, force: { repulsion: 360, edgeLength: 100 } }] });
    const resize = () => chart.resize(); window.addEventListener('resize', resize); return () => { window.removeEventListener('resize', resize); chart.dispose(); };
  }, [data]);
  return <Layout className="workspace-layout"><header className="workspace-header"><Typography.Title level={4}>Knowledge Base</Typography.Title><Button onClick={() => navigate('/')}>Back to dashboard</Button></header><main className="workspace-main"><div className="page-title-row"><div><Typography.Title level={3}>Knowledge graph</Typography.Title><Typography.Text type="secondary">Explore documents, chunks, entities, and their relationships.</Typography.Text></div><Button icon={<ReloadOutlined />} onClick={() => void load(keyword)} /></div><section className="graph-toolbar"><Input value={keyword} onChange={(event) => setKeyword(event.target.value)} onPressEnter={() => void load(keyword)} placeholder="Search graph nodes" prefix={<SearchOutlined />} disabled={unavailable} /><Button type="primary" icon={<SearchOutlined />} onClick={() => void load(keyword)} disabled={unavailable}>Search</Button></section><Spin spinning={loading}>{unavailable ? <Alert type="warning" showIcon message="知识图谱服务暂不可用" description="请完成 Neo4j 与图谱服务部署后再使用。" action={<Button size="small" onClick={() => void load()}>Retry</Button>} /> : <><div className="graph-summary"><span><ApartmentOutlined /> {data?.nodeCount ?? 0} nodes</span><span>{data?.edgeCount ?? 0} relationships</span></div>{!loading && !data?.nodes.length ? <Empty description="No graph data" /> : <div ref={chartRef} className="graph-canvas" />}</>}</Spin></main></Layout>;
}
