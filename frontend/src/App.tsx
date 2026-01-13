import { useEffect, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { Dashboard } from './components/Dashboard';
import { VideoPortal } from './components/VideoPortal';
import { VideoWatchPage } from './components/VideoWatchPage';
import { AudioPortal } from './components/AudioPortal';
import { AudioListenPage } from './components/AudioListenPage';
import { BlogPortal } from './components/BlogPortal';
import { Leaderboard } from './components/Leaderboard';
import { PendingPosts } from './components/PendingPosts';
import { GarbageBin } from './components/GarbageBin';
import { Profile } from './components/Profile';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Footer } from './components/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PostProvider } from './contexts/PostContext';
import { LeaderboardProvider } from './contexts/LeaderboardContext';
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';
import { AdminDashboard } from './components/AdminDashboard';
import { canAccessGarbageBin } from './utils/permissions';
import Lenis from 'lenis';

function MainLayout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Navbar currentPath={location.pathname} onLogout={logout} user={user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AppContent() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    document.title = 'UIU Talent Showcase - LionHeart';

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 128, 128);
      gradient.addColorStop(0, '#f97316');
      gradient.addColorStop(1, '#ea580c');

      const radius = 24;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(128 - radius, 0);
      ctx.quadraticCurveTo(128, 0, 128, radius);
      ctx.lineTo(128, 128 - radius);
      ctx.quadraticCurveTo(128, 128, 128 - radius, 128);
      ctx.lineTo(radius, 128);
      ctx.quadraticCurveTo(0, 128, 0, 128 - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 52px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('UIU', 64, 70);

      const faviconUrl = canvas.toDataURL('image/png');

      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(favicon => favicon.remove());

      const sizes = ['16x16', '32x32', '48x48', '64x64'];
      sizes.forEach(size => {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.sizes = size;
        link.href = faviconUrl;
        document.head.appendChild(link);
      });

      const shortcutIcon = document.createElement('link');
      shortcutIcon.rel = 'shortcut icon';
      shortcutIcon.type = 'image/png';
      shortcutIcon.href = faviconUrl;
      document.head.appendChild(shortcutIcon);

      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = faviconUrl;
      document.head.appendChild(appleTouchIcon);
    }
  }, []);

  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <HomePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute minimumRole="creator">
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/video"
        element={
          <ProtectedRoute minimumRole="viewer">
            <MainLayout>
              <VideoPortal />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/video/:id"
        element={
          <ProtectedRoute minimumRole="viewer">
            <MainLayout>
              <VideoWatchPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audio"
        element={
          <ProtectedRoute minimumRole="viewer">
            <MainLayout>
              <AudioPortal />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audio/:id"
        element={
          <ProtectedRoute minimumRole="viewer">
            <MainLayout>
              <AudioListenPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/blogs"
        element={
          <ProtectedRoute minimumRole="viewer">
            <MainLayout>
              <BlogPortal />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute minimumRole="viewer">
            <MainLayout>
              <Leaderboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pending-posts"
        element={
          <ProtectedRoute minimumRole="admin">
            <MainLayout>
              <PendingPosts />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/garbage"
        element={
          <ProtectedRoute>
            <MainLayout>
              {canAccessGarbageBin(user) ? <GarbageBin /> : <Navigate to="/" replace />}
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute minimumRole="viewer">
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute minimumRole="admin">
            <MainLayout>
              <AdminDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PostProvider>
          <LeaderboardProvider>
            <AppContent />
          </LeaderboardProvider>
        </PostProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

