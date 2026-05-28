import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Keyboard } from 'lucide-react';
import { synth } from './KeyClickSynth';

export default function SoundSettings() {
  const [profile, setProfile] = useState<'silent' | 'tactile' | 'clicky' | 'bubble'>('tactile');
  const [volume, setVolume] = useState<number>(0.35);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    // Sync initial states
    setProfile(synth.getProfile());
    setVolume(synth.getVolume());
    setIsMuted(synth.getMuted());
  }, []);

  const handleProfileChange = (newProfile: 'silent' | 'tactile' | 'clicky' | 'bubble') => {
    setProfile(newProfile);
    synth.setProfile(newProfile);
    if (newProfile === 'silent') {
      setIsMuted(true);
      synth.setMuted(true);
    } else {
      setIsMuted(false);
      synth.setMuted(false);
      // Play a quick test click so user knows the vibe
      setTimeout(() => synth.playClick('correct'), 30);
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    synth.setVolume(v);
    if (v > 0 && isMuted) {
      setIsMuted(false);
      synth.setMuted(false);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    synth.setMuted(nextMute);
    if (!nextMute && profile === 'silent') {
      setProfile('tactile');
      synth.setProfile('tactile');
    }
    if (!nextMute) {
      setTimeout(() => synth.playClick('correct'), 30);
    }
  };

  const profileLabels: Record<'silent' | 'tactile' | 'clicky' | 'bubble', string> = {
    silent: 'silent',
    tactile: 'tactile',
    clicky: 'clicky',
    bubble: 'bubble'
  };

  return (
    <div 
      id="sound-settings-panel" 
      className="bg-[#E4E3E0] border-2 border-[#141414] p-4 flex flex-wrap items-center justify-between gap-4 w-full select-none"
      dir="ltr"
    >
      {/* Audio volume slider */}
      <div className="flex items-center gap-3">
        <button
          id="toggle-mute-btn"
          onClick={toggleMute}
          className="p-2 border-2 border-[#141414] bg-[#E4E3E0] hover:bg-[#141414] hover:text-[#E4E3E0] text-[#141414] transition-all duration-150 cursor-pointer focus:outline-none"
          title={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-[#FF4E00]" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <div className="flex flex-col">
          <span className="text-[#141414] text-[10px] uppercase font-bold tracking-widest font-mono">
            sound.level
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-28 accent-[#FF4E00] cursor-pointer h-1 bg-[#141414] border border-[#141414] appearance-none outline-none"
            />
            <span className="text-xs font-mono font-bold text-[#141414] w-12 text-center">
              {isMuted ? 'OFF' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Keyboard Switch Profile choice */}
      <div className="flex items-center gap-1.5 p-1 bg-[#141414] text-[#E4E3E0] border-2 border-[#141414]">
        <div className="flex items-center px-2 py-1 gap-1 text-[#E4E3E0]/70 text-[10px] font-mono uppercase tracking-widest font-black">
          <Keyboard className="w-3.5 h-3.5 text-[#FF4E00]" />
          <span>Switch:</span>
        </div>
        
        <div className="flex items-center gap-1">
          {(['silent', 'tactile', 'clicky', 'bubble'] as const).map((prof) => (
            <button
              key={prof}
              id={`profile-${prof}-btn`}
              onClick={() => handleProfileChange(prof)}
              className={`px-3 py-1 text-[11px] font-mono uppercase tracking-tight transition-all cursor-pointer focus:outline-none font-bold ${
                profile === prof
                  ? 'bg-[#FF4E00] text-[#141414] border border-[#FF4E00]'
                  : 'text-[#E4E3E0]/80 hover:text-white hover:bg-slate-800 bg-transparent border border-transparent'
              }`}
            >
              {profileLabels[prof]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
