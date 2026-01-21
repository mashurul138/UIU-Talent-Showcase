import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, Video, Mic, BookOpen, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from './auth/RoleBadge';
import { api } from '../services/api';
import { normalizeRole } from '../types/auth';

interface ProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    studentId?: string | null;
    avatar?: string | null;
    joinDate?: string | null;
  };
  stats: {
    totalScore: number;
    avgRating: number;
    videoSubmissions: number;
    audioSubmissions: number;
    blogSubmissions: number;
    totalPosts: number;
    totalVotes: number;
    totalViews: number;
  };
  recentActivity?: Array<{
    id: string;
    title: string;
    type: 'video' | 'audio' | 'blog';
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    views: number;
    votes: number;
  }>;
}

type RecentActivityItem = NonNullable<ProfileResponse['recentActivity']>[number];

export function Profile() {
  const { user, updateUser } = useAuth();
  const emptyEditForm = {
    name: '',
    email: '',
    studentId: '',
    avatar: '',
    password: '',
    confirmPassword: ''
  };
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState(() => ({ ...emptyEditForm }));
  const [initialEditForm, setInitialEditForm] = useState(() => ({ ...emptyEditForm }));

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setError('');
        const data = await api.users.profile();
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        if (isMounted) {
          setError('Failed to load profile details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      loadProfile();
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  const formatJoinDate = (value?: string | null) => {
    if (!value) return 'January 2024';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'January 2024';
    return parsed.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  const formatRelativeTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Just now';
    const diffMs = Date.now() - parsed.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return parsed.toLocaleDateString();
  };

  const activityItems = profile?.recentActivity || [];

  const getActivityTitle = (item: RecentActivityItem) => {
    const typeLabel = item.type === 'audio' ? 'audio track' : `${item.type} post`;
    if (item.status === 'approved') return `Published ${typeLabel}`;
    if (item.status === 'rejected') return `Rejected ${typeLabel}`;
    return `Submitted ${typeLabel} for review`;
  };

  const getActivityAccent = (type: 'video' | 'audio' | 'blog') => {
    if (type === 'audio') {
      return { border: 'border-orange-600', icon: 'text-orange-700', bg: 'bg-orange-100' };
    }
    if (type === 'blog') {
      return { border: 'border-orange-400', icon: 'text-orange-500', bg: 'bg-orange-100' };
    }
    return { border: 'border-orange-500', icon: 'text-orange-600', bg: 'bg-orange-100' };
  };

  const profileUser = profile?.user;
  const badgeRole = normalizeRole(profileUser?.role || user?.role || 'viewer');
  const resolvedAvatar = profileUser ? (profileUser.avatar ?? '') : (user?.avatar ?? '');
  const userStats = {
    name: profileUser?.name ?? user?.name ?? 'User',
    email: profileUser?.email ?? user?.email ?? '',
    avatar: resolvedAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    joinDate: formatJoinDate(profileUser?.joinDate ?? user?.joinDate ?? null),
    studentId: profileUser ? (profileUser.studentId ?? '') : (user?.studentId ?? ''),
    totalScore: profile?.stats?.totalScore ?? 0,
    avgRating: profile?.stats?.avgRating ?? 0,
    videoSubmissions: profile?.stats?.videoSubmissions ?? 0,
    audioSubmissions: profile?.stats?.audioSubmissions ?? 0,
    blogSubmissions: profile?.stats?.blogSubmissions ?? 0,
  };

  const openEditModal = () => {
    const nextForm = {
      name: profileUser?.name ?? user?.name ?? '',
      email: profileUser?.email ?? user?.email ?? '',
      studentId: profileUser ? (profileUser.studentId ?? '') : (user?.studentId ?? ''),
      avatar: profileUser ? (profileUser.avatar ?? '') : (user?.avatar ?? ''),
      password: '',
      confirmPassword: ''
    };
    setEditForm({ ...nextForm });
    setInitialEditForm({ ...nextForm });
    setEditError('');
    setShowConfirm(false);
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setEditError('');
    setIsSaving(false);
    setShowConfirm(false);
    setEditForm({ ...emptyEditForm });
    setInitialEditForm({ ...emptyEditForm });
  };

  const hasUnsavedChanges = () => {
    const normalize = (value: string) => value.trim();
    if (normalize(editForm.name) !== normalize(initialEditForm.name)) return true;
    if (normalize(editForm.email) !== normalize(initialEditForm.email)) return true;
    if (normalize(editForm.studentId) !== normalize(initialEditForm.studentId)) return true;
    if (normalize(editForm.avatar) !== normalize(initialEditForm.avatar)) return true;
    if (editForm.password.trim()) return true;
    if (editForm.confirmPassword.trim()) return true;
    return false;
  };

  const requestClose = () => {
    if (isSaving) return;
    if (hasUnsavedChanges()) {
      setShowConfirm(true);
      return;
    }
    closeEditModal();
  };

  const handleSaveProfile = async () => {
    setShowConfirm(false);
    const name = editForm.name.trim();
    const email = editForm.email.trim();
    const studentId = editForm.studentId.trim();
    const avatar = editForm.avatar.trim();

    if (!name) {
      setEditError('Name is required.');
      return;
    }
    if (!email) {
      setEditError('Email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEditError('Enter a valid email address.');
      return;
    }
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setEditError('Passwords do not match.');
      return;
    }

    setIsSaving(true);
    setEditError('');

    try {
      const payload: {
        name: string;
        email: string;
        studentId: string;
        avatar: string;
        password?: string;
      } = {
        name,
        email,
        studentId,
        avatar
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      const result = await api.users.update(payload);

      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          user: {
            ...prev.user,
            ...result.user
          }
        };
      });

      updateUser({
        name: result.user.name,
        email: result.user.email,
        avatar: result.user.avatar || undefined,
        studentId: result.user.studentId || undefined
      });

      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile.';
      setEditError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {isLoading && (
        <div className="mb-4 text-sm text-gray-500">Loading profile...</div>
      )}
      {error && (
        <div className="mb-4 text-sm text-red-600">{error}</div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-8 shadow-md mb-6 border-t-4 border-orange-500">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <img
            src={userStats.avatar}
            alt={userStats.name}
            className="w-32 h-32 rounded-full object-cover shadow-lg ring-4 ring-orange-100"
          />

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-2">
              <h1 className="font-heading text-4xl font-bold text-gray-900 tracking-tight">{userStats.name}</h1>
              <RoleBadge role={badgeRole} />
            </div>
            <div className="mb-4 space-y-1">
              <p className="text-sm text-muted-foreground">{userStats.email}</p>
              {userStats.studentId && (
                <p className="text-sm text-muted-foreground">Student ID: {userStats.studentId}</p>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                <span className="font-mono font-semibold text-gray-900">{userStats.avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground">avg rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                <span className="font-mono font-bold text-gray-900">{userStats.totalScore.toLocaleString()}</span>
                <span className="text-muted-foreground">points</span>
              </div>
              <span className="text-muted-foreground">Member since {userStats.joinDate}</span>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={openEditModal}
            type="button"
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Submission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-mono text-3xl font-bold text-gray-900">{userStats.videoSubmissions}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Video Posts</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+3 this month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-mono text-3xl font-bold text-gray-900">{userStats.audioSubmissions}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Audio Posts</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+2 this month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-mono text-3xl font-bold text-gray-900">{userStats.blogSubmissions}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Blog Posts</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+5 this month</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        {activityItems.length === 0 ? (
          <div className="text-sm text-gray-500">No recent activity yet.</div>
        ) : (
          <div className="space-y-4">
            {activityItems.map((item) => {
              const accent = getActivityAccent(item.type);
              const meta = [
                formatRelativeTime(item.createdAt),
                item.views ? `${item.views} views` : null,
                item.votes ? `${item.votes} ratings` : null
              ].filter(Boolean).join(' | ');
              const Icon = item.type === 'audio' ? Mic : item.type === 'blog' ? BookOpen : Video;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 ${accent.border}`}
                >
                  <div className={`w-10 h-10 ${accent.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${accent.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{getActivityTitle(item)}</div>
                    <p className="text-xs text-muted-foreground truncate">{item.title}</p>
                    {meta && (
                      <p className="text-xs text-muted-foreground">{meta}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isEditing && (() => {
        const modalRoot = document.getElementById('modal-root') || document.body;
        return createPortal(
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 p-4"
            onClick={requestClose}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 relative"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
                <button
                  onClick={requestClose}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close edit modal"
                  type="button"
                >
                  X
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                  <input
                    value={editForm.name}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input
                    value={editForm.studentId}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, studentId: event.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                  <input
                    value={editForm.avatar}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, avatar: event.target.value }))}
                    placeholder="https://"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Leave blank to keep current"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                  <input
                    type="password"
                    value={editForm.confirmPassword}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                    placeholder="Repeat new password"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              {editError && (
                <div className="mt-4 text-sm text-red-600">{editError}</div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={requestClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-60"
                  type="button"
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
              {showConfirm && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-2xl p-6">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-full max-w-sm text-center">
                    <p className="text-sm text-gray-700">You have unsaved changes. Save or discard them?</p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600"
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        onClick={closeEditModal}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                        type="button"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>,
          modalRoot
        );
      })()}
    </div>
  );
}
