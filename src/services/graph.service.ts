import http from './request';
import type { GraphData, GraphEdge, GraphNode } from '@/types';

export const graphService = {
  getData: (type?: string): Promise<GraphData> => http.get('/graph/data', { params: { type } }),
  getNodes: (type?: string): Promise<GraphNode[]> => http.get('/graph/nodes', { params: { type } }),
  getEdges: (sourceType?: string, targetType?: string): Promise<GraphEdge[]> => http.get('/graph/edges', { params: { sourceType, targetType } }),
  search: (keyword: string): Promise<GraphData> => http.get('/graph/search', { params: { keyword } }),
  getNodeRelations: (nodeId: string): Promise<GraphEdge[]> => http.get(`/graph/node/${nodeId}/relations`),
};

export default graphService;
