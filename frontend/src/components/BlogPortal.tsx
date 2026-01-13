import { useState, useEffect, useRef } from 'react';
import { BookOpen, Star, TrendingUp, Clock, Award, AlertCircle, X, Upload, PenTool, Filter, ChevronDown } from 'lucide-react';
import { PortalLeaderboard } from './PortalLeaderboard';
import { UploadModal } from './UploadModal';
import { InteractiveModal } from './InteractiveModal';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { canUpload } from '../utils/permissions';

export function BlogPortal() {
  const { user } = useAuth();
  const { posts } = usePosts();
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'top'>('latest');
  const [showWarning, setShowWarning] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInteractiveModalOpen, setIsInteractiveModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'audio' | 'blog'>('blog');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRating, setSelectedRating] = useState<string>('All');
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const handleUploadClick = (type: 'video' | 'audio' | 'blog' = 'blog') => {
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  const handleInteractiveClick = () => {
    setIsInteractiveModalOpen(true);
  };

  // Categories for filtering
  const categories = ['All', 'Tech', 'Education', 'Motivation', 'Lifestyle', 'News'];

  // Helper function to extract category from blog title (temporary solution)
  const getBlogCategory = (blog: any): string => {
    const title = blog.title.toLowerCase();
    if (title.includes('ai') || title.includes('tech') || title.includes('web') || title.includes('digital') || title.includes('crypto') || title.includes('data') || title.includes('iot')) return 'Tech';
    if (title.includes('student') || title.includes('university') || title.includes('study') || title.includes('career') || title.includes('learning')) return 'Education';
    if (title.includes('mental') || title.includes('motivation') || title.includes('success') || title.includes('productivity') || title.includes('leadership')) return 'Motivation';
    if (title.includes('sustainable') || title.includes('time management') || title.includes('work-life') || title.includes('personal brand') || title.includes('financial')) return 'Lifestyle';
    if (title.includes('climate') || title.includes('future') || title.includes('remote work')) return 'News';
    return 'Lifestyle'; // default
  };

  // Use context posts exclusively
  const portalBlogs = posts.filter(p => p.type === 'blog' && p.status === 'approved');

  // Apply filters
  const filteredBlogs = portalBlogs.filter(blog => {
    // Category filter
    const blogCategory = getBlogCategory(blog);
    const categoryMatch = selectedCategory === 'All' || blogCategory === selectedCategory;

    // Rating filter
    let ratingMatch = true;
    if (selectedRating === '5⭐') {
      ratingMatch = blog.rating >= 4.9;
    } else if (selectedRating === '4⭐ & above') {
      ratingMatch = blog.rating >= 4.0;
    } else if (selectedRating === '3⭐ & above') {
      ratingMatch = blog.rating >= 3.0;
    }

    return categoryMatch && ratingMatch;
  });

  // Sort filtered blogs
  const sortedBlogs = filteredBlogs.sort((a, b: any) => {
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
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border-l-4 border-indigo-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Blog Portal</h1>
              <p className="text-gray-600">Read insightful articles and stories</p>
            </div>
          </div>

          {/* Warning Banner */}
          {showWarning && (
            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-indigo-900 mb-1">Invalid Content Type</div>
                <p className="text-indigo-700">This file type is not allowed for the Blog Portal. Only text-based content is accepted.</p>
              </div>
              <button onClick={() => setShowWarning(false)} className="text-indigo-600 hover:text-indigo-800">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSortBy('latest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'latest'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                }`}
            >
              <Clock className="w-4 h-4" />
              Latest
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'trending'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setSortBy('top')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'top'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                }`}
            >
              <Award className="w-4 h-4" />
              Top Rated
            </button>

            {/* Filter Button */}
            <div ref={filterRef} className="relative ml-auto">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${(selectedCategory !== 'All' || selectedRating !== 'All')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                  }`}
              >
                <Filter className="w-4 h-4" />
                Filter
                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Filter Dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border-2 border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Category Filter */}
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter by Type</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedCategory === category
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                            }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter by Rating</h3>
                    <div className="space-y-2">
                      {['All', '5⭐', '4⭐ & above', '3⭐ & above'].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setSelectedRating(rating)}
                          className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all ${selectedRating === rating
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                            }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {(selectedCategory !== 'All' || selectedRating !== 'All') && (
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedCategory('All');
                          setSelectedRating('All');
                        }}
                        className="w-full px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Cards Panel - Moved to Top - Only for Creators/Admins */}
        {canUpload(user) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleUploadClick('blog')}
              className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/20 hover:border-indigo-600 transition-all group text-center shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Upload New Blog</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Share your thoughts with the world</p>
            </button>

            <button
              onClick={handleInteractiveClick}
              className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-indigo-600 transition-all group text-center shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <PenTool className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Start writing</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Create a new article or story</p>
            </button>
          </div>
        )}

        {/* Blog List */}
        <div className="space-y-6">
          {sortedBlogs.map((blog: any) => ( // Use any temporarily to avoid issues with missing readTime/description on base Post type
            <a
              key={blog.id}
              href="https://www.lipsum.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer border-l-4 border-indigo-600 block"
            >
              <div className="md:flex">
                {/* Thumbnail */}
                <div className="md:w-64 md:flex-shrink-0">
                  <img
                    src={blog.thumbnail}
                    alt={blog.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                  <h2 className="text-gray-900 mb-2">{blog.title}</h2>
                  <p className="text-gray-600 mb-3">{blog.authorName}</p>
                  <p className="text-gray-700 mb-4">{blog.description}</p>

                  {/* Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                        <span className="text-gray-700">{blog.rating}</span>
                      </div>
                      <span className="text-gray-600">{blog.views.toLocaleString()} reads</span>
                      <span className="text-gray-600">{blog.readTime} read</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          initialType={uploadType}
        />

        <InteractiveModal
          isOpen={isInteractiveModalOpen}
          onClose={() => setIsInteractiveModalOpen(false)}
          type="blog"
        />
      </div>

      {/* Leaderboard Sidebar */}
      <div className="lg:col-span-1">
        <PortalLeaderboard portalType="blog" />
      </div>
    </div>
  );
}