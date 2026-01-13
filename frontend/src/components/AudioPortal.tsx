import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Star, TrendingUp, Clock, Award, AlertCircle, X, Upload, Search } from 'lucide-react';
import { PortalLeaderboard } from './PortalLeaderboard';
import { UploadModal } from './UploadModal';
import { InteractiveModal } from './InteractiveModal';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { canUpload } from '../utils/permissions';

export function AudioPortal() {
  const { user } = useAuth();
  const { posts } = usePosts();
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'top'>('latest');
  const [showWarning, setShowWarning] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInteractiveModalOpen, setIsInteractiveModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'audio' | 'blog'>('audio');
  const [searchQuery, setSearchQuery] = useState('');

  const handleUploadClick = (type: 'video' | 'audio' | 'blog' = 'audio') => {
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  const handleInteractiveClick = () => {
    setIsInteractiveModalOpen(true);
  };

  // Use context posts exclusively
  const portalAudios = posts.filter(p => p.type === 'audio' && p.status === 'approved');

  // Filter by search query first
  const filteredAudios = portalAudios.filter(audio => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      audio.title.toLowerCase().includes(query) ||
      audio.authorName.toLowerCase().includes(query)
    );
  });

  // Then sort the filtered results
  const sortedAudios = filteredAudios.sort((a, b: any) => {
    if (sortBy === 'latest') return b.uploadDate.getTime() - a.uploadDate.getTime();
    if (sortBy === 'trending') return b.views - a.views;
    if (sortBy === 'top') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border-l-4 border-teal-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Audio Portal</h1>
              <p className="text-gray-600">Listen to podcasts, music, and more</p>
            </div>
          </div>

          {/* Warning Banner */}
          {showWarning && (
            <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-orange-900 mb-1">Invalid File Type</div>
                <p className="text-orange-700">This file type is not allowed for the Audio Portal. Only audio files (MP3, WAV, FLAC) are accepted.</p>
              </div>
              <button onClick={() => setShowWarning(false)} className="text-orange-600 hover:text-orange-800">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSortBy('latest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'latest'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-teal-50'
                }`}
            >
              <Clock className="w-4 h-4" />
              Latest
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'trending'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-teal-50'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setSortBy('top')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'top'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-teal-50'
                }`}
            >
              <Award className="w-4 h-4" />
              Top Rated
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Audio..."
              style={{ paddingLeft: '3.5rem' }}
              className="w-full pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-600 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Cards Panel - Moved to Top - Only for Creators/Admins */}
        {canUpload(user) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleUploadClick('audio')}
              className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-teal-100 dark:border-teal-900/20 hover:border-teal-600 transition-all group text-center shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Upload New Audio</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Share your sounds with the world</p>
            </button>

            <button
              onClick={handleInteractiveClick}
              className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-teal-600 transition-all group text-center shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Start Recording</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Record and share your audio content</p>
            </button>
          </div>
        )}

        {/* Audio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedAudios.map((audio) => {
            return (
              <Link
                key={audio.id}
                to={`/audio/${audio.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer border-b-4 border-teal-600 block"
              >
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={audio.thumbnail}
                    alt={audio.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                    {audio.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-gray-900 mb-2">{audio.title}</h3>
                  <p className="text-gray-600 mb-3">{audio.authorName}</p>

                  {/* Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-teal-600 fill-teal-600" />
                      <span className="text-gray-700">{audio.rating}</span>
                    </div>
                    <span className="text-gray-600">{audio.views.toLocaleString()} plays</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>


        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          initialType={uploadType}
        />

        <InteractiveModal
          isOpen={isInteractiveModalOpen}
          onClose={() => setIsInteractiveModalOpen(false)}
          type="audio"
        />
      </div>

      {/* Leaderboard Sidebar */}
      <div className="lg:col-span-1">
        <PortalLeaderboard portalType="audio" />
      </div>
    </div>
  );
}
