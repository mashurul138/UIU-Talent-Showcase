import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Star, TrendingUp, Clock, Award, AlertCircle, X, Upload, Radio, Play, Search } from 'lucide-react';
import { PortalLeaderboard } from './PortalLeaderboard';
import { UploadModal } from './UploadModal';
import { InteractiveModal } from './InteractiveModal';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { canUpload } from '../utils/permissions';
import type { Post } from '../types/auth';


export function VideoPortal() {
  const { user } = useAuth();
  const { posts } = usePosts();
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'top'>('latest');
  const [showWarning, setShowWarning] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInteractiveModalOpen, setIsInteractiveModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'audio' | 'blog'>('video');
  const [searchQuery, setSearchQuery] = useState('');

  const handleUploadClick = (type: 'video' | 'audio' | 'blog' = 'video') => {
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  const handleInteractiveClick = () => {
    setIsInteractiveModalOpen(true);
  };

  // Use context posts exclusively
  const portalVideos: Post[] = posts.filter(p => p.type === 'video' && p.status === 'approved');

  // Filter by search query first
  const filteredVideos = portalVideos.filter(video => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      video.title.toLowerCase().includes(query) ||
      video.authorName.toLowerCase().includes(query)
    );
  });

  // Then sort the filtered results
  const sortedVideos = filteredVideos.sort((a, b) => {
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
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Video Portal</h1>
              <p className="text-gray-600">Discover amazing video content</p>
            </div>
          </div>

          {/* Warning Banner */}
          {showWarning && (
            <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-orange-900 mb-1">Invalid File Type</div>
                <p className="text-orange-700">This file type is not allowed for the Video Portal. Only video files (MP4, MOV, AVI) are accepted.</p>
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
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
                }`}
            >
              <Clock className="w-4 h-4" />
              Latest
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'trending'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setSortBy('top')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'top'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
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
              placeholder="Search videos..."
              style={{ paddingLeft: '3.5rem' }}
              className="w-full pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
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
              onClick={() => handleUploadClick('video')}
              className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-orange-100 dark:border-orange-900/20 hover:border-orange-500 transition-all group text-center shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Upload New Video</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Share your creation with the world</p>
            </button>

            <button
              onClick={handleInteractiveClick}
              className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-orange-500 transition-all group text-center shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Radio className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Start a Broadcast</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Go live and interact with viewers</p>
            </button>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedVideos.map((video) => (
            <Link
              key={video.id}
              to={`/video/${video.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer border-b-4 border-orange-500 block"
            >
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-[#f97316] rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 transform group-hover:scale-110 transition-all duration-300">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-bold z-10">
                  {video.duration}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-gray-900 mb-2">{video.title}</h3>
                <p className="text-gray-600 mb-3">{video.authorName}</p>

                {/* Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span className="text-gray-700">{video.rating}</span>
                  </div>
                  <span className="text-gray-600">{video.views.toLocaleString()} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Modal handled elsewhere */}

        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          initialType={uploadType}
        />

        <InteractiveModal
          isOpen={isInteractiveModalOpen}
          onClose={() => setIsInteractiveModalOpen(false)}
          type="video"
        />
      </div>

      {/* Leaderboard Sidebar */}
      <div className="lg:col-span-1">
        <PortalLeaderboard portalType="video" />
      </div>
    </div>
  );
}