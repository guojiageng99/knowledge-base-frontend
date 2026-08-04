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
  lastLoginTime?: string;
  lastLoginIp?: string;
  createTime?: string;
  updateTime?: string;
}

export interface CategoryTree {
  id: number;
  parentId: number;
  name: string;
  code?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  status?: number;
  documentCount?: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  children?: CategoryTree[];
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
  contentLength?: number;
  wordCount?: number;
  documentType: number;
  categoryId?: number;
  categoryName?: string;
  tags?: string;
  status: number;
  isPublic?: number;
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
  isPublic?: number;
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

export interface UserFavorite {
  id: number;
  userId: number;
  documentId: number;
  documentTitle: string;
  documentSummary?: string;
  documentCategoryId?: number;
  documentCategoryName?: string;
  documentAuthorId?: number;
  documentAuthorName?: string;
  documentStatus?: number;
  documentViewCount?: number;
  favoriteTime: string;
  isFavorited?: boolean;
}

export interface DocumentAccess {
  id: number;
  userId: number;
  documentId: number;
  documentTitle: string;
  summary?: string;
  categoryName?: string;
  authorName?: string;
  accessTime: string;
  status: number;
}

export interface ShareVO {
  shareId: string;
  shareUrl: string;
  documentId: number;
  title: string;
  shareType: number;
  shareTypeDesc: string;
  expireType: number;
  expireTime?: string;
  expired: boolean;
  requirePassword: boolean;
  sharerName?: string;
  shareTime?: string;
  accessCount: number;
  accessLimit: number;
  description?: string;
}

export interface ShareForm {
  documentId: number;
  shareType?: number;
  expireType?: number;
  expireTime?: string;
  accessLimit?: number;
  requirePassword?: number;
  password?: string;
  description?: string;
}

export interface AIMessage {
  id: string | number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  createTime?: string;
  citations?: Citation[];
  fromKnowledgeBase?: boolean;
}

export interface AIConversation {
  id: string | number;
  title: string;
  messages?: AIMessage[];
  messageCount?: number;
  model?: string;
  status?: number;
  tokensUsed?: number;
  createTime?: string;
  updateTime?: string;
}

export interface AIRequest {
  question: string;
  conversationId?: string | number;
  model?: string;
  knowledgeBase?: boolean;
}

export interface AIModelOption {
  key: string;
  displayName: string;
  description: string;
  isDefault?: boolean;
}

export interface AIFeedback {
  messageId: string | number;
  conversationId: string | number;
  type: 'like' | 'dislike';
  comment?: string;
}

export interface Citation {
  index: number;
  documentId: number | string;
  documentTitle: string;
  excerpt: string;
  relevanceScore: number;
}
