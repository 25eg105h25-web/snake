/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SnakeGame from './components/SnakeGame';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  React.useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="w-full h-screen bg-black text-zinc-100 font-sans flex flex-col overflow-hidden border-4 border-zinc-900">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
      />

      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div>
          <h1 className="text-xl font-bold tracking-tighter uppercase font-mono">
            <span className="text-green-400">Neon</span>Snake <span className="text-zinc-600">//</span> <span className="text-pink-500">Audio</span>
          </h1>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] uppercase tracking-widest font-mono text-zinc-500">
          <div>Status: <span className="text-green-400">Online</span></div>
          <div>Engine: <span className="text-zinc-300">Vortex-4</span></div>
          <div>FPS: <span className="text-zinc-300">60.0</span></div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Column: Playlist */}
        <aside className="hidden lg:flex w-80 border-r border-zinc-800 p-6 flex-col gap-6 bg-zinc-950/50">
          <div className="space-y-4">
            <h2 className="mono-label mb-4">Audio Stream</h2>
            
            {DUMMY_TRACKS.map((track, idx) => (
              <button 
                key={track.id}
                onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }}
                className={`w-full text-left p-4 rounded-md flex flex-col gap-1 transition-all ${
                  idx === currentTrackIndex 
                  ? 'border border-green-500/50 bg-green-500/5' 
                  : 'border border-zinc-900 hover:border-zinc-800 bg-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-bold ${idx === currentTrackIndex ? 'text-green-400' : 'text-zinc-300'}`}>
                    {track.title}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600">03:42</span>
                </div>
                <span className="text-xs text-zinc-500">{track.artist}</span>
                {idx === currentTrackIndex && (
                  <div className="h-1 w-full bg-zinc-800 mt-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-green-500" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-auto p-4 border border-zinc-800 rounded-lg">
            <div className="mono-label mb-2">Visualizer</div>
            <div className="flex items-end gap-1 h-12">
              {[0.5, 0.75, 1, 0.8, 0.4, 0.6, 0.9, 0.5].map((h, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: isPlaying ? [h*100+'%', (h*0.5)*100+'%', h*100+'%'] : h*100+'%' }}
                  transition={{ repeat: Infinity, duration: 0.5 + i*0.1 }}
                  className="flex-1 bg-green-500/40"
                  style={{ opacity: 0.4 + (h * 0.6) }}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Center Column: Game Grid */}
        <section className="flex-1 flex flex-col items-center justify-center bg-zinc-900/20 p-4 md:p-8 overflow-y-auto">
          <SnakeGame initialScore={0} />
        </section>

        {/* Right Column: Controls & Stats */}
        <aside className="w-80 border-l border-zinc-800 p-8 hidden md:flex flex-col gap-10 bg-zinc-950">
          {/* Stats are now part of SnakeGame component's display but theme wants them here */}
          {/* I will use a ref or state in App to sync score if I want it exactly here, 
              but for now I'll just put the controls here and keep score in the Game component for simplicity */}
          
          <div className="playback-system border-t border-zinc-800 pt-10 mt-auto">
            <h3 className="mono-label mb-6">Playback System</h3>
            <div className="flex flex-col gap-6 items-center">
              <div className="flex items-center space-x-6">
                <motion.div 
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="relative w-16 h-16 rounded-full overflow-hidden border border-zinc-800 flex-shrink-0"
                >
                  <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover opacity-50" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-zinc-100 truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-zinc-500 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              <div className="flex gap-6 items-center">
                <button onClick={handlePrev} className="text-zinc-500 hover:text-white transition-colors">
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full border-2 border-green-400 flex items-center justify-center text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:bg-green-400/10 transition-all"
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 ml-1 fill-current" />}
                </button>
                <button onClick={handleNext} className="text-zinc-500 hover:text-white transition-colors">
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
              </div>

              <div className="w-full flex justify-between font-mono text-[10px] text-zinc-600">
                <span>01:12</span>
                <div className="flex-1 mx-4 relative top-1.5 h-[2px] bg-zinc-800">
                  <motion.div 
                    className="absolute left-0 top-0 h-full bg-green-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span>03:42</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
             <div className="mono-label mb-2 text-center">System Volume</div>
             <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-zinc-600"></div>
             </div>
          </div>
        </aside>
      </main>

      {/* Bottom Console */}
      <footer className="h-8 bg-zinc-950 border-t border-zinc-800 px-8 flex items-center shrink-0">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-[10px] font-mono text-green-500/50 flex gap-4">
            <span>[SYS] Snake sequence initialized...</span>
            <span className="text-zinc-700 hidden sm:inline">[LOG] Audio buffer synced @ 44.1kHz</span>
            </div>
        </div>
      </footer>
    </div>
  );
}

const DUMMY_TRACKS = [
  {
    id: 1,
    title: "Neon Pulse",
    artist: "AI Synth Voyager",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop"
  },
  {
    id: 2,
    title: "Cyber Rush",
    artist: "Matrix Mind",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop"
  },
  {
    id: 3,
    title: "Dream Drive",
    artist: "Retro Glitch",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=400&fit=crop"
  }
];
