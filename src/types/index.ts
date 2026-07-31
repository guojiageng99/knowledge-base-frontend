export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface User {
  id?: number;
  userId?: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string | null;
  avatar?: string;
  realName?: string;
  department?: string;
  position?: string;
  status?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginUserInfo {
  userId: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string | null;
  avatar?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userInfo: LoginUserInfo;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number;
}

export interface DocumentAuthor {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  position?: string;
}

export interface KnowledgeDocument {
  id: number;
  title: string;
  summary?: string;
  content?: string;
  documentType: number;
  categoryId?: number;
  categoryName?: string;
  tags?: string;
  status: number;
  isTop: number;
  isRecommend: number;
  source: number;
  sourceUrl?: string;
  allowComment: number;
  sort: number;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  authorId?: number;
  authorName?: string;
  author?: DocumentAuthor;
  publishTime?: string;
  createTime: string;
  updateTime: string;
}

export interface DocumentFilter {
  current?: number;
  size?: number;
  categoryId?: number;
  keyword?: string;
  status?: number;
}

export interface DocumentForm {
  title: string;
  summary?: string;
  content?: string;
  documentType?: number;
  categoryId?: number;
  tags?: string;
  status?: number;
  isTop?: number;
  isRecommend?: number;
  source?: number;
  sourceUrl?: string;
  allowComment?: number;
  sort?: number;
}

export interface DocumentPage {
  records: KnowledgeDocument[];
  total: number;
  current: number;
  size: number;
  pages: number;
}
