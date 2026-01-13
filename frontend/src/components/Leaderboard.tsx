import { useState } from 'react';
import { Trophy, Medal, Award, Star, Video, Mic, BookOpen, Globe } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  rating: number;
  totalScore: number;
  submissions: number;
}

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'overall' | 'video' | 'audio' | 'blog'>('overall');

  const mockLeaderboards = {
    overall: [
      {
        rank: 1,
        username: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
        rating: 4.9,
        totalScore: 28500,
        submissions: 85,
        role: 'Legendary Creator',
      },
      {
        rank: 2,
        username: 'Alex Rahman',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        rating: 4.8,
        totalScore: 26200,
        submissions: 72,
        role: 'Master Editor',
      },
      {
        rank: 3,
        username: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        rating: 4.8,
        totalScore: 24800,
        submissions: 68,
        role: 'Rising Star',
      },
      {
        rank: 4,
        username: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 4.7,
        totalScore: 21500,
        submissions: 55,
      },
      {
        rank: 5,
        username: 'Lisa Martinez',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        rating: 4.6,
        totalScore: 19800,
        submissions: 48,
      },
      {
        rank: 6,
        username: 'Rafiur Rahman',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        rating: 4.9,
        totalScore: 18450,
        submissions: 42,
      },
      {
        rank: 7,
        username: 'Jennifer Lee',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100',
        rating: 4.5,
        totalScore: 16200,
        submissions: 38,
      },
      {
        rank: 8,
        username: 'Omar Hassan',
        avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100',
        rating: 4.4,
        totalScore: 15400,
        submissions: 35,
      },
      {
        rank: 9,
        username: 'David Kumar',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
        rating: 4.3,
        totalScore: 14100,
        submissions: 30,
      },
      {
        rank: 10,
        username: 'Sophie Turner',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
        rating: 4.2,
        totalScore: 12800,
        submissions: 25,
      },
    ],
    video: [
      {
        rank: 1,
        username: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        rating: 4.9,
        totalScore: 9850,
        submissions: 24,
      },
      {
        rank: 2,
        username: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 4.8,
        totalScore: 9720,
        submissions: 22,
      },
      {
        rank: 3,
        username: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        rating: 4.7,
        totalScore: 9560,
        submissions: 20,
      },
      {
        rank: 4,
        username: 'Alex Rahman',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        rating: 4.6,
        totalScore: 9340,
        submissions: 19,
      },
      {
        rank: 5,
        username: 'Lisa Martinez',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        rating: 4.5,
        totalScore: 9120,
        submissions: 18,
      },
      {
        rank: 6,
        username: 'David Kumar',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
        rating: 4.4,
        totalScore: 8890,
        submissions: 17,
      },
      {
        rank: 7,
        username: 'Jennifer Lee',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100',
        rating: 4.3,
        totalScore: 8650,
        submissions: 16,
      },
      {
        rank: 8,
        username: 'Omar Hassan',
        avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100',
        rating: 4.2,
        totalScore: 8420,
        submissions: 15,
      },
      {
        rank: 9,
        username: 'Rafiur Rahman',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        rating: 4.9,
        totalScore: 8290,
        submissions: 14,
      },
      {
        rank: 10,
        username: 'Sophie Turner',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
        rating: 4.7,
        totalScore: 8150,
        submissions: 13,
      },
      {
        rank: 11,
        username: 'Kevin Zhang',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
        rating: 4.6,
        totalScore: 7980,
        submissions: 12,
      },
      {
        rank: 12,
        username: 'Nina Patel',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100',
        rating: 4.5,
        totalScore: 7820,
        submissions: 11,
      },
    ],
    audio: [
      {
        rank: 1,
        username: 'Lisa Martinez',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        rating: 4.9,
        totalScore: 10200,
        submissions: 28,
      },
      {
        rank: 2,
        username: 'David Kumar',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
        rating: 4.8,
        totalScore: 9980,
        submissions: 26,
      },
      {
        rank: 3,
        username: 'Jennifer Lee',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100',
        rating: 4.7,
        totalScore: 9750,
        submissions: 24,
      },
      {
        rank: 4,
        username: 'Omar Hassan',
        avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100',
        rating: 4.6,
        totalScore: 9540,
        submissions: 23,
      },
      {
        rank: 5,
        username: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        rating: 4.5,
        totalScore: 9320,
        submissions: 21,
      },
      {
        rank: 6,
        username: 'Rafiur Rahman',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        rating: 4.8,
        totalScore: 9180,
        submissions: 20,
      },
      {
        rank: 7,
        username: 'Marcus Brown',
        avatar: 'https://images.unsplash.com/photo-1507081323647-4d250478b919?w=100',
        rating: 4.7,
        totalScore: 8950,
        submissions: 19,
      },
      {
        rank: 8,
        username: 'Emily Zhang',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100',
        rating: 4.6,
        totalScore: 8730,
        submissions: 18,
      },
      {
        rank: 9,
        username: 'Victoria Chen',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
        rating: 4.8,
        totalScore: 8560,
        submissions: 17,
      },
      {
        rank: 10,
        username: 'Nathan Parker',
        avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100',
        rating: 4.9,
        totalScore: 8420,
        submissions: 16,
      },
    ],
    blog: [
      {
        rank: 1,
        username: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        rating: 4.9,
        totalScore: 11500,
        submissions: 32,
      },
      {
        rank: 2,
        username: 'Alex Rahman',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        rating: 4.8,
        totalScore: 11200,
        submissions: 30,
      },
      {
        rank: 3,
        username: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 4.7,
        totalScore: 10900,
        submissions: 28,
      },
      {
        rank: 4,
        username: 'Omar Hassan',
        avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100',
        rating: 4.6,
        totalScore: 10650,
        submissions: 26,
      },
      {
        rank: 5,
        username: 'Jennifer Lee',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100',
        rating: 4.5,
        totalScore: 10400,
        submissions: 25,
      },
      {
        rank: 6,
        username: 'Rafiur Rahman',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        rating: 4.9,
        totalScore: 10250,
        submissions: 24,
      },
      {
        rank: 7,
        username: 'Dr. Sarah Williams',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
        rating: 4.8,
        totalScore: 10050,
        submissions: 23,
      },
      {
        rank: 8,
        username: 'Ahmed Khan',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
        rating: 4.9,
        totalScore: 9890,
        submissions: 22,
      },
      {
        rank: 9,
        username: 'Michelle Chen',
        avatar: 'https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?w=100',
        rating: 4.8,
        totalScore: 9720,
        submissions: 21,
      },
      {
        rank: 10,
        username: 'Dr. Hassan Ibrahim',
        avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100',
        rating: 4.9,
        totalScore: 9580,
        submissions: 20,
      },
    ],
  };

  const currentLeaderboard = mockLeaderboards[activeTab];

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