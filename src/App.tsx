import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Keyboard, BookOpen, Sparkles, BookOpenCheck, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import SoundSettings from './components/SoundSettings';
import StatsDashboard from './components/StatsDashboard';
import TypingArea from './components/TypingArea';
import { generateTestText } from './components/WordList';
import { TestDuration, TextCategory, TestStats } from './types';

export default function App() {
  // Test Options
  const [duration, setDuration] = useState<TestDuration>(60); // Default 1 min
  const [category, setCategory] = useState<TextCategory>('words');
  const [generatedText, setGeneratedText] = useState<string>('');
  
  // Test Lifecycle State
  const [testState, setTestState] = useState<'idle' | 'typing' | 'finished'>('idle');
  const [finalStats, setFinalStats] = useState<TestStats | null>(null);
  const [seoOpen, setSeoOpen] = useState<boolean>(false);

  // Generates randomized words/quote/code and updates typing area source
  const regenerateChallenge = useCallback((currentCat = category, currentDur = duration) => {
    // Determine target word density.
    let wordDensityCount = 130; // 1-minute
    if (currentDur === 180) wordDensityCount = 380; // 3-minute
    if (currentDur === 300) wordDensityCount = 600; // 5-minute

    const rawChallenge = generateTestText(currentCat, wordDensityCount);
    setGeneratedText(rawChallenge);
    setTestState('idle');
    setFinalStats(null);
  }, [category, duration]);

  // Generate initial content on mounting
  useEffect(() => {
    regenerateChallenge(category, duration);
  }, [regenerateChallenge, category, duration]);

  // Duration select handle
  const handleDurationChange = (dur: TestDuration) => {
    setDuration(dur);
    regenerateChallenge(category, dur);
  };

  // Category select handle
  const handleCategoryChange = (cat: TextCategory) => {
    setCategory(cat);
    regenerateChallenge(cat, duration);
  };

  // Core callback when typing duration runs down or text is completely entered
  const handleTestLifecycleComplete = (stats: TestStats) => {
    setFinalStats(stats);
    setTestState('finished');
  };

  // Re-initialization
  const handleResetChallenge = () => {
    regenerateChallenge(category, duration);
  };

  return (
    <div 
      id="full-app-workspace" 
      className="min-h-screen bg-[#E4E3E0] text-[#141414] flex flex-col font-sans selection:bg-[#FF4E00]/40 selection:text-[#141414] antialiased"
      dir="ltr"
    >
      {/* Primary Container Box with heavy border design */}
      <div className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 flex flex-col justify-between relative z-10">
        
        {/* Top Navigation & Branding header built just like reference design */}
        <header id="main-navigation-banner" className="border-b-2 border-[#141414] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-[#FF4E00] flex items-center justify-center">
                <Keyboard className="w-3.5 h-3.5 text-[#141414] stroke-[2.5]" />
              </div>
              <span className="font-mono text-[10px] uppercase font-black tracking-widest text-[#FF4E00]">
                tactile.trainer
              </span>
            </div>
            <h1 id="website-header-title" className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none text-[#141414]">
              TYPE.PRACTICE
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-widest opacity-50 mt-1">
              v2.0 // OFFLINE_MODE
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-right font-mono">
            {/* Set Duration Selector */}
            <div className="flex flex-col border-l-2 border-[#141414]/15 pl-6">
              <span className="text-[10px] font-serif italic opacity-60 uppercase mb-1">Set Duration</span>
              <div className="flex items-center gap-1">
                {([60, 180, 300] as TestDuration[]).map((dur) => (
                  <button
                    key={dur}
                    id={`header-duration-btn-${dur / 60}`}
                    onClick={() => handleDurationChange(dur)}
                    className={`px-2.5 py-1 text-xs font-mono font-black border-2 border-[#141414] transition-all duration-100 cursor-pointer focus:outline-none ${
                      duration === dur
                        ? 'bg-[#FF4E00] text-[#141414] translate-y-[1px] shadow-[1px_1px_0px_#141414]'
                        : 'bg-transparent text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] shadow-[2px_2px_0px_#141414]'
                    }`}
                    title={`Switch to ${dur / 60} Minute Test`}
                  >
                    {dur / 60} MIN
                  </button>
                ))}
              </div>
            </div>

            {/* Source Focus */}
            <div className="flex flex-col border-l-2 border-[#141414]/15 pl-6 h-9 justify-center">
              <span className="text-[10px] font-serif italic opacity-60 uppercase">Source</span>
              <span className="text-sm font-bold uppercase tracking-tight">{category}</span>
            </div>

            {/* Status indicators */}
            <div className="flex flex-col border-l-2 border-[#141414]/15 pl-6 h-9 justify-center">
              <span className="text-[10px] font-serif italic bg-[#141414] text-[#E4E3E0] px-1.5 uppercase">Status</span>
              <span className="text-sm font-bold uppercase tracking-tight text-[#FF4E00]">OFFLINE</span>
            </div>
          </div>
        </header>

        {/* Core Workspace Canvas area */}
        <main className="my-auto py-4 flex flex-col items-center justify-center">
          
          <AnimatePresence mode="wait">
            {testState !== 'finished' ? (
              <motion.div
                key="typing-arena-vibe"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full space-y-6"
              >
                {/* Control Panel Menu - condensed when active typing */}
                <div
                  id="configuration-settings-bar"
                  className={`transition-all duration-350 space-y-4 ${
                    testState === 'typing'
                      ? 'opacity-0 scale-95 pointer-events-none -translate-y-4 h-0 overflow-hidden'
                      : 'opacity-100'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-4 items-stretch justify-between">
                    
                    {/* Mode Selector Option tabs */}
                    <div id="mode-selector-block" className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] p-1.5 border-2 border-[#141414] flex-grow">
                      <div className="flex items-center gap-1.5 px-3 py-1 text-[#E4E3E0]/70 text-[10px] font-mono uppercase tracking-widest font-black">
                        <BookOpen id="category-icon" className="w-3.5 h-3.5 text-[#FF4E00]" />
                        <span>Mode:</span>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-wrap w-full md:w-auto">
                        {(['words', 'quotes', 'code'] as TextCategory[]).map((cat) => (
                          <button
                            key={cat}
                            id={`mode-select-${cat}`}
                            onClick={() => handleCategoryChange(cat)}
                            className={`flex-1 px-4 py-1 text-xs font-mono uppercase tracking-tight transition-all cursor-pointer focus:outline-none font-bold ${
                              category === cat
                                ? 'bg-[#FF4E00] text-[#141414]'
                                : 'text-[#E4E3E0]/80 hover:text-white bg-transparent'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Select Duration mode (1, 3, 5 minutes) */}
                    <div id="duration-selector-block" className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] p-1.5 border-2 border-[#141414]">
                      <div className="flex items-center gap-1.5 px-3 py-1 text-[#E4E3E0]/70 text-[10px] font-mono uppercase tracking-widest font-black">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF4E00]" />
                        <span>TIME:</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {([60, 180, 300] as TestDuration[]).map((dur) => (
                          <button
                            key={dur}
                            id={`duration-item-${dur / 60}`}
                            onClick={() => handleDurationChange(dur)}
                            className={`px-4 py-1 text-xs font-mono uppercase tracking-tight transition-all cursor-pointer focus:outline-none font-bold ${
                              duration === dur
                                ? 'bg-[#FF4E00] text-[#141414]'
                                : 'text-[#E4E3E0]/80 hover:text-white bg-transparent'
                            }`}
                          >
                            {dur / 60} MIN
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Keyboard clicking feedback profile */}
                  <SoundSettings />
                </div>

                {/* Focus sequence visual indicator */}
                {testState === 'typing' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-1 select-none pointer-events-none"
                  >
                    <span className="text-[10px] font-mono tracking-widest text-[#141414]/70 uppercase flex items-center justify-center gap-2">
                      <BookOpenCheck className="w-3.5 h-3.5 text-[#FF4E00]" />
                      Zen sequencing active • distraction-free layout initialized
                    </span>
                  </motion.div>
                )}

                {/* Typing sandbox interaction element */}
                <TypingArea
                  text={generatedText}
                  duration={duration}
                  onCompleted={handleTestLifecycleComplete}
                  onRestart={handleResetChallenge}
                  onResetState={() => setTestState('idle')}
                  onTypingStateChange={(active) => setTestState(active ? 'typing' : 'idle')}
                />
              </motion.div>
            ) : (
              /* Summary performance graphs dashboard */
              <StatsDashboard
                key="summary-dashboard"
                stats={finalStats!}
                timeTotal={duration}
                category={category}
                onRestart={handleResetChallenge}
              />
            )}
          </AnimatePresence>

        </main>

        {/* Dynamic bottom layout parameters indicator and SEO Optimization Knowledge Base */}
        {testState !== 'typing' && (
          <div className="mt-8 space-y-6">
            {/* Interactive SEO Directory Container */}
            <section id="seo-knowledge-base" className="border-2 border-[#141414] bg-[#E4E3E0] text-[#141414] overflow-hidden">
              <button
                id="toggle-seo-faq-btn"
                onClick={() => setSeoOpen(!seoOpen)}
                className="w-full p-4 flex items-center justify-between font-mono text-xs uppercase font-extrabold bg-[#141414] text-[#E4E3E0] hover:bg-[#FF4E00] hover:text-[#141414] transition-colors cursor-pointer outline-none focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Interactive Search Keywords & Daily Training Guide (SEO Booster)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#E4E3E0] text-[#141414] px-2 py-0.5 text-[10px] font-black">
                  <span>{seoOpen ? 'COLLAPSE' : 'EXPAND GUIDE'}</span>
                  {seoOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </button>

              <AnimatePresence>
                {seoOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-[#141414]"
                  >
                    <div className="p-6 space-y-6 text-sm leading-relaxed max-h-[400px] overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-mono text-xs uppercase font-black text-[#FF4E00] mb-1">01. Comprehensive Typing Test Guide</h3>
                            <p className="text-xs">
                              Welcome to the ultimate <strong>free typing test</strong> designed to improve your speed. Whether you need a standard <strong>typing speed test</strong>, an exhaustive <strong>online typing test</strong>, or simple <strong>free typing practice</strong> to hone your keyboard skills, our custom visual layout helps beginners and experts alike. Start an active <strong>WPM test</strong> today and benchmark your skills.
                            </p>
                          </div>
                          <div>
                            <h3 className="font-mono text-xs uppercase font-black text-[#141414] mb-1">02. Elite Touch Typing Practice</h3>
                            <p className="text-xs">
                              Our built-in <strong>typing tutor</strong> makes learning how to type faster both simple and engaging. We utilize structured <strong>typing lessons</strong> based on true muscle memory development. Take a <strong>touch typing</strong> challenge, complete <strong>daily typing practice</strong>, and use our responsive <strong>typing speed checker</strong> to log progress.
                            </p>
                          </div>
                          <div>
                            <h3 className="font-mono text-xs uppercase font-black text-[#141414] mb-1">03. Real-Time Typing Speed Improvement</h3>
                            <p className="text-xs">
                              Need a fast <strong>keyboard typing test</strong> to check your raw speed? Participate in a personal <strong>typing challenge</strong>, enjoy <strong>typing exercise online</strong>, or engage with simulated <strong>typing game online</strong> modules. Our dashboard serves as the best <strong>typing master</strong> and premium <strong>tutor</strong> workspace online.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="font-mono text-xs uppercase font-black text-[#141414] mb-1">04. Advanced WPM Milestones</h3>
                            <p className="text-xs">
                              Aiming for the prestigious <strong>100 WPM typing test</strong> badge? Our highly responsive tactile sound configuration makes it easy to <strong>improve typing speed</strong>. Try a <strong>fast typing test</strong> or our specialized <strong>typing accuracy test</strong> to maintain pure structural execution. We host standard <strong>English typing practice</strong> and programming text modules.
                            </p>
                          </div>
                          <div>
                            <h3 className="font-mono text-xs uppercase font-black text-[#141414] mb-1">05. Playful Typing Game Frameworks</h3>
                            <p className="text-xs">
                              Treat your practice key strokes like a <strong>typing game</strong>. You can simulate a virtual <strong>typing race</strong>, experience a <strong>typing battle online</strong> context, or join an active <strong>typing competition online</strong>. Our software functions as the <strong>best typing website</strong> for beginners and elite coders alike, delivering unmatched feedback for every <strong>typing skills test</strong>.
                            </p>
                          </div>
                          <div>
                            <h3 className="font-mono text-xs uppercase font-black text-[#141414] mb-1">06. Search Visibility Index References</h3>
                            <p className="text-[10px] text-[#141414]/60 font-mono leading-tight">
                              Index Reference Targets: <em>typing practice online, learn typing, typing race multiplayer, touch typing practice online, free typing speed test online free, online typing practice free.</em>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <footer id="workspace-footer-metrics" className="border-t-2 border-[#141414] pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-[#141414] font-mono gap-3 select-none uppercase font-bold">
              <div className="flex flex-wrap items-center gap-4">
                <span>Category Focus: <span className="text-[#FF4E00] font-black">{category}</span></span>
                <span className="text-[#141414]/30">•</span>
                <span>Running Mode: <span className="text-[#141414]">Standard Offline</span></span>
              </div>
              <div>
                <span>TYPE.PRACTICE © 2026 • Premium Typist Grade</span>
              </div>
            </footer>
          </div>
        )}

      </div>

      {/* Decorative infinite ticker tape marquee representing live movement */}
      {testState !== 'typing' && (
        <div className="bg-[#FF4E00] text-[#141414] h-7 flex items-center overflow-hidden whitespace-nowrap select-none uppercase tracking-widest font-mono text-[10px] font-black border-t-2 border-[#141414]">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 24 }}
            className="flex whitespace-nowrap gap-12"
          >
            <span>Focus Mode Active — No Distractions — Practice Makes Perfect — Repeat Test — Offline Storage Enabled — Focus Mode Active — No Distractions — Practice Makes Perfect — Repeat Test — Offline Storage Enabled — </span>
            <span>Focus Mode Active — No Distractions — Practice Makes Perfect — Repeat Test — Offline Storage Enabled — Focus Mode Active — No Distractions — Practice Makes Perfect — Repeat Test — Offline Storage Enabled — </span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
