import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Post } from '../types/auth';
import { buildMediaUrl } from '../utils/media';

interface AudioPlayerContextType {
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
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

interface AudioPlayerProviderProps {
  children: ReactNode;
}

const isAudioFile = (value?: string) => {
  if (!value) return false;
  const normalized = value.includes('.') ? value : `.${value}`;
  return /\.(mp3|wav|flac|aac|ogg|m4a)$/i.test(normalized);
};

const getAudioSource = (post: Post | null) => {
  if (!post) return '';
  const media = Array.isArray(post.media) ? post.media : [];
  const mediaFile = media.find(item =>
    isAudioFile(item.file_path) || isAudioFile(item.file_type || '')
  );
  if (mediaFile?.file_path) {
    return buildMediaUrl(mediaFile.file_path);
  }
  if (isAudioFile(post.thumbnail)) {
    return buildMediaUrl(post.thumbnail);
  }
  return '';
};

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<Post | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handleTimeUpdate = () => setCurrentTime(audioEl.currentTime);
    const handleLoadedMetadata = () => setDuration(audioEl.duration || 0);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audioEl.addEventListener('timeupdate', handleTimeUpdate);
    audioEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioEl.addEventListener('ended', handleEnded);
    audioEl.addEventListener('play', handlePlay);
    audioEl.addEventListener('pause', handlePause);

    return () => {
      audioEl.removeEventListener('timeupdate', handleTimeUpdate);
      audioEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioEl.removeEventListener('ended', handleEnded);
      audioEl.removeEventListener('play', handlePlay);
      audioEl.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.volume = volume;
    audioEl.muted = isMuted;
  }, [volume, isMuted]);

  const loadTrack = (post: Post, autoplay = true) => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    const src = getAudioSource(post);
    if (!src) return;

    const isSameTrack = track && String(track.id) === String(post.id) && audioEl.src === src;
    if (isSameTrack) {
      if (autoplay && audioEl.paused) {
        audioEl.play().catch(() => setIsPlaying(false));
      }
      return;
    }

    setTrack(post);
    audioEl.src = src;
    audioEl.load();
    setCurrentTime(0);
    setDuration(0);

    if (autoplay) {
      audioEl.play().catch(() => setIsPlaying(false));
    } else {
      setIsPlaying(false);
    }
  };

  const play = () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.play().catch(() => setIsPlaying(false));
  };

  const pause = () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.pause();
  };

  const togglePlay = () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    if (audioEl.paused) {
      play();
    } else {
      pause();
    }
  };

  const seek = (time: number) => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    const clamped = Math.max(0, Math.min(time, duration || 0));
    audioEl.currentTime = clamped;
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
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.pause();
    audioEl.removeAttribute('src');
    audioEl.load();
    setTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  return (
    <AudioPlayerContext.Provider value={{
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
    }}>
      <audio ref={audioRef} preload="metadata" />
      {children}
    </AudioPlayerContext.Provider>
  );
}
