import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Video, Mic, BookOpen, Check, X, Filter, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { buildMediaUrl } from '../utils/media';

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

    const getImageUrl = (path?: string) => {
        if (!path) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop';

        // Check for non-image extensions
        if (path.match(/\.(mp3|wav|flac|aac|ogg|mp4|mov|avi|webm)$/i)) {
            return 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&auto=format&fit=crop'; // Audio/Generic placeholder
        }

        return buildMediaUrl(path);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl mb-8 border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform rotate-3">
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 font-heading">Pending Approvals</h1>
                            <p className="text-gray-600 font-medium">Review community submissions</p>
                        </div>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-semibold border-2 ${filterType !== 'all'
                                ? 'bg-yellow-500 border-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-yellow-400'
                                }`}
                        >
                            <Filter className="w-5 h-5" />
                            {filterType === 'all' ? 'All Types' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                            <ChevronDown className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top-right animate-in fade-in zoom-in-95 duration-200">
                                {['all', 'video', 'audio', 'blog'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setFilterType(type as any);
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full px-6 py-3 text-left transition-all font-medium flex items-center justify-between ${filterType === type
                                            ? 'bg-yellow-50 text-yellow-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                                        {filterType === type && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { label: 'Total Pending', value: pendingPosts.length, color: 'yellow' },
                        { label: 'Videos', value: pendingPosts.filter(p => p.type === 'video').length, color: 'orange' },
                        { label: 'Audio', value: pendingPosts.filter(p => p.type === 'audio').length, color: 'teal' },
                        { label: 'Blogs', value: pendingPosts.filter(p => p.type === 'blog').length, color: 'indigo' },
                    ].map((stat) => (
                        <div key={stat.label} className={`bg-${stat.color}-50/50 rounded-2xl p-4 border border-${stat.color}-100 backdrop-blur-sm`}>
                            <div className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</div>
                            <div className={`text-sm text-${stat.color}-600 font-medium`}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Posts List */}
            {filteredPosts.length === 0 ? (
                <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-16 shadow-lg border border-white/50 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-500 text-lg">No pending posts to review at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredPosts.map((post) => {
                        const TypeIcon = getTypeIcon(post.type);
                        const typeColor = getTypeColor(post.type);

                        return (
                            <div
                                key={post.id}
                                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
                            >
                                <div className="md:flex">
                                    {/* Thumbnail */}
                                    <div className="md:w-80 md:flex-shrink-0 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                                        <img
                                            src={getImageUrl(post.thumbnail)}
                                            alt={post.title}
                                            className="w-full h-64 md:h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                // Fallback to generic image if load fails (likely audio/video file)
                                                target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop';
                                            }}
                                        />
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg backdrop-blur-md ${typeColor}`}>
                                                <TypeIcon className="w-4 h-4" />
                                                {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-gray-500 font-medium flex items-center gap-2">
                                                        by <span className="text-gray-900">{post.authorName}</span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                        {post.uploadDate.toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {post.description && (
                                                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-2">
                                                    {post.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-4 mt-4 pt-6 border-t border-gray-100">
                                            <button
                                                onClick={() => handleApprove(post.id)}
                                                style={{ backgroundColor: '#16a34a', color: 'white' }}
                                                className="flex-1 hover:bg-green-700 px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors font-bold shadow-lg shadow-green-600/30"
                                            >
                                                <Check className="w-6 h-6" />
                                                <span className="text-lg">Approve Post</span>
                                            </button>
                                            <button
                                                onClick={() => handleReject(post.id)}
                                                className="flex-1 bg-white border-2 border-red-100 hover:border-red-500 text-red-600 hover:text-white hover:bg-red-500 px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-all font-bold group/reject"
                                            >
                                                <X className="w-6 h-6 group-hover/reject:scale-110 transition-transform" />
                                                <span className="text-lg">Reject & Trash</span>
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
