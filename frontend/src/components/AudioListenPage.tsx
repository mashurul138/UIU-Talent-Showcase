import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, ChevronLeft } from 'lucide-react';
import { usePosts } from '../contexts/PostContext';
import type { Post } from '../types/auth';

export function AudioListenPage() {
    const { id } = useParams();
    const { posts } = usePosts();

    // Derive audio directly to avoid first-render null state
    const audio = useMemo(() => {
        if (!id || posts.length === 0) return null;
        return posts.find(p => String(p.id) === String(id)) || null;
    }, [id, posts]);

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [waveformData, setWaveformData] = useState<number[]>([]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const audioEl = audioRef.current;
        if (!audioEl) return;

        const handleTimeUpdate = () => setCurrentTime(audioEl.currentTime);
        const handleLoadedMetadata = () => setAudioDuration(audioEl.duration);
        const handleEnded = () => setIsPlaying(false);

        audioEl.addEventListener('timeupdate', handleTimeUpdate);
        audioEl.addEventListener('loadedmetadata', handleLoadedMetadata);
        audioEl.addEventListener('ended', handleEnded);

        return () => {
            audioEl.removeEventListener('timeupdate', handleTimeUpdate);
            audioEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audioEl.removeEventListener('ended', handleEnded);
        };
    }, [audio]);

    useEffect(() => {
        generateWaveform();
    }, []);

    const generateWaveform = () => {
        const bars = 60;
        const data: number[] = [];
        for (let i = 0; i < bars; i++) {
            const height = Math.random() * 60 + 20;
            data.push(height);
        }
        setWaveformData(data);
    };

    const drawWaveform = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const barWidth = width / waveformData.length;
        const progress = audioDuration > 0 ? currentTime / audioDuration : 0;

        ctx.clearRect(0, 0, width, height);

        waveformData.forEach((barHeight, index) => {
            const x = index * barWidth;
            const isActive = index / waveformData.length < progress;
            const barHeightInPixels = (barHeight / 100) * height;

            ctx.fillStyle = isActive ? '#10b981' : '#374151';

            ctx.beginPath();
            // @ts-ignore
            if (ctx.roundRect) {
                ctx.roundRect(x + 1, (height - barHeightInPixels) / 2, barWidth - 2, barHeightInPixels, 2);
            } else {
                ctx.rect(x + 1, (height - barHeightInPixels) / 2, barWidth - 2, barHeightInPixels);
            }
            ctx.fill();
        });
    };

    useEffect(() => {
        drawWaveform();
    }, [currentTime, audioDuration, waveformData]);

    const togglePlay = () => {
        const audioEl = audioRef.current;
        if (!audioEl) return;

        if (isPlaying) {
            audioEl.pause();
        } else {
            audioEl.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = progressContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const audioEl = audioRef.current;

        if (audioEl) {
            audioEl.currentTime = percentage * audioEl.duration;
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);

        const audioEl = audioRef.current;
        if (audioEl) {
            audioEl.volume = newVolume;
            audioEl.muted = newVolume === 0;
        }
    };

    const toggleMute = () => {
        const audioEl = audioRef.current;
        if (!audioEl) return;

        if (isMuted) {
            audioEl.muted = false;
            audioEl.volume = volume || 1;
            setIsMuted(false);
        } else {
            audioEl.muted = true;
            setIsMuted(true);
        }
    };

    const skipBackward = () => {
        const audioEl = audioRef.current;
        if (audioEl) {
            audioEl.currentTime = Math.max(0, audioEl.currentTime - 15);
        }
    };

    const skipForward = () => {
        const audioEl = audioRef.current;
        if (audioEl) {
            audioEl.currentTime = Math.min(audioDuration, audioEl.currentTime + 15);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Handle loading state
    if (posts.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-white bg-[#0a0a0a]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-medium">Loading audio...</h2>
                </div>
            </div>
        );
    }

    if (!audio) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-white bg-[#0a0a0a]">
                <div className="text-center p-8 bg-zinc-900 rounded-3xl border border-white/5 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-4">Audio not found</h2>
                    <p className="text-zinc-400 mb-6 max-w-sm">The audio content you're looking for doesn't exist or has been removed.</p>
                    <Link to="/audio" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-full font-bold hover:bg-teal-700 transition-all hover:scale-105 active:scale-95">
                        Return to Audio Portal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0a0a0a] -mx-4 -mt-8 min-h-screen text-white flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-5xl bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 p-6 md:p-12 relative">
                <audio ref={audioRef} src={audio.thumbnail} />

                <div className="flex items-center mb-8">
                    <Link to="/audio" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Portal</span>
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative group">
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-2xl bg-[#e8e6e1] flex items-center justify-center">
                            <img
                                src={audio.thumbnail}
                                alt={audio.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>

                        {isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Play className="w-16 h-16 text-white fill-white opacity-80" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight truncate">{audio.title}</h1>
                        <p className="text-xl text-gray-400 font-medium mb-6">{audio.authorName}</p>

                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <button
                                onClick={() => setIsShuffle(!isShuffle)}
                                className={`p-2 rounded-full transition-colors ${isShuffle ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Shuffle className="w-6 h-6" />
                            </button>

                            <button onClick={skipBackward} className="p-3 text-gray-400 hover:text-white transition-colors">
                                <SkipBack className="w-8 h-8 fill-current" />
                            </button>

                            <button
                                onClick={togglePlay}
                                className="w-20 h-20 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/30 transition-all hover:scale-105"
                            >
                                {isPlaying ? <Pause className="w-10 h-10 text-white fill-current" /> : <Play className="w-10 h-10 text-white fill-current ml-1" />}
                            </button>

                            <button onClick={skipForward} className="p-3 text-gray-400 hover:text-white transition-colors">
                                <SkipForward className="w-8 h-8 fill-current" />
                            </button>

                            <button
                                onClick={() => setIsRepeat(!isRepeat)}
                                className={`p-2 rounded-full transition-colors ${isRepeat ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Repeat className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 space-y-4">
                    <div className="flex items-center justify-between text-sm font-mono text-gray-400">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(audioDuration)}</span>
                    </div>

                    <div
                        ref={progressContainerRef}
                        className="relative h-16 bg-gray-800/30 rounded-xl cursor-pointer group/progress overflow-hidden border border-white/5"
                        onClick={handleProgressClick}
                    >
                        <canvas ref={canvasRef} width={1200} height={64} className="w-full h-full" />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={`p-2 transition-all transform hover:scale-125 ${isLiked ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                        </button>

                        <div className="flex items-center gap-4 flex-1 max-w-[250px] ml-auto">
                            <button onClick={toggleMute} className="text-gray-400 hover:text-white">
                                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-full h-1.5 accent-green-500 cursor-pointer bg-gray-800 rounded-full"
                            />
                        </div>
                    </div>
                </div>

                {isPlaying && (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
                )}
            </div>
        </div>
    );
}
