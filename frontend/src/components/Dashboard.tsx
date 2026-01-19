import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { RoleBadge } from './auth/RoleBadge';
import { hasRole } from '../utils/permissions';
import { LayoutDashboard, Upload, Users, FileText, Trash2, Activity, TrendingUp, Heart, Video, Mic, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const { user } = useAuth();
    const { posts } = usePosts();
    const navigate = useNavigate();

    if (!user) return null;

    const isAdmin = hasRole(user, 'admin');
    const myPosts = posts
        .filter(post => String(post.authorId) === String(user.id))
        .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());

    const typeMeta = {
        video: { label: 'Video', icon: Video, badge: 'bg-orange-100 text-orange-700' },
        audio: { label: 'Audio', icon: Mic, badge: 'bg-teal-100 text-teal-700' },
        blog: { label: 'Blog', icon: BookOpen, badge: 'bg-indigo-100 text-indigo-700' },
    } as const;

    const statusMeta = {
        approved: { label: 'Approved', badge: 'bg-green-100 text-green-700' },
        pending: { label: 'Pending', badge: 'bg-yellow-100 text-yellow-700' },
        rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-700' },
    } as const;

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
        <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900 flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-orange-500" />
                        Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user.name}!</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Current Role:</span>
                    <RoleBadge role={user.role} size="lg" showLabel />
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {isAdmin ? (
                    <>
                        <StatCard title="Total Users" value="1,234" icon={Users} color="bg-blue-500" />
                        <StatCard title="Total Posts" value="856" icon={FileText} color="bg-orange-500" />
                        <StatCard title="Reports Pending" value="12" icon={Activity} color="bg-red-500" />
                        <StatCard title="Platform Visits" value="45.2k" icon={TrendingUp} color="bg-green-500" />
                    </>
                ) : (
                    <>
                        <StatCard title="My Uploads" value={`${myPosts.length}`} icon={Upload} color="bg-blue-500" />
                        <StatCard title="Total Views" value={`${myPosts.reduce((sum, post) => sum + (post.views || 0), 0).toLocaleString()}`} icon={TrendingUp} color="bg-orange-500" />
                        <StatCard title="Avg. Rating" value={`${myPosts.length ? (myPosts.reduce((sum, post) => sum + (post.votes || 0), 0) / myPosts.length).toFixed(1) : '0.0'}`} icon={Heart} color="bg-red-500" />
                        <StatCard title="Followers" value="156" icon={Users} color="bg-green-500" />
                    </>
                )}
            </motion.div>

            {/* Action Center - Only for Non-Viewers */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => navigate('/video')}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors font-medium"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Content
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => navigate('/garbage')}
                            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                        >
                            <Trash2 className="w-5 h-5" />
                            Manage Garbage Bin
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                    >
                        <Users className="w-5 h-5" />
                        Edit Profile
                    </button>
                </div>
            </motion.div>

            {/* Creator Content */}
            {!isAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4">My Content</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {myPosts.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No uploads yet. Share your first post to see it here.
                            </div>
                        ) : (
                            myPosts.map((post) => {
                                const type = typeMeta[post.type];
                                const status = statusMeta[post.status];
                                const TypeIcon = type.icon;

                                return (
                                    <div key={post.id} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                <TypeIcon className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{post.title}</div>
                                                <div className="text-xs text-gray-500">
                                                    {type.label} • {new Date(post.uploadDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${type.badge}`}>{type.label}</span>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.badge}`}>{status.label}</span>
                                            <span className="text-xs text-gray-500">{post.views.toLocaleString()} views</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
