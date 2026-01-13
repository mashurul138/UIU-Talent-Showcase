import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post } from '../types/auth';

interface PostContextType {
    posts: Post[];
    addPost: (post: Omit<Post, 'id' | 'uploadDate' | 'status' | 'views' | 'rating'>) => void;
    approvePost: (id: string) => void;
    rejectPost: (id: string) => void;
    deletePost: (id: string) => void;
    getPostsByStatus: (status: Post['status']) => Post[];
    getPostsByType: (type: Post['type']) => Post[];
}

const PostContext = createContext<PostContextType | null>(null);

const STORAGE_KEY = 'uiu_posts_db_v7';

// Initial Mock Data (Consolidated from Portals)
const INITIAL_POSTS: Post[] = [
    // --- VIDEO POSTS ---
    { id: 'v-1', title: 'Introduction to Web Development', authorId: 'user-1', authorName: 'Sarah Johnson', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', rating: 4.8, views: 1520, duration: '12:34', uploadDate: new Date('2024-12-05'), status: 'approved' },
    { id: 'v-2', title: 'Creative Video Editing Tutorial', authorId: 'user-2', authorName: 'Mike Chen', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1579109652910-99b9be06aaec?w=500', rating: 4.9, views: 2340, duration: '18:45', uploadDate: new Date('2024-12-04'), status: 'approved' },
    { id: 'v-3', title: 'Campus Life Vlog', authorId: 'user-3', authorName: 'Emma Davis', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400', rating: 4.6, views: 890, duration: '8:20', uploadDate: new Date('2024-12-03'), status: 'approved' },
    { id: 'v-4', title: 'Tech Innovation Showcase', authorId: 'user-4', authorName: 'Alex Rahman', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400', rating: 4.7, views: 1680, duration: '15:12', uploadDate: new Date('2024-12-02'), status: 'approved' },
    { id: 'v-5', title: 'UI/UX Design Principles', authorId: 'user-1', authorName: 'Sarah Johnson', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', rating: 4.9, views: 3200, duration: '22:15', uploadDate: new Date('2024-12-01'), status: 'approved' },
    { id: 'v-6', title: 'Mobile App Development Journey', authorId: 'user-5', authorName: 'Lisa Park', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400', rating: 4.7, views: 1850, duration: '16:40', uploadDate: new Date('2024-11-30'), status: 'approved' },
    { id: 'v-7', title: 'Photography Tips for Beginners', authorId: 'user-2', authorName: 'Mike Chen', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400', rating: 4.8, views: 2100, duration: '14:25', uploadDate: new Date('2024-11-29'), status: 'approved' },
    { id: 'v-8', title: 'Machine Learning Basics', authorId: 'user-6', authorName: 'Jennifer Wu', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400', rating: 4.6, views: 1450, duration: '20:30', uploadDate: new Date('2024-11-28'), status: 'approved' },
    { id: 'v-9', title: 'Animation Techniques', authorId: 'user-3', authorName: 'Emma Davis', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400', rating: 4.9, views: 2890, duration: '19:15', uploadDate: new Date('2024-11-27'), status: 'approved' },
    { id: 'v-10', title: 'Game Development Tutorial', authorId: 'user-7', authorName: 'Sophie Turner', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', rating: 4.8, views: 2650, duration: '25:10', uploadDate: new Date('2024-11-26'), status: 'approved' },
    { id: 'v-11', title: 'Digital Marketing Strategies', authorId: 'user-4', authorName: 'Alex Rahman', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', rating: 4.7, views: 2230, duration: '17:50', uploadDate: new Date('2024-11-25'), status: 'approved' },
    { id: 'v-12', title: 'Cybersecurity Essentials', authorId: 'user-8', authorName: 'Nina Patel', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400', rating: 4.9, views: 3100, duration: '21:30', uploadDate: new Date('2024-11-24'), status: 'approved' },
    { id: 'v-13', title: 'React.js Complete Guide', authorId: 'user-1', authorName: 'Sarah Johnson', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', rating: 4.8, views: 2890, duration: '28:45', uploadDate: new Date('2024-11-23'), status: 'approved' },
    { id: 'v-14', title: 'Content Creation Tips', authorId: 'user-5', authorName: 'Lisa Park', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400', rating: 4.6, views: 1670, duration: '13:20', uploadDate: new Date('2024-11-22'), status: 'approved' },
    { id: 'v-15', title: 'Cloud Computing Overview', authorId: 'user-9', authorName: 'Ahmed Khan', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400', rating: 4.7, views: 2050, duration: '19:40', uploadDate: new Date('2024-11-21'), status: 'approved' },
    { id: 'v-16', title: 'Data Visualization Techniques', authorId: 'user-2', authorName: 'Mike Chen', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', rating: 4.9, views: 2780, duration: '16:15', uploadDate: new Date('2024-11-20'), status: 'approved' },
    { id: 'v-17', title: 'Blockchain Technology Explained', authorId: 'user-6', authorName: 'Jennifer Wu', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400', rating: 4.8, views: 2450, duration: '23:10', uploadDate: new Date('2024-11-19'), status: 'approved' },
    { id: 'v-18', title: '3D Modeling for Beginners', authorId: 'user-10', authorName: 'Daniel Martinez', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400', rating: 4.7, views: 1920, duration: '24:30', uploadDate: new Date('2024-11-18'), status: 'approved' },
    { id: 'v-19', title: 'Public Speaking Masterclass', authorId: 'user-3', authorName: 'Emma Davis', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400', rating: 4.9, views: 3350, duration: '18:55', uploadDate: new Date('2024-11-17'), status: 'approved' },
    { id: 'v-20', title: 'Product Design Process', authorId: 'user-7', authorName: 'Sophie Turner', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400', rating: 4.8, views: 2560, duration: '20:25', uploadDate: new Date('2024-11-16'), status: 'approved' },
    { id: 'v-21', title: 'SEO Best Practices 2024', authorId: 'user-4', authorName: 'Alex Rahman', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1709281847780-2b34c28853c0?w=400', rating: 4.7, views: 2190, duration: '15:40', uploadDate: new Date('2024-11-15'), status: 'approved' },
    { id: 'v-22', title: 'Python Programming Tutorial', authorId: 'user-8', authorName: 'Nina Patel', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400', rating: 4.9, views: 3420, duration: '26:50', uploadDate: new Date('2024-11-14'), status: 'approved' },
    { id: 'v-23', title: 'Entrepreneurship Journey', authorId: 'user-9', authorName: 'Ahmed Khan', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400', rating: 4.8, views: 2710, duration: '22:35', uploadDate: new Date('2024-11-13'), status: 'approved' },
    { id: 'v-24', title: 'Documentary Filmmaking', authorId: 'user-10', authorName: 'Daniel Martinez', authorRole: 'creator', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400', rating: 4.6, views: 1840, duration: '17:20', uploadDate: new Date('2024-11-12'), status: 'approved' },

    // --- AUDIO POSTS ---
    { id: 'a-1', title: 'The Future of Technology Podcast', authorId: 'mock', authorName: 'David Kumar', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400', rating: 4.7, views: 2100, duration: '45:20', uploadDate: new Date('2024-12-05'), status: 'approved' },
    { id: 'a-2', title: 'Acoustic Guitar Sessions', authorId: 'mock', authorName: 'Lisa Martinez', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400', rating: 4.9, views: 3450, duration: '32:15', uploadDate: new Date('2024-12-04'), status: 'approved' },
    { id: 'a-3', title: 'Student Stories Interview Series', authorId: 'mock', authorName: 'Omar Hassan', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400', rating: 4.5, views: 1200, duration: '28:40', uploadDate: new Date('2024-12-03'), status: 'approved' },
    { id: 'a-4', title: 'Motivation & Success Stories', authorId: 'mock', authorName: 'Jennifer Lee', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400', rating: 4.8, views: 2890, duration: '38:12', uploadDate: new Date('2024-12-02'), status: 'approved' },
    { id: 'a-5', title: 'Jazz Evening Collection', authorId: 'mock', authorName: 'Marcus Brown', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400', rating: 4.9, views: 4200, duration: '52:30', uploadDate: new Date('2024-12-01'), status: 'approved' },
    { id: 'a-6', title: 'Entrepreneurship Talk', authorId: 'mock', authorName: 'Rafiur Rahman', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400', rating: 4.8, views: 3100, duration: '41:20', uploadDate: new Date('2024-11-30'), status: 'approved' },
    { id: 'a-7', title: 'Piano Melodies', authorId: 'mock', authorName: 'Emily Zhang', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400', rating: 4.7, views: 2750, duration: '36:45', uploadDate: new Date('2024-11-29'), status: 'approved' },
    { id: 'a-8', title: 'Tech Industry Insights', authorId: 'mock', authorName: 'Ahmed Ali', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400', rating: 4.6, views: 1980, duration: '44:15', uploadDate: new Date('2024-11-28'), status: 'approved' },
    { id: 'a-9', title: 'Meditation & Mindfulness', authorId: 'mock', authorName: 'Sarah Wilson', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400', rating: 4.9, views: 5100, duration: '30:00', uploadDate: new Date('2024-11-27'), status: 'approved' },
    { id: 'a-10', title: 'Creative Writing Discussion', authorId: 'mock', authorName: 'Kevin Roberts', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400', rating: 4.7, views: 2400, duration: '39:30', uploadDate: new Date('2024-11-26'), status: 'approved' },
    { id: 'a-11', title: 'Classical Music Collection', authorId: 'mock', authorName: 'Victoria Chen', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400', rating: 4.8, views: 3680, duration: '48:25', uploadDate: new Date('2024-11-25'), status: 'approved' },
    { id: 'a-12', title: 'Startup Founder Stories', authorId: 'mock', authorName: 'Nathan Parker', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400', rating: 4.9, views: 4150, duration: '50:10', uploadDate: new Date('2024-11-24'), status: 'approved' },
    { id: 'a-13', title: 'Indie Rock Sessions', authorId: 'mock', authorName: 'Maya Thompson', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400', rating: 4.6, views: 2340, duration: '35:20', uploadDate: new Date('2024-11-23'), status: 'approved' },
    { id: 'a-14', title: 'Philosophy Discussions', authorId: 'mock', authorName: 'Dr. Richard Hayes', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', rating: 4.7, views: 1890, duration: '42:50', uploadDate: new Date('2024-11-22'), status: 'approved' },
    { id: 'a-15', title: 'Electronic Dance Mix', authorId: 'mock', authorName: 'DJ Alex Stone', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400', rating: 4.8, views: 3920, duration: '55:30', uploadDate: new Date('2024-11-21'), status: 'approved' },
    { id: 'a-16', title: 'History Podcast Series', authorId: 'mock', authorName: 'Professor Linda White', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400', rating: 4.9, views: 4560, duration: '46:15', uploadDate: new Date('2024-11-20'), status: 'approved' },
    { id: 'a-17', title: 'Blues Guitar Journey', authorId: 'mock', authorName: 'Robert Jackson', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400', rating: 4.7, views: 2680, duration: '40:35', uploadDate: new Date('2024-11-19'), status: 'approved' },
    { id: 'a-18', title: 'Mental Health Awareness', authorId: 'mock', authorName: 'Dr. Samantha Lee', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', rating: 4.9, views: 5240, duration: '37:45', uploadDate: new Date('2024-11-18'), status: 'approved' },
    { id: 'a-19', title: 'World Music Exploration', authorId: 'mock', authorName: 'Carlos Rivera', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400', rating: 4.8, views: 3450, duration: '51:20', uploadDate: new Date('2024-11-17'), status: 'approved' },
    { id: 'a-20', title: 'Science Explained Simply', authorId: 'mock', authorName: 'Dr. Michael Wong', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', rating: 4.7, views: 2980, duration: '43:10', uploadDate: new Date('2024-11-16'), status: 'approved' },
    { id: 'a-21', title: 'Ambient Study Music', authorId: 'mock', authorName: 'Sophia Bennett', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=400', rating: 4.9, views: 6120, duration: '60:00', uploadDate: new Date('2024-11-15'), status: 'approved' },
    { id: 'a-22', title: 'Career Guidance Series', authorId: 'mock', authorName: 'Jessica Martinez', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', rating: 4.8, views: 3780, duration: '38:50', uploadDate: new Date('2024-11-14'), status: 'approved' },
    { id: 'a-23', title: 'Hip Hop Beats Collection', authorId: 'mock', authorName: 'Tyrone Davis', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', rating: 4.6, views: 2540, duration: '34:30', uploadDate: new Date('2024-11-13'), status: 'approved' },
    { id: 'a-24', title: 'Nature Sounds for Relaxation', authorId: 'mock', authorName: 'Emma Green', authorRole: 'creator', type: 'audio', thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', rating: 4.9, views: 5680, duration: '45:00', uploadDate: new Date('2024-11-12'), status: 'approved' },

    // --- BLOG POSTS ---
    { id: 'b-1', title: 'The Evolution of Artificial Intelligence', authorId: 'mock', authorName: 'Dr. Sarah Williams', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400', rating: 4.8, views: 3400, uploadDate: new Date('2024-12-05'), status: 'approved', description: 'Exploring how AI has transformed from a theoretical concept to a practical tool that shapes our daily lives...', duration: '8 min' },
    { id: 'b-2', title: 'Sustainable Living: A Student\'s Guide', authorId: 'mock', authorName: 'Ahmed Khan', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400', rating: 4.9, views: 2890, uploadDate: new Date('2024-12-04'), status: 'approved', description: 'Practical tips and insights on how students can contribute to environmental sustainability on campus...', duration: '6 min' },
    { id: 'b-3', title: 'Mastering Time Management in University', authorId: 'mock', authorName: 'Emily Carter', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400', rating: 4.7, views: 4120, uploadDate: new Date('2024-12-03'), status: 'approved', description: 'Discover effective strategies to balance academics, extracurriculars, and personal life successfully...', duration: '7 min' },
    { id: 'b-4', title: 'The Rise of Digital Entrepreneurship', authorId: 'mock', authorName: 'James Peterson', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', rating: 4.6, views: 2560, uploadDate: new Date('2024-12-02'), status: 'approved', description: 'How the digital age has opened new opportunities for young entrepreneurs to launch successful ventures...', duration: '10 min' },
    { id: 'b-5', title: 'Building Your Personal Brand', authorId: 'mock', authorName: 'Rafiur Rahman', authorRole: 'creator', type: 'blog', thumbnail: 'https://plus.unsplash.com/premium_photo-1664301239248-e3a31726f9d8?w=400', rating: 4.9, views: 5200, uploadDate: new Date('2024-12-01'), status: 'approved', description: 'A comprehensive guide to creating and maintaining a strong personal brand in the digital age...', duration: '12 min' },
    { id: 'b-6', title: 'The Future of Remote Work', authorId: 'mock', authorName: 'Michelle Chen', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400', rating: 4.8, views: 3800, uploadDate: new Date('2024-11-30'), status: 'approved', description: 'Analyzing trends and predictions for the future of work in a post-pandemic world...', duration: '9 min' },
    { id: 'b-7', title: 'Mental Health Awareness for Students', authorId: 'mock', authorName: 'Dr. Hassan Ibrahim', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400', rating: 4.9, views: 4500, uploadDate: new Date('2024-11-29'), status: 'approved', description: 'Understanding the importance of mental health and resources available for university students...', duration: '11 min' },
    { id: 'b-8', title: 'Exploring Career Paths in Tech', authorId: 'mock', authorName: 'Rachel Kim', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400', rating: 4.7, views: 3200, uploadDate: new Date('2024-11-28'), status: 'approved', description: 'A detailed overview of various career opportunities in the technology industry for fresh graduates...', duration: '10 min' },
    { id: 'b-9', title: 'The Art of Effective Communication', authorId: 'mock', authorName: 'Daniel Martinez', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400', rating: 4.8, views: 2950, uploadDate: new Date('2024-11-27'), status: 'approved', description: 'Key principles and techniques to improve your communication skills in professional and personal settings...', duration: '8 min' },
    { id: 'b-10', title: 'Financial Literacy for Young Adults', authorId: 'mock', authorName: 'Sophia Anderson', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400', rating: 4.9, views: 4800, uploadDate: new Date('2024-11-26'), status: 'approved', description: 'Essential financial concepts every young adult should know to build a secure financial future...', duration: '13 min' },
    { id: 'b-11', title: 'Web Development Trends 2024', authorId: 'mock', authorName: 'Thomas Wright', authorRole: 'creator', type: 'blog', thumbnail: 'https://plus.unsplash.com/premium_photo-1678565869434-c81195861939?w=400', rating: 4.8, views: 3650, uploadDate: new Date('2024-11-25'), status: 'approved', description: 'Stay ahead of the curve with the latest web development trends and technologies shaping the industry...', duration: '9 min' },
    { id: 'b-12', title: 'Understanding Cryptocurrency', authorId: 'mock', authorName: 'Benjamin Moore', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1634704784915-aacf363b021f?w=400', rating: 4.7, views: 3100, uploadDate: new Date('2024-11-24'), status: 'approved', description: 'A beginner-friendly introduction to cryptocurrency, blockchain, and their potential impact on finance...', duration: '11 min' },
    { id: 'b-13', title: 'The Power of Networking', authorId: 'mock', authorName: 'Victoria Thompson', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400', rating: 4.9, views: 4200, uploadDate: new Date('2024-11-23'), status: 'approved', description: 'How to build meaningful professional connections that can accelerate your career growth...', duration: '7 min' },
    { id: 'b-14', title: 'Study Abroad: A Complete Guide', authorId: 'mock', authorName: 'Christopher Lee', authorRole: 'creator', type: 'blog', thumbnail: 'https://plus.unsplash.com/premium_photo-1683841527901-d2d926709203?w=400', rating: 4.8, views: 3900, uploadDate: new Date('2024-11-22'), status: 'approved', description: 'Everything you need to know about studying abroad, from applications to cultural adaptation...', duration: '14 min' },
    { id: 'b-15', title: 'Design Thinking Fundamentals', authorId: 'mock', authorName: 'Isabella Garcia', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400', rating: 4.7, views: 2780, uploadDate: new Date('2024-11-21'), status: 'approved', description: 'Learn the core principles of design thinking and how to apply them to solve complex problems...', duration: '10 min' },
    { id: 'b-16', title: 'Social Media Marketing Secrets', authorId: 'mock', authorName: 'Marcus Johnson', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', rating: 4.9, views: 5100, uploadDate: new Date('2024-11-20'), status: 'approved', description: 'Proven strategies to boost your social media presence and engage with your audience effectively...', duration: '8 min' },
    { id: 'b-17', title: 'Climate Change and Our Responsibility', authorId: 'mock', authorName: 'Dr. Elena Rodriguez', authorRole: 'creator', type: 'blog', thumbnail: 'https://plus.unsplash.com/premium_photo-1664298311043-46b3814a511f?w=400', rating: 4.8, views: 4350, uploadDate: new Date('2024-11-19'), status: 'approved', description: 'Understanding the science behind climate change and what each of us can do to make a difference...', duration: '12 min' },
    { id: 'b-18', title: 'Leadership Skills for the Future', authorId: 'mock', authorName: 'William Taylor', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400', rating: 4.7, views: 3450, uploadDate: new Date('2024-11-18'), status: 'approved', description: 'Developing the leadership qualities needed to thrive in an ever-changing business landscape...', duration: '9 min' },
    { id: 'b-19', title: 'The Psychology of Productivity', authorId: 'mock', authorName: 'Dr. Jennifer Davis', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400', rating: 4.9, views: 4890, uploadDate: new Date('2024-11-17'), status: 'approved', description: 'Scientific insights into what makes us productive and how to optimize your daily routine...', duration: '10 min' },
    { id: 'b-20', title: 'Exploring Data Science Careers', authorId: 'mock', authorName: 'Nathan Park', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', rating: 4.8, views: 3720, uploadDate: new Date('2024-11-16'), status: 'approved', description: 'An in-depth look at the growing field of data science and the skills needed to succeed...', duration: '11 min' },
    { id: 'b-21', title: 'Creative Problem Solving', authorId: 'mock', authorName: 'Olivia Martin', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400', rating: 4.7, views: 2890, uploadDate: new Date('2024-11-15'), status: 'approved', description: 'Techniques and frameworks for approaching problems creatively and finding innovative solutions...', duration: '8 min' },
    { id: 'b-22', title: 'The Internet of Things Revolution', authorId: 'mock', authorName: 'Alexander White', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400', rating: 4.8, views: 3340, uploadDate: new Date('2024-11-14'), status: 'approved', description: 'How IoT is transforming industries and creating new possibilities for smart living...', duration: '10 min' },
    { id: 'b-23', title: 'Work-Life Balance Strategies', authorId: 'mock', authorName: 'Grace Chen', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400', rating: 4.9, views: 5450, uploadDate: new Date('2024-11-13'), status: 'approved', description: 'Practical advice on maintaining a healthy balance between your professional and personal life...', duration: '7 min' },
    { id: 'b-24', title: 'Digital Privacy in Modern Age', authorId: 'mock', authorName: 'Robert Miller', authorRole: 'creator', type: 'blog', thumbnail: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400', rating: 4.8, views: 4120, uploadDate: new Date('2024-11-12'), status: 'approved', description: 'Understanding your digital footprint and how to protect your privacy online...', duration: '9 min' },
];

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
    const [posts, setPosts] = useState<Post[]>(() => {
        const storedPosts = localStorage.getItem(STORAGE_KEY);
        if (storedPosts) {
            try {
                return JSON.parse(storedPosts).map((p: any) => ({
                    ...p,
                    uploadDate: new Date(p.uploadDate),
                    status: p.status || 'approved'
                }));
            } catch (err) {
                console.error("Error parsing stored posts:", err);
                return INITIAL_POSTS;
            }
        }
        return INITIAL_POSTS;
    });

    // Save to Storage
    useEffect(() => {
        if (posts.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        }
    }, [posts]);

    const addPost = (newPostData: Omit<Post, 'id' | 'uploadDate' | 'status' | 'views' | 'rating'>) => {
        const newPost: Post = {
            ...newPostData,
            id: `${newPostData.type}-${Date.now()}`,
            uploadDate: new Date(),
            status: 'pending',
            views: 0,
            rating: 0,
        };
        setPosts(prev => [newPost, ...prev]);
    };

    const approvePost = (id: string) => {
        setPosts(prev => prev.map(post =>
            post.id === id ? { ...post, status: 'approved' } : post
        ));
    };

    const rejectPost = (id: string) => {
        setPosts(prev => prev.map(post =>
            post.id === id ? { ...post, status: 'rejected' } : post
        ));
    };

    const deletePost = (id: string) => {
        setPosts(prev => prev.filter(post => post.id !== id));
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
            getPostsByStatus,
            getPostsByType
        }}>
            {children}
        </PostContext.Provider>
    );
}
