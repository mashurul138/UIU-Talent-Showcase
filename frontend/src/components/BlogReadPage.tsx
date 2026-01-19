import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Star } from 'lucide-react';
import { usePosts } from '../contexts/PostContext';
import { api } from '../services/api';
import { buildMediaUrl } from '../utils/media';

export function BlogReadPage() {
  const { id } = useParams();
  const { posts, votePost, updatePostViews } = usePosts();
  const viewIncrementedRef = useRef<string | null>(null);

  const blog = useMemo(() => {
    if (!id || posts.length === 0) return null;
    return posts.find(p => String(p.id) === String(id) && p.type === 'blog') || null;
  }, [id, posts]);

  useEffect(() => {
    if (!id || !blog) return;
    if (viewIncrementedRef.current === id) return;
    viewIncrementedRef.current = id;

    api.posts.incrementView(id)
      .then(data => {
        updatePostViews(id, data.views);
      })
      .catch(console.error);
  }, [id, blog, updatePostViews]);

  const getImageUrl = (path?: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1499750310159-5b5f8ca473aa?w=1600&auto=format&fit=crop';
    return buildMediaUrl(path);
  };

  const getReadTime = (text?: string) => {
    if (!text) return '1 min';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min`;
  };

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-medium">Loading blog...</h2>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-900">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Blog not found</h2>
          <p className="text-gray-500 mb-6 max-w-md">The blog you're looking for doesn't exist or has been removed from our database.</p>
          <Link to="/blogs" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-200">
            Return to Blog Portal
          </Link>
        </div>
      </div>
    );
  }

  const content = blog.description || 'No description available for this post.';
  const paragraphs = content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center">
        <Link to="/blogs" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Blog Portal</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-xl border-l-4 border-indigo-600">
        <div className="w-full h-72 bg-gray-100">
          <img
            src={getImageUrl(blog.thumbnail)}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
            <div className="text-gray-500">
              <span className="font-medium text-gray-800">{blog.authorName}</span>
              <span className="mx-2">•</span>
              <span>{new Date(blog.uploadDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <button
              onClick={() => votePost(blog.id)}
              className="flex items-center gap-1 group/vote hover:scale-110 transition-transform"
              title={blog.hasVoted ? 'Unvote' : 'Vote'}
            >
              <Star className={`w-4 h-4 transition-colors ${blog.hasVoted ? 'text-indigo-600 fill-indigo-600' : 'text-gray-400 group-hover/vote:text-indigo-600'}`} />
              <span className={`font-medium ${blog.hasVoted ? 'text-indigo-700' : 'text-gray-600'}`}>{blog.votes || 0}</span>
            </button>
            <span>{blog.views.toLocaleString()} reads</span>
            <span>{getReadTime(blog.description)} read</span>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4 text-gray-700 leading-relaxed">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={`${blog.id}-paragraph-${index}`}>{paragraph}</p>
              ))
            ) : (
              <p>{content}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
