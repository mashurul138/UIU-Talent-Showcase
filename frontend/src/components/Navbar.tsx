import { Video, Mic, BookOpen, Home, Trophy, Clock, Trash2, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '../types/auth';
import { hasMinimumRole, canAccessGarbageBin } from '../utils/permissions';

interface NavbarProps {
  currentPath: string;
  onLogout?: () => void;
  user: User | null;
}

export function Navbar({ currentPath, onLogout, user }: NavbarProps) {
  const navItems = [
    { path: '/', label: 'Home', icon: Home, minRole: null },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, minRole: 'creator' as const },
    { path: '/video', label: 'Video', icon: Video, minRole: 'viewer' as const },
    { path: '/audio', label: 'Audio', icon: Mic, minRole: 'viewer' as const },
    { path: '/blogs', label: 'Blogs', icon: BookOpen, minRole: 'viewer' as const },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy, minRole: 'viewer' as const },
    { path: '/pending-posts', label: 'Pending Posts', icon: Clock, minRole: 'admin' as const },
    { path: '/garbage', label: 'Garbage Bin', icon: Trash2, minRole: null, adminOnly: true },
    { path: '/profile', label: 'Profile', icon: UserIcon, minRole: 'viewer' as const },
  ].filter(item => {
    // Hide Garbage Bin from non-admins
    if (item.adminOnly && !canAccessGarbageBin(user)) {
      return false;
    }
    // Filter by minimum role
    if (item.minRole && !hasMinimumRole(user, item.minRole)) {
      return false;
    }
    return true;
  });

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-50 border-b-4 border-orange-500">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-heading font-bold text-sm tracking-tight">UIU</span>
            </div>
            <div>
              <h1 className="font-heading text-xl font-semibold text-orange-500 tracking-tight">UIU Talent Showcase</h1>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-white hover:bg-gray-800'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline text-xs font-medium uppercase tracking-wider">{item.label}</span>
                </Link>
              );
            })}

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-orange-500 hover:bg-gray-800 transition-all ml-2 border border-orange-500"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline text-xs font-medium uppercase tracking-wider">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
