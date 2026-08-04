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
  remark?: string;
  status?: number;
  lastLoginTime?: string;
  lastLoginIp?: string;
  createTime?: string;
  updateTime?: string;
  roles?: string[];
  permissions?: string[];
}

export interface SystemSettings {
  basic: Record<string, unknown>;
  security: Record<string, unknown>;
  storage: Record<string, unknown>;
  notification: Record<string, unknown>;
  ai: Record<string, unknown>;
  status: SystemStatus;
}

export interface SystemStatus {
  version: string;
  runStatus: 'running' | 'stopped' | 'maintenance';
  dbStatus: 'connected' | 'disconnected';
  lastBackupTime: string;
  totalStorage: number;
  usedStorage: number;
  documentCount: number;
  userCount: number;
  startTime: string;
}

export type PermissionType = 'menu' | 'button' | 'api';

export interface PermissionItem {
  id: number;
  name: string;
  code: string;
  type: PermissionType;
  parentId: number;
  menuUrl?: string;
  apiUrl?: string;
  method?: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
  status: number;
  children?: PermissionItem[];
  createTime?: string;
  updateTime?: string;
}

export interface SystemNotification {
  id: string;
  type: 'system' | 'comment' | 'mention' | 'review' | 'like';
  title: string;
  content: string;
  link?: string;
  relatedType?: string;
  relatedId?: number;
  read: boolean;
  createdAt: string;
}

export interface WsNotificationPayload {
  eventType?: string;
  notificationType: SystemNotification['type'];
  title: string;
  content: string;
  link?: string;
  documentId?: number | string;
  documentTitle?: string;
  timestamp?: string;
}

export interface UserStatistics {
  documentCount: number;
  likeCount: number;
  viewCount: number;
  commentCount: number;
}

export interface StatisticsOverview {
  totalDocuments: number; totalUsers: number; todayDocuments: number; todayUsers: number;
  totalViews: number; todayViews: number; totalLikes: number; totalFavorites: number;
  totalComments: number; pendingReviews: number; aiSearchCount: number; aiQaCount: number; activeUserCount: number;
}
export interface TrendDataPoint { date: string; count: number; }
export interface UserActivityItem { userId: number; username: string; documentCount: number; commentCount: number; viewCount: number; activityScore: number; }
export interface CategoryDistributionItem { categoryId: number; categoryName: string; documentCount: number; percentage: number; }
export interface HotDocumentItem { documentId: number; title: string; authorId: number; authorName: string; categoryId: number; categoryName: string; viewCount: number; likeCount: number; favoriteCount: number; commentCount: number; statisticsValue: number; }
export interface ActiveUserItem { userId: number; username: string; realName: string; avatar: string; documentCount: number; commentCount: number; viewCount: number; statisticsValue: number; }
export interface DashboardData { overview: StatisticsOverview; documentTrend: TrendDataPoint[]; categoryDistribution: CategoryDistributionItem[]; hotDocuments: HotDocumentItem[]; activeUsers: ActiveUserItem[]; }
export interface StatisticsQueryParams { startDate?: string; endDate?: string; trendType?: 'create' | 'view'; rankType?: 'view' | 'like' | 'favorite'; userRankType?: 'create' | 'comment' | 'view'; limit?: number; }

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

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  realName: string;
  phone?: string;
  teamId?: number;
}

export interface RegisterResponse {
  userId: number;
  emailVerificationRequired: boolean;
  message: string;
  loginInfo?: LoginResponse;
}

export interface SendResetCodeRequest { email: string; }
export interface VerifyResetCodeRequest { email: string; code: string; }
export interface ResetPasswordRequest extends VerifyResetCodeRequest { newPassword: string; }

export interface LoginUserInfo {
  userId: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string | null;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
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
  isLiked?: boolean;
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

export interface ReviewTask {
  id: string;
  documentId: string;
  documentTitle: string;
  documentAuthor: User;
  reviewerId: string;
  reviewer?: User;
  status: 'pending' | 'approved' | 'rejected';
  reviewRound: number;
  reviewLevel?: number;
  comment?: string;
  createdAt: string;
  reviewedAt?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface BatchExportRequest {
  documentIds: string[];
  format: 'pdf' | 'markdown';
}

export interface Comment {
  id: number;
  documentId: number;
  parentId: number;
  rootId: number;
  content: string;
  commenterId: number;
  commenterName?: string;
  commenterAvatar?: string;
  replyToUserId?: number;
  replyToUserName?: string;
  status: number;
  likeCount: number;
  replyCount: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface CommentCreateForm {
  documentId: number;
  content: string;
  parentId?: number;
  replyToUserId?: number;
}

export interface CommentQuery {
  current?: number;
  size?: number;
  sortBy?: 'created_at' | 'like_count';
  sortOrder?: 'asc' | 'desc';
}

export interface CommentPage {
  records: Comment[];
  total: number;
  current: number;
  size: number;
  pages?: number;
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

export interface WritingRequest {
  topic: string;
  requirements?: string;
  contentType?: 'article' | 'report' | 'documentation' | 'email' | 'announcement';
  style?: 'formal' | 'casual' | 'technical' | 'creative' | 'academic';
  tone?: 'neutral' | 'enthusiastic' | 'serious' | 'friendly' | 'authoritative';
  length?: number;
  existingContent?: string;
  actionType?: 'generate' | 'expand' | 'optimize' | 'continue';
  templateId?: string;
  model?: string;
}

export interface WritingResult { content: string; tokens?: number; wordCount?: number; model?: string; }
export interface WritingTemplate { id: string; name: string; description: string; category: string; prompt: string; suggestedContentType?: string; suggestedStyle?: string; }

export interface DocumentProcessResult {
  processType: string;
  originalContent?: string;
  processedContent: string;
  success: boolean;
  message: string;
  tokens?: number;
}

export interface Citation {
  index: number;
  documentId: number | string;
  documentTitle: string;
  excerpt: string;
  relevanceScore: number;
}

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  label?: string;
  color?: string;
  size?: number;
  properties?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  label?: string;
  weight?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeCount: number;
  edgeCount: number;
}

export interface SearchChunkResult {
  chunkId: string;
  content: string;
  heading?: string;
  score?: number;
  bm25Score?: number;
  vectorScore?: number;
}

export interface SearchResult {
  id: number;
  title: string;
  summary?: string;
  highlights?: string[];
  categoryName?: string;
  tags?: string;
  creatorName?: string;
  publishAt?: string;
  score?: number;
  chunks?: SearchChunkResult[];
}

export interface SearchHistory {
  id: number;
  keyword: string;
  searchCount: number;
  createTime?: string;
}

export interface FileMetadata {
  id: number;
  originalName: string;
  fileSize: number;
  fileSizeReadable?: string;
  fileType: string;
  mimeType: string;
  fileUrl?: string;
  previewUrl?: string;
  uploaderId?: number;
  uploaderName?: string;
  accessLevel?: number;
  downloadCount?: number;
  storageType?: string;
  createTime?: string;
  duration?: number;
  resolution?: string;
  bitrate?: number;
  transcodeStatus?: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';
  hlsPath?: string;
  thumbnailPath?: string;
}

export interface Team {
  id: number;
  teamName: string;
  teamCode: string;
  description?: string;
  leaderId?: number;
  leaderName?: string;
  parentId?: number;
  parentName?: string;
  level?: number;
  path?: string;
  memberCount: number;
  docCount?: number;
  status?: number;
  sort?: number;
  createTime?: string;
  updateTime?: string;
  children?: Team[];
}

export interface TeamMember {
  userId: number;
  username: string;
  realName?: string;
  avatar?: string;
  role: string;
  joinedAt?: string;
}
