import { createContext, useContext, ReactNode } from 'react';
import { usePosts } from './PostContext';

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    avatar: string;
    rating: number;
    totalScore: number;
    portalType: 'video' | 'audio' | 'blog';
}

interface LeaderboardContextType {
    getLeaderboardByPortal: (portalType: 'video' | 'audio' | 'blog') => LeaderboardEntry[];
    getAllLeaderboard: () => LeaderboardEntry[];
}

const LeaderboardContext = createContext<LeaderboardContextType | null>(null);

export const useLeaderboard = () => {
    const context = useContext(LeaderboardContext);
    if (!context) {
        throw new Error('useLeaderboard must be used within LeaderboardProvider');
    }
    return context;
};

interface LeaderboardProviderProps {
    children: ReactNode;
}

export function LeaderboardProvider({ children }: LeaderboardProviderProps) {
    const { posts } = usePosts();

    // Calculate leaderboard data from posts
    const calculateLeaderboard = (portalType?: 'video' | 'audio' | 'blog'): LeaderboardEntry[] => {
        // Filter posts by portal type if specified
        const filteredPosts = portalType
            ? posts.filter(p => p.type === portalType && p.status === 'approved')
            : posts.filter(p => p.status === 'approved');

        // Group posts by author
        const authorStats = new Map<string, {
            username: string;
            totalRating: number;
            totalViews: number;
            postCount: number;
            portalType: 'video' | 'audio' | 'blog';
        }>();

        filteredPosts.forEach(post => {
            const existing = authorStats.get(post.authorId);
            if (existing) {
                existing.totalRating += post.rating;
                existing.totalViews += post.views;
                existing.postCount += 1;
            } else {
                authorStats.set(post.authorId, {
                    username: post.authorName,
                    totalRating: post.rating,
                    totalViews: post.views,
                    postCount: 1,
                    portalType: post.type,
                });
            }
        });

        // Convert to leaderboard entries
        const entries: LeaderboardEntry[] = Array.from(authorStats.entries()).map(([userId, stats]) => {
            const avgRating = stats.totalRating / stats.postCount;
            const totalScore = Math.round(stats.totalViews + (avgRating * 1000));

            // Generate avatar using UI Avatars API
            const avatarName = encodeURIComponent(stats.username);
            const avatar = `https://ui-avatars.com/api/?name=${avatarName}&background=random&size=128`;

            return {
                userId,
                username: stats.username,
                avatar,
                rating: Math.round(avgRating * 10) / 10,
                totalScore,
                portalType: stats.portalType,
                rank: 0, // Will be set after sorting
            };
        });

        // Sort by total score and assign ranks
        entries.sort((a, b) => b.totalScore - a.totalScore);
        entries.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        return entries.slice(0, 10); // Return top 10
    };

    const getLeaderboardByPortal = (portalType: 'video' | 'audio' | 'blog'): LeaderboardEntry[] => {
        return calculateLeaderboard(portalType);
    };

    const getAllLeaderboard = (): LeaderboardEntry[] => {
        return calculateLeaderboard();
    };

    return (
        <LeaderboardContext.Provider value={{
            getLeaderboardByPortal,
            getAllLeaderboard,
        }}>
            {children}
        </LeaderboardContext.Provider>
    );
}
