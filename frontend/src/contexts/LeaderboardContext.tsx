import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePosts } from './PostContext';
import { api } from '../services/api';

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    avatar: string;
    rating: number;
    totalScore: number;
    submissions: number;
    userVotes: number;
    hasVoted: boolean;
    portalType: 'video' | 'audio' | 'blog';
}

interface LeaderboardContextType {
    getLeaderboardByPortal: (portalType: 'video' | 'audio' | 'blog') => LeaderboardEntry[];
    getAllLeaderboard: () => LeaderboardEntry[];
    voteUser: (userId: string) => Promise<void>;
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
    const [userVotes, setUserVotes] = useState<Record<string, number>>({});
    const [myVotes, setMyVotes] = useState<Record<string, boolean>>({});

    const fetchUserVotes = async () => {
        try {
            const data = await api.posts.getUserVotes();
            setUserVotes(data.votes || {});
            setMyVotes(data.my_votes || {});
        } catch (error) {
            console.error("Failed to fetch user votes", error);
        }
    };

    useEffect(() => {
        fetchUserVotes();
    }, []);

    const voteUser = async (candidateId: string) => {
        try {
            const result = await api.posts.voteUser(candidateId);
            setUserVotes(prev => ({
                ...prev,
                [candidateId]: result.votes
            }));
            setMyVotes(prev => ({
                ...prev,
                [candidateId]: result.has_voted
            }));
        } catch (error) {
            console.error("Failed to vote for user", error);
        }
    };

    // Calculate leaderboard data from posts
    const calculateLeaderboard = (portalType?: 'video' | 'audio' | 'blog'): LeaderboardEntry[] => {
        // Filter posts by portal type if specified
        const filteredPosts = portalType
            ? posts.filter(p => p.type === portalType && p.status === 'approved')
            : posts.filter(p => p.status === 'approved');

        // Group posts by author
        const authorStats = new Map<string, {
            username: string;
            totalVotes: number;
            totalViews: number;
            totalRatingSum: number;
            postCount: number;
            portalType: 'video' | 'audio' | 'blog';
        }>();

        filteredPosts.forEach(post => {
            const existing = authorStats.get(post.authorId);
            const ratingCount = post.votes || 0;
            const ratingAvg = post.rating || 0;
            if (existing) {
                // Ensure we use votes if available, defaulting to 0
                existing.totalVotes += ratingCount;
                existing.totalViews += post.views;
                existing.totalRatingSum += ratingAvg * ratingCount;
                existing.postCount += 1;
            } else {
                authorStats.set(post.authorId, {
                    username: post.authorName,
                    totalVotes: ratingCount,
                    totalViews: post.views,
                    totalRatingSum: ratingAvg * ratingCount,
                    postCount: 1,
                    portalType: post.type,
                });
            }
        });

        // Convert to leaderboard entries
        const entries: LeaderboardEntry[] = Array.from(authorStats.entries()).map(([userId, stats]) => {
            // Formula: Total Score = Total Views + (Total Rating Sum * 2)
            const totalScore = Math.round(stats.totalViews + (stats.totalRatingSum * 2));
            const votes = userVotes[userId] || 0;
            const hasVoted = myVotes[userId] || false;

            // Generate avatar using UI Avatars API
            const avatarName = encodeURIComponent(stats.username);
            const avatar = `https://ui-avatars.com/api/?name=${avatarName}&background=random&size=128`;

            return {
                userId,
                username: stats.username,
                avatar,
                rating: stats.totalVotes, // Display total votes as "Stars"
                totalScore,
                submissions: stats.postCount,
                userVotes: votes,
                hasVoted,
                portalType: stats.portalType,
                rank: 0, // Will be set after sorting
            };
        });

        // Sort by total score AND user votes (giving weight to votes?)
        // Let's keep totalScore as primary for now, maybe add votes to score?
        // User asked to vote them "individually and overall". 
        // Let's stick to total score for rank, but display votes.
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
            voteUser
        }}>
            {children}
        </LeaderboardContext.Provider>
    );
}
