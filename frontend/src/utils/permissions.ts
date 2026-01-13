import { User, UserRole, Post, ROLE_PERMISSIONS } from '../types/auth';

export type { UserRole };

export const hasRole = (user: User | null, role: UserRole): boolean => {
  return user?.role === role;
};

export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  return user ? roles.includes(user.role) : false;
};

export const hasMinimumRole = (user: User | null, role: UserRole): boolean => {
  if (!user) return false;
  const roleHierarchy: Record<UserRole, number> = {
    viewer: 1,
    creator: 2,
    admin: 3,
  };
  return roleHierarchy[user.role] >= roleHierarchy[role];
};

export const canUpload = (user: User | null): boolean => {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].canUpload;
};

export const canEditPost = (user: User | null, post: Post): boolean => {
  if (!user) return false;
  const permissions = ROLE_PERMISSIONS[user.role];
  return permissions.canEditAny || (permissions.canEditOwn && post.authorId === user.id);
};

export const canDeletePost = (user: User | null, post: Post): boolean => {
  if (!user) return false;
  const permissions = ROLE_PERMISSIONS[user.role];
  return permissions.canDeleteAny || (permissions.canDeleteOwn && post.authorId === user.id);
};

export const canAccessGarbageBin = (user: User | null): boolean => {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].canAccessGarbageBin;
};

export const canAccessAdminTools = (user: User | null): boolean => {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].canAccessAdminTools;
};

export const canViewProfile = (user: User | null): boolean => {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].canViewProfile;
};

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    viewer: 'Viewer',
    creator: 'Creator',
    admin: 'Admin',
  };
  return labels[role];
};

export const getRoleBadgeVariant = (role: UserRole): 'default' | 'secondary' | 'destructive' => {
  const variants: Record<UserRole, 'default' | 'secondary' | 'destructive'> = {
    viewer: 'secondary',
    creator: 'default',
    admin: 'destructive',
  };
  return variants[role];
};

export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    viewer: 'bg-gray-500',
    creator: 'bg-orange-500',
    admin: 'bg-red-500',
  };
  return colors[role];
};

export const getRoleTextColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    viewer: 'text-gray-500',
    creator: 'text-orange-500',
    admin: 'text-red-500',
  };
  return colors[role];
};
