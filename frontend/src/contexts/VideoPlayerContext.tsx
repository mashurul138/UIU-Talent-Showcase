import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Post } from '../types/auth';
import { buildMediaUrl } from '../utils/media';

interface VideoPlayerContextType {
  track: Post | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  loadTrack: (post: Post, autoplay?: boolean) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  stop: () => void;
  setPortalTarget: (target: HTMLElement | null) => void;
  clearPortalTarget: (target: HTMLElement | null) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export const useVideoPlayer = () => {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('useVideoPlayer must be used within VideoPlayerProvider');
  }
  return context;
};

interface VideoPlayerProviderProps {
  children: ReactNode;
}

const isVideoFile = (value?: string) => {
  if (!value) return false;
  const normalized = value.includes('.') ? value : `.${value}`;
  return /\.(mp4|mov|avi|webm|mkv)$/i.test(normalized);
};

const isImageFile = (value?: string) => {
  if (!value) return false;
  const normalized = value.includes('.') ? value : `.${value}`;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(normalized);
};

const getVideoSource = (post: Post | null) => {
  if (!post) return '';
  const media = Array.isArray(post.media) ? post.media : [];
  const mediaFile = media.find(item =>
    isVideoFile(item.file_path) || isVideoFile(item.file_type || '')
  );
  if (mediaFile?.file_path) {
    return buildMediaUrl(mediaFile.file_path);
  }
  if (isVideoFile(post.thumbnail)) {
    return buildMediaUrl(post.thumbnail);
  }
  return '';
};

const getPosterSource = (post: Post | null) => {
  if (!post || !post.thumbnail) return '';
  if (isImageFile(post.thumbnail)) {
    return buildMediaUrl(post.thumbnail);
  }
  return '';
};

export function VideoPlayerProvider({ children }: VideoPlayerProviderProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallbackRef = useRef<HTMLDivElement | null>(null);
  const pendingRef = useRef<{ post: Post; autoplay: boolean } | null>(null);

  const [track, setTrack] = useState<Post | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const portalTargetRef = useRef<HTMLElement | null>(null);
  const [portalTarget, setPortalTargetState] = useState<HTMLElement | null>(null);

  const setPortalTarget = (target: HTMLElement | null) => {
    if (target) {
      portalTargetRef.current = target;
      setPortalTargetState(target);
      return;
    }
    if (fallbackRef.current) {
      portalTargetRef.current = fallbackRef.current;
      setPortalTargetState(fallbackRef.current);
    }
  };

  const clearPortalTarget = (target: HTMLElement | null) => {
    if (portalTargetRef.current !== target) {
      return;
    }
    if (fallbackRef.current) {
      portalTargetRef.current = fallbackRef.current;
      setPortalTargetState(fallbackRef.current);
    } else {
      portalTargetRef.current = null;
      setPortalTargetState(null);
    }
  };

  useLayoutEffect(() => {
    if (!portalTargetRef.current && fallbackRef.current) {
      portalTargetRef.current = fallbackRef.current;
      setPortalTargetState(fallbackRef.current);
    }
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleTimeUpdate = () => setCurrentTime(videoEl.currentTime);
    const handleLoadedMetadata = () => setDuration(videoEl.duration || 0);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoEl.addEventListener('ended', handleEnded);
    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);

    return () => {
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
      videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoEl.removeEventListener('ended', handleEnded);
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.volume = volume;
    videoEl.muted = isMuted;
  }, [volume, isMuted]);

  const loadTrackIntoElement = (post: Post, autoplay: boolean) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const src = getVideoSource(post);
    if (!src) return;

    const poster = getPosterSource(post);
    const isSameTrack = track && String(track.id) === String(post.id) && videoEl.src === src;
    if (isSameTrack) {
      if (poster && videoEl.poster !== poster) {
        videoEl.poster = poster;
      }
      if (autoplay && videoEl.paused) {
        videoEl.play().catch(() => setIsPlaying(false));
      }
      return;
    }

    videoEl.src = src;
    if (poster) {
      videoEl.poster = poster;
    } else {
      videoEl.removeAttribute('poster');
    }
    videoEl.load();
    setCurrentTime(0);
    setDuration(0);

    if (autoplay) {
      videoEl.play().catch(() => setIsPlaying(false));
    } else {
      setIsPlaying(false);
    }
  };

  const loadTrack = (post: Post, autoplay = true) => {
    setTrack(post);
    const videoEl = videoRef.current;
    if (!videoEl) {
      pendingRef.current = { post, autoplay };
      return;
    }
    loadTrackIntoElement(post, autoplay);
  };

  useEffect(() => {
    if (!videoRef.current || !pendingRef.current) return;
    const pending = pendingRef.current;
    pendingRef.current = null;
    loadTrackIntoElement(pending.post, pending.autoplay);
  }, [portalTarget, track]);

  const play = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (!videoEl.src && track) {
      loadTrackIntoElement(track, true);
      return;
    }
    videoEl.play().catch(() => setIsPlaying(false));
  };

  const pause = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.pause();
  };

  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (!videoEl.src && track) {
      loadTrackIntoElement(track, true);
      return;
    }
    if (videoEl.paused) {
      play();
    } else {
      pause();
    }
  };

  const seek = (time: number) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const clamped = Math.max(0, Math.min(time, duration || 0));
    videoEl.currentTime = clamped;
  };

  const setVolume = (value: number) => {
    const clamped = Math.max(0, Math.min(value, 1));
    setVolumeState(clamped);
    if (clamped === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const stop = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.removeAttribute('poster');
    videoEl.load();
    setTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const videoElement = (
    <video
      ref={videoRef}
      className="w-full object-contain"
      style={{ height: '100%' }}
      playsInline
      preload="metadata"
    />
  );

  return (
    <VideoPlayerContext.Provider value={{
      track,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      loadTrack,
      play,
      pause,
      togglePlay,
      seek,
      setVolume,
      toggleMute,
      stop,
      setPortalTarget,
      clearPortalTarget,
    }}>
      <div
        ref={fallbackRef}
        style={{
          position: 'fixed',
          right: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          pointerEvents: 'none',
          opacity: 0,
        }}
      />
      {portalTarget || fallbackRef.current ? createPortal(videoElement, portalTarget ?? fallbackRef.current!) : null}
      {children}
    </VideoPlayerContext.Provider>
  );
}
