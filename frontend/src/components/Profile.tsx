import { Star, Video, Mic, BookOpen, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from './auth/RoleBadge';

export function Profile() {
  const { user } = useAuth();

  const userStats = {
    name: user?.name || 'User',
    email: user?.email || '',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    joinDate: user?.joinDate || 'January 2024',
    totalScore: 15240,
    avgRating: 4.7,
    videoSubmissions: 12,
    audioSubmissions: 8,
    blogSubmissions: 15,
  };

  return (
    <div className="max-w-4xl mx-auto">
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
              <RoleBadge role={user?.role || 'viewer'} />
            </div>
            <p className="text-sm text-muted-foreground mb-4">{userStats.email}</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                <span className="font-mono font-semibold text-gray-900">{userStats.avgRating}</span>
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
          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
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
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Video submission received 4.8 stars</div>
              <p className="text-xs text-muted-foreground">2 days ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-400">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900">New blog post published</div>
              <p className="text-gray-600">4 days ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-600">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-orange-700" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900">Audio track reached 1000 plays</div>
              <p className="text-gray-600">1 week ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900">Ranked #5 in Video Portal leaderboard</div>
              <p className="text-gray-600">1 week ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900">UI/UX Design video featured on homepage</div>
              <p className="text-gray-600">2 weeks ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-400">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900">Personal branding article reached 5K reads</div>
              <p className="text-gray-600">2 weeks ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-600">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-orange-700" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900">Entrepreneurship podcast gained 100 new subscribers</div>
              <p className="text-gray-600">3 weeks ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900">Achieved 15,000 total points milestone</div>
              <p className="text-gray-600">3 weeks ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
