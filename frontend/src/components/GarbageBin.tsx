import { useState } from 'react';
import { Trash2, RotateCcw, X, Video, Mic, FileText, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hasRole } from '../utils/permissions';
import { usePosts } from '../contexts/PostContext';
import { buildMediaUrl } from '../utils/media';

export function GarbageBin() {
  const { user } = useAuth();
  const { posts, approvePost, deletePost } = usePosts();

  if (!hasRole(user, 'admin')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-12 shadow-md border-t-4 border-red-500 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-3">Access Restricted</h1>
          <p className="text-gray-600">You do not have permission to access the Garbage Bin. This area is reserved for administrators only.</p>
        </div>
      </div>
    );
  }

  const deletedPosts = posts.filter(p => p.status === 'rejected');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleRestore = async (id: string) => {
    await approvePost(id);
    alert(`Post restored successfully!`);
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
      await deletePost(id);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === deletedPosts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(deletedPosts.map(post => post.id));
    }
  };

  const handleBulkRestore = async () => {
    for (const id of selectedItems) {
      await approvePost(id);
    }
    setSelectedItems([]);
    alert(`${selectedItems.length} posts restored successfully!`);
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to permanently delete ${selectedItems.length} posts? This action cannot be undone.`)) {
      for (const id of selectedItems) {
        await deletePost(id);
      }
      setSelectedItems([]);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-orange-600" />;
      case 'audio':
        return <Mic className="w-4 h-4 text-orange-700" />;
      case 'blog':
        return <FileText className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-orange-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      video: 'bg-orange-100 text-orange-700',
      audio: 'bg-orange-200 text-orange-800',
      blog: 'bg-orange-50 text-orange-600',
    };
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const getImageUrl = (path?: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400';
    return buildMediaUrl(path);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border-t-4 border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">Garbage Bin</h1>
              <p className="text-gray-600">Unnecessary Posts (Moderation)</p>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-gray-600">{selectedItems.length} selected</span>
              <button
                onClick={handleBulkRestore}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Restore
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors"
              >
                <X className="w-4 h-4" />
                Delete Forever
              </button>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-orange-900 mb-1 font-semibold">Content Moderation</div>
            <p className="text-orange-700 text-sm">Posts removed for violating portal guidelines. You can restore or permanently delete these items.</p>
          </div>
        </div>
      </div>

      {/* Select All */}
      {deletedPosts.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-md mb-4 flex items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedItems.length === deletedPosts.length}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-gray-700 font-medium select-none">Select All ({deletedPosts.length} items)</span>
          </label>
        </div>
      )}

      {/* Deleted Posts List */}
      {deletedPosts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md text-center border-2 border-dashed border-gray-200">
          <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-gray-900 text-xl font-bold mb-2">Garbage Bin is Empty</h2>
          <p className="text-gray-500">No rejected posts to display.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deletedPosts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${selectedItems.includes(post.id) ? 'ring-2 ring-orange-500 border-orange-500' : 'border-gray-200 hover:shadow-md'
                }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedItems.includes(post.id)}
                  onChange={() => toggleSelect(post.id)}
                  className="w-5 h-5 rounded border-gray-300 flex-shrink-0 text-orange-500 focus:ring-orange-500"
                />

                {/* Thumbnail */}
                <div className="relative w-full md:w-32 h-32 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(post.thumbnail)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeBadge(post.type)}`}>
                      {getTypeIcon(post.type)}
                      <span className="capitalize">{post.type}</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">By <span className="font-medium">{post.authorName}</span></p>
                  <div className="flex items-center gap-2 text-red-600 text-xs font-medium bg-red-50 inline-block px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Rejected by Admin</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    Uploaded on {post.uploadDate.toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 flex-shrink-0 mt-2 md:mt-0">
                  <button
                    onClick={() => handleRestore(post.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium"
                    title="Restore Post"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(post.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm font-medium"
                    title="Permanent Delete"
                  >
                    <X className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
