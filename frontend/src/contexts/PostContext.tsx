import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post } from '../types/auth';
import { api } from '../services/api';

interface PostContextType {
    posts: Post[];
    addPost: (post: Omit<Post, 'id' | 'uploadDate' | 'status' | 'views' | 'rating' | 'votes' | 'hasVoted'> & { file: File }) => Promise<void>;
    approvePost: (id: string) => void;
    rejectPost: (id: string) => void;
    deletePost: (id: string) => Promise<void>;
    votePost: (id: string) => Promise<void>;
    getPostsByStatus: (status: Post['status']) => Post[];
    getPostsByType: (type: Post['type']) => Post[];
    updatePostViews: (postId: string, views: number) => void;
}

const PostContext = createContext<PostContextType | null>(null);

export const usePosts = () => {
    const context = useContext(PostContext);
    if (!context) {
        throw new Error('usePosts must be used within PostProvider');
    }
    return context;
};

interface PostProviderProps {
    children: ReactNode;
}

export function PostProvider({ children }: PostProviderProps) {
    const [posts, setPosts] = useState<Post[]>([]);

    const fetchPosts = async () => {
        try {
            const fetchedPosts = await api.posts.list();
            // Map backend implementation to frontend Post type if needed, 
            // but current backend impl matches sufficiently or we can cast
            if (Array.isArray(fetchedPosts)) {
                const mappedPosts = fetchedPosts.map((p: any) => ({
                    ...p,
                    uploadDate: new Date(p.uploadDate),
                }));
                setPosts(mappedPosts);
            } else {
                console.error("fetchPosts received non-array:", fetchedPosts);
                setPosts([]);
            }
        } catch (error) {
            console.error("Failed to fetch posts", error);
            setPosts([]); // Ensure empty state on error
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const addPost = async (newPostData: Omit<Post, 'id' | 'uploadDate' | 'status' | 'views' | 'rating' | 'votes' | 'hasVoted'> & { file: File }) => {
        try {
            const formData = new FormData();
            formData.append('title', newPostData.title);
            formData.append('description', newPostData.description || '');
            formData.append('type', newPostData.type);
            formData.append('duration', newPostData.duration || '');
            formData.append('file', newPostData.file);

            await api.posts.create(formData);
            await fetchPosts(); // Refresh list
        } catch (error) {
            console.error("Error creating post", error);
            throw error;
        }
    };

    const approvePost = async (id: string) => {
        try {
            await api.posts.updateStatus(id, 'approved');
            setPosts(prev => prev.map(post =>
                post.id === id ? { ...post, status: 'approved' } : post
            ));
        } catch (error) {
            console.error("Failed to approve post", error);
        }
    };

    const rejectPost = async (id: string) => {
        try {
            await api.posts.updateStatus(id, 'rejected');
            setPosts(prev => prev.map(post =>
                post.id === id ? { ...post, status: 'rejected' } : post
            ));
        } catch (error) {
            console.error("Failed to reject post", error);
        }
    };

    const deletePost = async (id: string) => {
        try {
            await api.posts.delete(id);
            setPosts(prev => prev.filter(post => post.id !== id));
        } catch (error) {
            console.error("Error deleting post", error);
            throw error;
        }
    };

    const votePost = async (id: string) => {
        try {
            const result = await api.posts.vote(id);
            setPosts(prev => prev.map(post => {
                if (post.id === id) {
                    return {
                        ...post,
                        votes: result.votes, // Use server returned count
                        hasVoted: result.action === 'voted'
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error("Error voting for post", error);
        }
    };

    const getPostsByStatus = (status: Post['status']) => {
        return posts.filter(post => post.status === status);
    };

    const getPostsByType = (type: Post['type']) => {
        return posts.filter(post => post.type === type);
    };

    return (
        <PostContext.Provider value={{
            posts,
            addPost,
            approvePost,
            rejectPost,
            deletePost,
            votePost,
            getPostsByStatus,
            getPostsByType,
            updatePostViews: (postId: string, views: number) => {
                setPosts(prev => prev.map(p => p.id === postId ? { ...p, views } : p));
            }
        }}>
            {children}
        </PostContext.Provider>
    );
}
