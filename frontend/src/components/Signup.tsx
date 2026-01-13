import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Building2, Sparkles, Palette, Music, Video as VideoIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Signup() {
  const { signup, socialLogin } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'creator'>('viewer');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Student ID validation for creators
    if (role === 'creator' && !studentId.trim()) {
      setError('Student ID is required for Creators');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms and Conditions');
      return;
    }

    try {
      signup(name, email, password, role, studentId);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating Artwork Icons */}
        <motion.div
          className="absolute top-32 right-20"
          animate={{
            y: [-10, 10, -10]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <div className="w-16 h-16 bg-orange-500/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-orange-500/20">
            <Palette className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          className="absolute top-64 left-32"
          animate={{
            y: [10, -10, 10]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <div className="w-20 h-20 bg-orange-500/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-orange-500/20">
            <Music className="w-10 h-10 text-orange-300" />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-40 left-20"
          animate={{
            y: [-10, 10, -10]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <div className="w-14 h-14 bg-orange-500/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-orange-500/20">
            <VideoIcon className="w-7 h-7 text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-32 right-40"
          animate={{
            y: [10, -10, 10]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <div className="w-12 h-12 bg-orange-500/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-orange-500/20">
            <Sparkles className="w-6 h-6 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ fontFamily: 'AbSans, sans-serif' }}
      >
        {/* Logo & Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/50"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-white text-2xl">UIU</span>
          </motion.div>
          <h1 className="text-white mb-2 font-auth text-4xl font-bold" style={{ fontFamily: 'Sadhan' }}>Create Your Account</h1>
          <p className="text-orange-200">Join the UIU Talent Showcase community</p>
          <p className="text-orange-300 text-xs mt-3 italic">"Your talent, your world"</p>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-orange-500/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ fontFamily: 'AbSans, sans-serif' }}
        >
          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <motion.div
              className="grid grid-cols-2 gap-3 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <button
                type="button"
                onClick={() => setRole('viewer')}
                className={`p-4 rounded-xl border-2 transition-all text-center ${role === 'viewer' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-orange-200'}`}
              >
                <Eye className={`w-6 h-6 mx-auto mb-2 ${role === 'viewer' ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className="font-bold block text-sm">Viewer</span>
                <span className="text-xs opacity-75">I want to explore content</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`p-4 rounded-xl border-2 transition-all text-center ${role === 'creator' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-orange-200'}`}
              >
                <Sparkles className={`w-6 h-6 mx-auto mb-2 ${role === 'creator' ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className="font-bold block text-sm">Creator</span>
                <span className="text-xs opacity-75">I want to upload talent</span>
              </button>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 text-red-500 text-sm p-3 rounded-lg flex items-center gap-2 mb-4"
              >
                <span className="block w-1.5 h-1.5 bg-red-500 rounded-full" />
                {error}
              </motion.div>
            )}

            {/* Full Name Input */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ fontFamily: 'AbSans' }}
            >
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all hover:border-orange-300"
                  placeholder="Your Full Name"
                  required
                />
              </div>
            </motion.div>

            {/* Email Input */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'AbSans' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all hover:border-orange-300"
                  placeholder="example@uiu.ac.bd"
                  required
                />
              </div>
            </motion.div>

            {/* Student ID Input - Conditional */}
            {role === 'creator' && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'AbSans' }}>
                  Student ID <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="studentId"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all hover:border-orange-300"
                    placeholder="011221345"
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Password Input */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'AbSans' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all hover:border-orange-300"
                  placeholder="Min. 8 chars with uppercase & numbers"
                  required
                  minLength={8}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-2" style={{ fontFamily: 'AbSans' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all hover:border-orange-300"
                  placeholder="Re-enter password"
                  required
                  minLength={8}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex gap-1 mb-1">
                  <motion.div
                    className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-orange-500' : 'bg-gray-200'}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className={`h-1 flex-1 rounded ${password.length >= 10 && /[A-Z]/.test(password) ? 'bg-orange-500' : 'bg-gray-200'}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  />
                  <motion.div
                    className={`h-1 flex-1 rounded ${password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-orange-500' : 'bg-gray-200'}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  />
                </div>
                <p className="text-gray-600">
                  {password.length < 8 && 'Weak password'}
                  {password.length >= 8 && password.length < 10 && 'Fair password'}
                  {password.length >= 10 && /[A-Z]/.test(password) && 'Good password'}
                  {password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && 'Strong password'}
                </p>
              </motion.div>
            )}

            {/* Terms & Conditions */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 mt-1"
                  required
                />
                <span className="text-gray-700" style={{ fontFamily: 'AbSans' }}>
                  I agree to the{' '}
                  <button type="button" className="text-orange-600 hover:text-orange-700">
                    Terms and Conditions
                  </button>
                  {' '}and{' '}
                  <button type="button" className="text-orange-600 hover:text-orange-700">
                    Privacy Policy
                  </button>
                </span>
              </label>
            </motion.div>

            {/* Sign Up Button */}
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus className="w-5 h-5" />
              Create Account
            </motion.button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-gray-500">or</span>
              </div>
            </div>

            {/* Social Signup Options */}
            <motion.div
              className="grid grid-cols-2 gap-3 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <motion.button
                type="button"
                onClick={() => socialLogin('google')}
                className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.05, borderColor: "#f97316" }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </motion.button>
              <motion.button
                type="button"
                onClick={() => socialLogin('facebook')}
                className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.05, borderColor: "#f97316" }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </motion.button>
            </motion.div>

            {/* Login Link */}
            <motion.p
              className="text-center text-gray-600"
              style={{ fontFamily: 'AbSans' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              Already have an account?{' '}
              <motion.button
                type="button"
                onClick={() => navigate('/login')}
                className="text-orange-600 hover:text-orange-700 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Sign in
              </motion.button>
            </motion.p>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-orange-200/60 mt-6"
          style={{ fontFamily: 'AbSans' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          © 2026 UIU Talent Showcase. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
