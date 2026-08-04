import http from './request';
import type { Team, TeamMember } from '@/types';

export interface TeamPageResult {
  records: Team[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

export const teamService = {
  getTeams: (data: { current?: number; size?: number; teamName?: string; status?: number } = {}): Promise<TeamPageResult> => http.post('/auth/teams/page', data),
  getTeamTree: (): Promise<Team[]> => http.get('/auth/teams/tree'),
  getTeam: (teamId: number): Promise<Team> => http.get(`/auth/teams/${teamId}`),
  createTeam: (data: Pick<Team, 'teamName' | 'teamCode' | 'leaderId'> & { description?: string; parentId?: number }): Promise<number> => http.post('/auth/teams', data),
  updateTeam: (data: Partial<Team> & { id: number }): Promise<boolean> => http.put('/auth/teams', data),
  deleteTeam: (teamId: number): Promise<boolean> => http.delete(`/auth/teams/${teamId}`),
  addMembers: (teamId: number, userIds: number[]): Promise<boolean> => http.post(`/auth/teams/${teamId}/members`, userIds),
  removeMembers: (teamId: number, userIds: number[]): Promise<boolean> => http.delete(`/auth/teams/${teamId}/members`, { data: userIds }),
  getTeamMembers: (teamId: number): Promise<TeamMember[]> => http.get(`/auth/teams/${teamId}/members`),
};

export default teamService;
