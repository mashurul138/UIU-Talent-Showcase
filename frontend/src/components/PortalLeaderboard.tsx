import { Trophy, Medal, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLeaderboard } from '../contexts/LeaderboardContext';

interface PortalLeaderboardProps {
  portalType: 'video' | 'audio' | 'blog';
}

export function PortalLeaderboard({ portalType }: PortalLeaderboardProps) {
  const navigate = useNavigate();
  const { getLeaderboardByPortal } = useLeaderboard();
  const leaderboardData = getLeaderboardByPortal(portalType);

  // Portal-specific color themes
  const portalThemes = {
    video: {
      gradient: 'from-orange-500 to-red-600',
      bg: 'bg-white',
      text: 'text-orange-700',
      hover: 'hover:bg-orange-50',
      border: 'border-orange-500',
      borderItem: 'border-orange-200',
      iconColor: 'text-orange-600',
      starColor: 'text-orange-600 fill-orange-600',
    },
    audio: {
      gradient: 'from-teal-600 to-cyan-700',
      bg: 'bg-white',
      text: 'text-teal-700',
      hover: 'hover:bg-teal-50',
      border: 'border-teal-600',
      borderItem: 'border-teal-200',
      iconColor: 'text-teal-600',
      starColor: 'text-teal-600 fill-teal-600',
    },
    blog: {
      gradient: 'from-indigo-600 to-purple-700',
      bg: 'bg-indigo-100',
      text: 'text-indigo-700',
      hover: 'hover:bg-indigo-200',
      border: 'border-indigo-600',
      borderItem: 'border-indigo-300',
      iconColor: 'text-indigo-600',
      starColor: 'text-indigo-600 fill-indigo-600',
    },
  };

  const theme = portalThemes[portalType];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className={`w-5 h-5 ${theme.iconColor}`} />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Award className="w-4 h-4 text-gray-400" />;
  };

  const portalTitle = portalType.charAt(0).toUpperCase() + portalType.slice(1);

  const handleViewFullLeaderboard = () => {
    navigate('/leaderboard');
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-md sticky top-24 border-t-4 ${theme.border}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br ${theme.gradient} rounded-lg flex items-center justify-center`}>
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-gray-900">{portalTitle} Leaderboard</h2>
          <p className="text-gray-600">Top Contributors</p>
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {leaderboardData.length > 0 ? (
          leaderboardData.map((entry) => (
            <div
              key={entry.userId}
              className={`p-3 rounded-xl transition-all cursor-pointer ${theme.bg} ${theme.hover} border-2 ${theme.borderItem}`}
            >
              <div className="flex items-center gap-3 mb-2">
                {/* Rank */}
                <div className="flex-shrink-0 w-8 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <img
                  src={entry.avatar}
                  alt={entry.username}
                  className="w-10 h-10 rounded-full object-cover"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 truncate font-medium">{entry.username}</div>
                  <div className="flex items-center gap-1">
                    <Star className={`w-3 h-3 ${theme.starColor}`} />
                    <span className="text-gray-600 text-sm">{entry.rating}</span>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center justify-between pl-11">
                <span className="text-gray-600 text-sm">Total Score</span>
                <span className={`${theme.text} font-semibold`}>{entry.totalScore.toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No contributors yet</p>
            <p className="text-sm mt-1">Be the first to upload content!</p>
          </div>
        )}
      </div>

      {/* View All Button */}
      {leaderboardData.length > 0 && (
        <button
          onClick={handleViewFullLeaderboard}
          className={`w-full mt-4 bg-gradient-to-r ${theme.gradient} text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity`}
        >
          View Full Leaderboard
        </button>
      )}
    </div>
  );
}

