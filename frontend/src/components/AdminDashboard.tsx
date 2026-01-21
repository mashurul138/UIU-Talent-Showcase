import { usePosts } from '../contexts/PostContext';
import { useAuth } from '../contexts/AuthContext';
import { Check, X, Clock, FileText, Video, Mic, AlertTriangle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { buildMediaUrl } from '../utils/media';

export function AdminDashboard() {
    const { user } = useAuth();
    const { getPostsByStatus, approvePost, rejectPost } = usePosts();
    const getImageUrl = (path?: string) => {
        if (!path) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop';
        return buildMediaUrl(path);
    };

    // Security Check
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    const pendingPosts = getPostsByStatus('pending');

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Review and manage content submissions</p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg font-medium">
                    {pendingPosts.length} Pending Requests
                </div>
            </div>

            {pendingPosts.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All Caught Up!</h2>
                    <p className="text-gray-500 dark:text-gray-400">There are no pending posts to review.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {pendingPosts.map((post) => {
                        const hasThumbnail = Boolean(post.thumbnail);
                        const showThumbnail = post.type !== 'blog' || hasThumbnail;

                        return (
                            <div
                                key={post.id}
                                className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row gap-6"
                            >
                                {/* Thumbnail */}
                                {showThumbnail && (
                                    <div className="w-full md:w-48 h-32 flex-shrink-0 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
                                        <img
                                            src={getImageUrl(post.thumbnail)}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop';
                                            }}
                                        />
                                        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium uppercase backdrop-blur-sm">
                                            {post.type}
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {!showThumbnail && (
                                        <div className="mb-2">
                                            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold uppercase bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-200">
                                                <FileText className="w-3 h-3" />
                                                {post.type}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-start justify-between mb-2">
                                        <h3
                                            className="text-xl font-bold text-gray-900 dark:text-white"
                                            style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                                        >
                                            {post.title}
                                        </h3>
                                        <span className="flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md">
                                            <Clock className="w-3 h-3" /> Pending
                                        </span>
                                    </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold">
                                            {post.authorName.charAt(0)}
                                        </span>
                                        {post.authorName}
                                    </span>
                                    <span>•</span>
                                    <span>{post.uploadDate.toLocaleDateString()}</span>
                                    {post.duration && (
                                        <>
                                            <span>•</span>
                                            <span>{post.duration}</span>
                                        </>
                                    )}
                                </div>

                                <p
                                    className="text-gray-600 dark:text-gray-300 mb-4"
                                    style={{
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-word',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {post.description || 'No description provided.'}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => approvePost(post.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <Check className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => rejectPost(post.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Reject
                                    </button>
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
