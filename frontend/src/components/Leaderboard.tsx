import { useState } from 'react';
import { Trophy, Medal, Award, Star, Video, Mic, BookOpen, Globe, Heart } from 'lucide-react';
import { useLeaderboard, LeaderboardEntry as ContextEntry } from '../contexts/LeaderboardContext';



export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'overall' | 'video' | 'audio' | 'blog'>('overall');
  const { getAllLeaderboard, getLeaderboardByPortal, voteUser } = useLeaderboard();

  // Get real data based on active tab
  const getLeaderboardData = () => {
    if (activeTab === 'overall') {
      return getAllLeaderboard();
    }
    return getLeaderboardByPortal(activeTab);
  };

  const currentLeaderboard = getLeaderboardData();

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
          <Medal className="w-6 h-6 text-white" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
          <Medal className="w-6 h-6 text-white" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-lg">
          <Medal className="w-6 h-6 text-white" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-gray-600">#{rank}</span>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border-t-4 border-orange-500">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">Leaderboard</h1>
            <p className="text-gray-600">Top contributors across all portals</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overall')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'overall'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
              }`}
          >
            <Globe className="w-4 h-4" />
            Overall
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'video'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
              }`}
          >
            <Video className="w-4 h-4" />
            Video
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'audio'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
              }`}
          >
            <Mic className="w-4 h-4" />
            Audio
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'blog'
              ? 'bg-orange-400 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            Blog
          </button>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-4">
        {currentLeaderboard.map((entry) => (
          <div
            key={entry.rank}
            className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all ${entry.rank <= 3 ? 'border-2 border-orange-300' : ''
              }`}
          >
            <div className="flex items-center gap-6">
              {/* Rank Badge */}
              <div className="flex-shrink-0">
                {getRankBadge(entry.rank)}
              </div>

              {/* Avatar */}
              <img
                src={entry.avatar}
                alt={entry.username}
                className="w-16 h-16 rounded-full object-cover shadow-md"
              />

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 mb-1">{entry.username}</h3>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span>{entry.rating}</span>
                  </div>
                  <span>{entry.submissions} submissions</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      voteUser(entry.userId);
                    }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all ${entry.hasVoted
                        ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <Heart className={`w-4 h-4 ${entry.hasVoted ? 'fill-rose-600' : ''}`} />
                    <span>{entry.userVotes}</span>
                  </button>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-500">Rank #{entry.rank}</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-gray-600 mb-1">Total Score</div>
                <div className="text-orange-600">{entry.totalScore.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}