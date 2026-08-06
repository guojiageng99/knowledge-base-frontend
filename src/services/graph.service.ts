import http from './request';
import type { GraphData, GraphEdge, GraphNode } from '@/types';

export const graphService = {
  getData: (type?: string): Promise<GraphData> => http.get('/graph/data', { params: { type }, silentError: true }),
  getNodes: (type?: string): Promise<GraphNode[]> => http.get('/graph/nodes', { params: { type }, silentError: true }),
  getEdges: (sourceType?: string, targetType?: string): Promise<GraphEdge[]> => http.get('/graph/edges', { params: { sourceType, targetType }, silentError: true }),
  search: (keyword: string): Promise<GraphData> => http.get('/graph/search', { params: { keyword }, silentError: true }),
  getNodeRelations: (nodeId: string): Promise<GraphEdge[]> => http.get(`/graph/node/${nodeId}/relations`, { silentError: true }),
};

export default graphService;
