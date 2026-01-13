export type UserRole = 'viewer' | 'creator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  joinDate?: string;
}

export interface StoredUser extends User {
  password?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string, role: UserRole, studentId?: string) => void;
  socialLogin: (provider: 'google' | 'facebook') => Promise<void>;
  logout: () => void;
}

export interface Post {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  type: 'video' | 'audio' | 'blog';
  thumbnail?: string;
  rating: number;
  views: number;
  uploadDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  link?: string;
  duration?: string;
  isDeleted?: boolean;
}

export interface DeletedPost extends Post {
  reason: string;
  deletedDate: Date;
}

export const ROLE_PERMISSIONS = {
  viewer: {
    canViewContent: true,
    canUpload: false,
    canEditOwn: false,
    canDeleteOwn: false,
    canEditAny: false,
    canDeleteAny: false,
    canAccessGarbageBin: false,
    canAccessAdminTools: false,
    canViewProfile: true,
  },
  creator: {
    canViewContent: true,
    canUpload: true,
    canEditOwn: true,
    canDeleteOwn: true,
    canEditAny: false,
    canDeleteAny: false,
    canAccessGarbageBin: false,
    canAccessAdminTools: false,
    canViewProfile: true,
  },
  admin: {
    canViewContent: true,
    canUpload: true,
    canEditOwn: true,
    canDeleteOwn: true,
    canEditAny: true,
    canDeleteAny: true,
    canAccessGarbageBin: true,
    canAccessAdminTools: true,
    canViewProfile: true,
  },
} as const;

export const MOCK_USERS = {
  viewer: {
    id: 'viewer-1',
    name: 'Viewer User',
    email: 'viewer@uiu.ac.bd',
    password: 'viewer123',
    role: 'viewer' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    studentId: 'VUIU001',
    joinDate: 'January 2024',
  },
  creator: {
    id: 'creator-1',
    name: 'Rafiur Rahman',
    email: 'rafiur.rahman@uiu.ac.bd',
    password: 'creator123',
    role: 'creator' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    studentId: '011231089',
    joinDate: 'January 2024',
  },
  admin: {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@uiu.ac.bd',
    password: 'admin123',
    role: 'admin' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    studentId: 'AUIU001',
    joinDate: 'January 2024',
  },
} as const;
