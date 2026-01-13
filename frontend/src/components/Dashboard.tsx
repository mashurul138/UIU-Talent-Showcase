import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from './auth/RoleBadge';
import { hasRole } from '../utils/permissions';
import { LayoutDashboard, Upload, Users, FileText, Trash2, Activity, TrendingUp, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const isAdmin = hasRole(user, 'admin');

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
                        <StatCard title="My Uploads" value="24" icon={Upload} color="bg-blue-500" />
                        <StatCard title="Total Views" value="8.5k" icon={TrendingUp} color="bg-orange-500" />
                        <StatCard title="Avg. Rating" value="4.8" icon={Heart} color="bg-red-500" />
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

            {/* Recent Activity Mockup */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {isAdmin ? 'New user registration: John Doe' : 'Your video "Intro to UI Design" reached 1k views'}
                                </p>
                                <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
