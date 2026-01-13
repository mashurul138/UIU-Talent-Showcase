import { Video, Mic, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();

  const portals = [
    {
      path: '/video',
      title: 'Video Portal',
      description: 'Share and discover amazing video content from talented creators',
      icon: Video,
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      hoverShadow: 'hover:shadow-orange-200',
    },
    {
      path: '/audio',
      title: 'Audio Portal',
      description: 'Listen to podcasts, music, and audio stories from our community',
      icon: Mic,
      gradient: 'from-teal-600 to-cyan-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-300',
      hoverShadow: 'hover:shadow-teal-200',
    },
    {
      path: '/blogs',
      title: 'Blog Portal',
      description: 'Read insightful articles and stories written by our talented writers',
      icon: BookOpen,
      gradient: 'from-indigo-600 to-purple-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-300',
      hoverShadow: 'hover:shadow-indigo-200',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-heading text-5xl font-bold text-gray-900 mb-4 tracking-tight">Welcome to UIU Talent Showcase</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Discover and share amazing content across our three specialized portals. Choose a portal below to get started.
        </p>
      </motion.div>

      {/* Portal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {portals.map((portal, index) => {
          const Icon = portal.icon;
          return (
            <motion.div
              key={portal.path}
              className={`${portal.bgColor} border-2 ${portal.borderColor} rounded-2xl p-8 transition-all hover:scale-105 ${portal.hoverShadow} hover:shadow-2xl cursor-pointer`}
              onClick={() => navigate(portal.path)}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Icon */}
              <motion.div
                className={`w-20 h-20 bg-gradient-to-br ${portal.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <h2 className="font-heading text-2xl font-semibold text-center mb-3 text-gray-900 tracking-tight">{portal.title}</h2>

              {/* Description */}
              <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                {portal.description}
              </p>

              {/* Button */}
              <motion.button
                className={`w-full bg-gradient-to-r ${portal.gradient} text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md font-medium tracking-wide`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(portal.path);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Enter Portal
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Section */}
      <motion.div
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <motion.div
          className="bg-white rounded-xl p-6 shadow-md text-center border-l-4 border-orange-500"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-xs font-medium text-orange-600 mb-2 uppercase tracking-wider">Total Videos</div>
          <div className="font-mono text-4xl font-bold text-gray-900">1,234</div>
        </motion.div>
        <motion.div
          className="bg-white rounded-xl p-6 shadow-md text-center border-l-4 border-orange-500"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-xs font-medium text-orange-600 mb-2 uppercase tracking-wider">Audio Tracks</div>
          <div className="font-mono text-4xl font-bold text-gray-900">856</div>
        </motion.div>
        <motion.div
          className="bg-white rounded-xl p-6 shadow-md text-center border-l-4 border-orange-500"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-xs font-medium text-orange-600 mb-2 uppercase tracking-wider">Blog Posts</div>
          <div className="font-mono text-4xl font-bold text-gray-900">2,109</div>
        </motion.div>
      </motion.div>

      {/* Additional Info Section */}
      <motion.div
        className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-heading text-3xl font-bold text-white mb-4 tracking-tight">Join Our Creative Community</h2>
            <p className="text-orange-100 mb-6 leading-relaxed">
              Connect with talented creators, share your work, and get inspired by amazing content from students across UIU. Start your creative journey today!
            </p>
            <motion.button
              className="bg-white text-orange-600 px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors"
              onClick={() => navigate('/video')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Now
            </motion.button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="font-mono text-2xl font-bold text-white mb-1">5,000+</div>
              <p className="text-xs text-orange-100 uppercase tracking-wide">Active Users</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="font-mono text-2xl font-bold text-white mb-1">10,000+</div>
              <p className="text-xs text-orange-100 uppercase tracking-wide">Total Posts</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="font-mono text-2xl font-bold text-white mb-1">50K+</div>
              <p className="text-xs text-orange-100 uppercase tracking-wide">Views Daily</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="font-mono text-2xl font-bold text-white mb-1">4.8★</div>
              <p className="text-xs text-orange-100 uppercase tracking-wide">Avg Rating</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
