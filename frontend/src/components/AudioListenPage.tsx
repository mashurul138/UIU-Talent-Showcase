import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, ChevronLeft } from 'lucide-react';
import { usePosts } from '../contexts/PostContext';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { api } from '../services/api';
import { buildMediaUrl } from '../utils/media';
import { StarRating } from './StarRating';

export function AudioListenPage() {
    const { id } = useParams();
    const { posts, ratePost, updatePostViews } = usePosts();
    const viewIncrementedRef = useRef<string | null>(null);

    // Derive audio directly to avoid first-render null state
    const audio = useMemo(() => {
        if (!id || posts.length === 0) return null;
        return posts.find(p => String(p.id) === String(id)) || null;
    }, [id, posts]);

    // Increment view count on mount
    useEffect(() => {
        if (!id || !audio) return;
        if (viewIncrementedRef.current === id) return;
        viewIncrementedRef.current = id;

        api.posts.incrementView(id).then(data => {
            updatePostViews(id, data.views);
        }).catch(console.error);
    }, [id, audio, updatePostViews]);

    const { track, isPlaying, currentTime, duration: audioDuration, volume, isMuted, loadTrack, togglePlay: toggleAudio, seek, setVolume: setAudioVolume, toggleMute: toggleAudioMute } = useAudioPlayer();
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [waveformData, setWaveformData] = useState<number[]>([]);

    useEffect(() => {
        if (!audio) return;
        if (!track || String(track.id) !== String(audio.id)) {
            loadTrack(audio, true);
        }
    }, [audio, track, loadTrack]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

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

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = progressContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        if (audioDuration > 0) {
            seek(percentage * audioDuration);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setAudioVolume(newVolume);
    };

    const skipBackward = () => {
        seek(Math.max(0, currentTime - 15));
    };

    const skipForward = () => {
        seek(Math.min(audioDuration, currentTime + 15));
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
                <div className="flex items-center mb-8 relative z-20">
                    <Link to="/audio" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Portal</span>
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="relative group">
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-2xl bg-[#e8e6e1] flex items-center justify-center">
                            <img
                                src={!audio.thumbnail || (audio.thumbnail.match(/\.(mp3|wav|flac|aac|ogg|mp4|mov|avi|webm)$/i) || !audio.thumbnail.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                    ? 'https://images.unsplash.com/photo-1478737270239-2f52b27e9088?w=800&auto=format&fit=crop'
                                    : buildMediaUrl(audio.thumbnail)}
                                alt={audio.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://images.unsplash.com/photo-1478737270239-2f52b27e9088?w=800&auto=format&fit=crop';
                                }}
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
                        <p className="text-xl text-gray-400 font-medium mb-2">{audio.authorName}</p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-6 text-sm text-gray-400">
                            <StarRating
                                value={audio.rating || 0}
                                userValue={audio.userRating || 0}
                                onChange={(value) => ratePost(audio.id, value)}
                                size="sm"
                                colorClass="text-green-500"
                                inactiveColorClass="text-gray-600"
                            />
                            <span className="text-xs text-gray-400">{(audio.rating || 0).toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({audio.votes || 0})</span>
                        </div>

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
                                onClick={toggleAudio}
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
                            <button onClick={toggleAudioMute} className="text-gray-400 hover:text-white">
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
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"
                        style={{ pointerEvents: 'none' }}
                    />
                )}
            </div>
        </div>
    );
}
