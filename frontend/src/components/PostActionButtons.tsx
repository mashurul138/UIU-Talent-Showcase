import { Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { canEditPost, canDeletePost } from '../utils/permissions';
import type { Post } from '../types/auth';

interface PostActionButtonsProps {
  post: Post;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export function PostActionButtons({ post, onEdit, onDelete }: PostActionButtonsProps) {
  const { user } = useAuth();
  
  const canEdit = canEditPost(user, post);
  const canDelete = canDeletePost(user, post);

  // If user has no permissions, don't render anything
  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {canEdit && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(post.id);
          }}
          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          title="Edit post"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
      {canDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(post.id);
          }}
          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          title="Delete post"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
