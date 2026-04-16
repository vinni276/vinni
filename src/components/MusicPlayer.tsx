import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'Neon Drive',
    artist: 'AI Generator Alpha',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    color: 'cyan',
  },
  {
    id: 2,
    title: 'Cyber City',
    artist: 'AI Generator Beta',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    color: 'pink',
  },
  {
    id: 3,
    title: 'Synthwave Loop',
    artist: 'AI Generator Gamma',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    color: 'green',
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => {
        // Handle autoplay restrictions
        setIsPlaying(false);
      });
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const percentage = x / bounds.width;
      audioRef.current.currentTime = percentage * duration;
      setProgress(percentage * duration);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'cyan': return 'text-cyan-400 neon-text-cyan bg-cyan-500';
      case 'pink': return 'text-pink-500 neon-text-pink bg-pink-500';
      case 'green': return 'text-green-400 neon-text-green bg-green-500';
      default: return 'text-cyan-400 neon-text-cyan bg-cyan-500';
    }
  };

  const colorClasses = getColorClasses(currentTrack.color);
  const textColor = colorClasses.split(' ')[0];
  const neonText = colorClasses.split(' ')[1];
  const bgColor = colorClasses.split(' ')[2];

  return (
    <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 ${bgColor} rounded-full blur-[100px] opacity-20`}></div>
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
      />

      <div className="flex flex-col space-y-6 relative z-10">
        {/* Track Info */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-2xl font-bold font-mono tracking-tight ${textColor} ${neonText}`}>
              {currentTrack.title}
            </h3>
            <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest mt-1">
              {currentTrack.artist}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-full border border-zinc-800 bg-zinc-900">
            <div className={`w-4 h-4 rounded-full ${bgColor} ${isPlaying ? 'animate-pulse shadow-[0_0_15px_currentColor]' : ''}`}></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div 
            className="h-2 bg-zinc-800 rounded-full cursor-pointer overflow-hidden relative"
            onClick={(e) => { handleProgressClick(e); e.currentTarget.blur(); }}
            tabIndex={0}
          >
            <div 
              className={`absolute top-0 left-0 h-full ${bgColor} shadow-[0_0_10px_currentColor] transition-all duration-100`}
              style={{ width: `${(progress / (duration || 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-zinc-500">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <button 
            onClick={(e) => { toggleMute(); e.currentTarget.blur(); }}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <div className="flex items-center space-x-6">
            <button 
              onClick={(e) => { handlePrev(); e.currentTarget.blur(); }}
              className="p-2 text-zinc-300 hover:text-white transition-colors"
            >
              <SkipBack size={24} />
            </button>
            
            <button 
              onClick={(e) => { togglePlay(); e.currentTarget.blur(); }}
              className={`p-4 rounded-full border-2 border-zinc-700 hover:border-zinc-500 transition-all ${isPlaying ? `border-${currentTrack.color}-500 shadow-[0_0_15px_rgba(0,0,0,0.5)]` : ''}`}
            >
              {isPlaying ? (
                <Pause size={28} className={textColor} />
              ) : (
                <Play size={28} className="text-white ml-1" />
              )}
            </button>

            <button 
              onClick={(e) => { handleNext(); e.currentTarget.blur(); }}
              className="p-2 text-zinc-300 hover:text-white transition-colors"
            >
              <SkipForward size={24} />
            </button>
          </div>

          <div className="w-9"></div> {/* Spacer for balance */}
        </div>
      </div>
    </div>
  );
}
