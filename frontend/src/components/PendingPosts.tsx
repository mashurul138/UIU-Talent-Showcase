import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Video, Mic, BookOpen, Check, X, Filter, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';

export function PendingPosts() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { posts, approvePost, rejectPost } = usePosts();
    const [filterType, setFilterType] = useState<'all' | 'video' | 'audio' | 'blog'>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Redirect if not admin
    if (!user || user.role !== 'admin') {
        navigate('/');
        return null;
    }

    // Get pending posts
    const pendingPosts = posts.filter(p => p.status === 'pending');

    // Filter by type
    const filteredPosts = filterType === 'all'
        ? pendingPosts
        : pendingPosts.filter(p => p.type === filterType);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return Video;
            case 'audio': return Mic;
            case 'blog': return BookOpen;
            default: return Clock;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'video': return 'text-orange-600 bg-orange-100';
            case 'audio': return 'text-teal-600 bg-teal-100';
            case 'blog': return 'text-indigo-600 bg-indigo-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleApprove = (id: string) => {
        approvePost(id);
    };

    const handleReject = (id: string) => {
        rejectPost(id);
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-gray-900">Pending Posts</h1>
                            <p className="text-gray-600">Review and approve content submissions</p>
                        </div>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${filterType !== 'all'
                                ? 'bg-yellow-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-yellow-50'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            {filterType === 'all' ? 'All Types' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                            <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border-2 border-gray-200 z-50 overflow-hidden">
                                {['all', 'video', 'audio', 'blog'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setFilterType(type as any);
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left transition-all ${filterType === type
                                            ? 'bg-yellow-500 text-white font-semibold'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 font-medium'
                                            }`}
                                    >
                                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-sm">
                    <div className="bg-yellow-50 px-4 py-2 rounded-lg">
                        <span className="text-yellow-700 font-semibold">{pendingPosts.length}</span>
                        <span className="text-yellow-600 ml-1">Total Pending</span>
                    </div>
                    <div className="bg-orange-50 px-4 py-2 rounded-lg">
                        <span className="text-orange-700 font-semibold">{pendingPosts.filter(p => p.type === 'video').length}</span>
                        <span className="text-orange-600 ml-1">Videos</span>
                    </div>
                    <div className="bg-teal-50 px-4 py-2 rounded-lg">
                        <span className="text-teal-700 font-semibold">{pendingPosts.filter(p => p.type === 'audio').length}</span>
                        <span className="text-teal-600 ml-1">Audio</span>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                        <span className="text-indigo-700 font-semibold">{pendingPosts.filter(p => p.type === 'blog').length}</span>
                        <span className="text-indigo-600 ml-1">Blogs</span>
                    </div>
                </div>
            </div>

            {/* Pending Posts List */}
            {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-md text-center">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Posts</h3>
                    <p className="text-gray-600">All submissions have been reviewed!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredPosts.map((post) => {
                        const TypeIcon = getTypeIcon(post.type);
                        const typeColor = getTypeColor(post.type);

                        return (
                            <div
                                key={post.id}
                                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border-l-4 border-yellow-500"
                            >
                                <div className="md:flex">
                                    {/* Thumbnail */}
                                    <div className="md:w-64 md:flex-shrink-0">
                                        <img
                                            src={post.thumbnail}
                                            alt={post.title}
                                            className="w-full h-48 md:h-full object-cover"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${typeColor}`}>
                                                        <TypeIcon className="w-3 h-3" />
                                                        {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                                                    </span>
                                                    {post.duration && (
                                                        <span className="text-xs text-gray-500">{post.duration}</span>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">{post.title}</h3>
                                                <p className="text-gray-600 mb-2">by {post.authorName}</p>
                                                {post.description && (
                                                    <p className="text-gray-700 text-sm mb-3">{post.description}</p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    Uploaded: {post.uploadDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => handleApprove(post.id)}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold shadow-md"
                                            >
                                                <Check className="w-5 h-5" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(post.id)}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold shadow-md"
                                            >
                                                <X className="w-5 h-5" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
