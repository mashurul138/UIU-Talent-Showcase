import { useState } from 'react';
import { Trash2, RotateCcw, X, Video, Mic, FileText, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hasRole } from '../utils/permissions';

interface DeletedPost {
  id: string;
  title: string;
  author: string;
  type: 'video' | 'audio' | 'blog';
  reason: string;
  thumbnail: string;
  deletedDate: Date;
}

export function GarbageBin() {
  const { user } = useAuth();

  if (!hasRole(user, 'admin')) {
    return (
      <div className="max-w-4xl mx-auto">
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

  const [deletedPosts, setDeletedPosts] = useState<DeletedPost[]>([
    {
      id: '1',
      title: 'Invalid Audio File Posted to Video Portal',
      author: 'John Doe',
      type: 'audio',
      reason: 'Wrong portal - Audio file submitted to Video Portal',
      thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
      deletedDate: new Date('2024-12-05'),
    },
    {
      id: '2',
      title: 'Spam Content - Promotional Video',
      author: 'Jane Smith',
      type: 'video',
      reason: 'Spam/Promotional content',
      thumbnail: 'https://images.unsplash.com/photo-1649766508871-9dabf2127f5b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvbW90aW9uYWwlMjB2ZWRpb3xlbnwwfHwwfHx8MA%3D%3D',
      deletedDate: new Date('2024-12-04'),
    },
    {
      id: '3',
      title: 'Video File Posted to Blog Portal',
      author: 'Bob Wilson',
      type: 'video',
      reason: 'Wrong portal - Video file submitted to Blog Portal',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
      deletedDate: new Date('2024-12-03'),
    },
    {
      id: '4',
      title: 'Low Quality Content',
      author: 'Alice Brown',
      type: 'blog',
      reason: 'Does not meet quality standards',
      thumbnail: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400',
      deletedDate: new Date('2024-12-02'),
    },
    {
      id: '5',
      title: 'Copyright Infringement Video',
      author: 'Tom Garcia',
      type: 'video',
      reason: 'Copyright violation - Unauthorized content',
      thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400',
      deletedDate: new Date('2024-12-01'),
    },
    {
      id: '6',
      title: 'Inappropriate Audio Content',
      author: 'Mary Johnson',
      type: 'audio',
      reason: 'Violates community guidelines',
      thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
      deletedDate: new Date('2024-11-30'),
    },
    {
      id: '7',
      title: 'Plagiarized Blog Article',
      author: 'Steve Anderson',
      type: 'blog',
      reason: 'Plagiarism detected',
      thumbnail: 'https://plus.unsplash.com/premium_photo-1720744786849-a7412d24ffbf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmxvZyUyMGFydGljbGV8ZW58MHx8MHx8fDA%3D',
      deletedDate: new Date('2024-11-29'),
    },
    {
      id: '8',
      title: 'Misleading Thumbnail Video',
      author: 'Rachel Turner',
      type: 'video',
      reason: 'Clickbait and misleading content',
      thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
      deletedDate: new Date('2024-11-28'),
    },
    {
      id: '9',
      title: 'Incomplete Blog Post',
      author: 'Daniel White',
      type: 'blog',
      reason: 'Incomplete content - Draft submitted',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      deletedDate: new Date('2024-11-27'),
    },
    {
      id: '10',
      title: 'Text File in Audio Portal',
      author: 'Lisa Parker',
      type: 'blog',
      reason: 'Wrong portal - Text file submitted to Audio Portal',
      thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      deletedDate: new Date('2024-11-26'),
    },
  ]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleRestore = (id: string) => {
    setDeletedPosts(deletedPosts.filter(post => post.id !== id));
    alert(`Post restored successfully!`);
  };

  const handlePermanentDelete = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
      setDeletedPosts(deletedPosts.filter(post => post.id !== id));
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === deletedPosts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(deletedPosts.map(post => post.id));
    }
  };

  const handleBulkRestore = () => {
    setDeletedPosts(deletedPosts.filter(post => !selectedItems.includes(post.id)));
    setSelectedItems([]);
    alert(`${selectedItems.length} posts restored successfully!`);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to permanently delete ${selectedItems.length} posts? This action cannot be undone.`)) {
      setDeletedPosts(deletedPosts.filter(post => !selectedItems.includes(post.id)));
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
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      video: 'bg-orange-100 text-orange-700',
      audio: 'bg-orange-200 text-orange-800',
      blog: 'bg-orange-50 text-orange-600',
    };
    return badges[type as keyof typeof badges];
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border-t-4 border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Garbage Bin</h1>
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
            <div className="text-orange-900 mb-1">Content Moderation</div>
            <p className="text-orange-700">Posts removed for violating portal guidelines. You can restore or permanently delete these items.</p>
          </div>
        </div>
      </div>

      {/* Select All */}
      <div className="bg-white rounded-xl p-4 shadow-md mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedItems.length === deletedPosts.length && deletedPosts.length > 0}
            onChange={handleSelectAll}
            className="w-5 h-5 rounded border-gray-300"
          />
          <span className="text-gray-700">Select All ({deletedPosts.length} items)</span>
        </label>
      </div>

      {/* Deleted Posts List */}
      {deletedPosts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md text-center">
          <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-gray-900 mb-2">Garbage Bin is Empty</h2>
          <p className="text-gray-600">No deleted posts to display</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deletedPosts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                selectedItems.includes(post.id) ? 'ring-2 ring-orange-500' : ''
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedItems.includes(post.id)}
                  onChange={() => toggleSelect(post.id)}
                  className="w-5 h-5 rounded border-gray-300 flex-shrink-0"
                />

                {/* Thumbnail */}
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${getTypeBadge(post.type)}`}>
                      {getTypeIcon(post.type)}
                      <span className="capitalize">{post.type}</span>
                    </span>
                  </div>
                  <h3 className="text-gray-900 mb-1 truncate">{post.title}</h3>
                  <p className="text-gray-600 mb-2">By {post.author}</p>
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{post.reason}</span>
                  </div>
                  <p className="text-gray-500 mt-1">
                    Deleted on {post.deletedDate.toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRestore(post.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(post.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Delete Forever
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
