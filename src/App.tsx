import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Atmospheric Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Header */}
      <div className="absolute top-8 left-0 w-full text-center pointer-events-none">
        <h1 className="text-5xl font-bold font-mono tracking-tighter neon-text-cyan text-cyan-400">
          NEON<span className="neon-text-pink text-pink-500">SNAKE</span>
        </h1>
        <p className="text-zinc-500 font-mono text-sm tracking-widest mt-2 uppercase">
          Retro Arcade x Synthwave
        </p>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center mt-16">
        <SnakeGame />
      </div>

      {/* Music Player - Floating Bottom Right on Desktop, Bottom Center on Mobile */}
      <div className="absolute bottom-6 right-6 z-20 w-full max-w-[calc(100%-3rem)] md:max-w-sm">
        <MusicPlayer />
      </div>
    </div>
  );
}
