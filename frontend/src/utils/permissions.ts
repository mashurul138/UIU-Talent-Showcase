import { User, UserRole, Post, ROLE_PERMISSIONS, normalizeRole } from '../types/auth';

export type { UserRole };

export const hasRole = (user: User | null, role: UserRole): boolean => {
  if (!user) return false;
  return normalizeRole(user.role) === role;
};

export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false;
  return roles.includes(normalizeRole(user.role));
};

export const hasMinimumRole = (user: User | null, role: UserRole): boolean => {
  if (!user) return false;
  const roleHierarchy: Record<UserRole, number> = {
    viewer: 1,
    creator: 2,
    admin: 3,
  };
  return roleHierarchy[normalizeRole(user.role)] >= roleHierarchy[role];
};

export const canUpload = (user: User | null): boolean => {
  if (!user) return false;
  return ROLE_PERMISSIONS[normalizeRole(user.role)].canUpload;
};

export const canEditPost = (user: User | null, post: Post): boolean => {
  if (!user) return false;
  const permissions = ROLE_PERMISSIONS[normalizeRole(user.role)];
  return permissions.canEditAny || (permissions.canEditOwn && post.authorId === user.id);
};

export const canDeletePost = (user: User | null, post: Post): boolean => {
  if (!user) return false;
  const permissions = ROLE_PERMISSIONS[normalizeRole(user.role)];
  return permissions.canDeleteAny || (permissions.canDeleteOwn && post.authorId === user.id);
};

export const canAccessGarbageBin = (user: User | null): boolean => {
  if (!user) return false;
  return ROLE_PERMISSIONS[normalizeRole(user.role)].canAccessGarbageBin;
};

export const canAccessAdminTools = (user: User | null): boolean => {
  if (!user) return false;
  return ROLE_PERMISSIONS[normalizeRole(user.role)].canAccessAdminTools;
};

export const canViewProfile = (user: User | null): boolean => {
  if (!user) return false;
  return ROLE_PERMISSIONS[normalizeRole(user.role)].canViewProfile;
};

export const getRoleLabel = (role: UserRole | string): string => {
  const labels: Record<UserRole, string> = {
    viewer: 'Viewer',
    creator: 'Creator',
    admin: 'Admin',
  };
  return labels[normalizeRole(role)];
};

export const getRoleBadgeVariant = (role: UserRole | string): 'default' | 'secondary' | 'destructive' => {
  const variants: Record<UserRole, 'default' | 'secondary' | 'destructive'> = {
    viewer: 'secondary',
    creator: 'default',
    admin: 'destructive',
  };
  return variants[normalizeRole(role)];
};

export const getRoleColor = (role: UserRole | string): string => {
  const colors: Record<UserRole, string> = {
    viewer: 'bg-gray-500',
    creator: 'bg-orange-500',
    admin: 'bg-red-500',
  };
  return colors[normalizeRole(role)];
};

export const getRoleTextColor = (role: UserRole | string): string => {
  const colors: Record<UserRole, string> = {
    viewer: 'text-gray-500',
    creator: 'text-orange-500',
    admin: 'text-red-500',
  };
  return colors[normalizeRole(role)];
};
