import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, Flame, RefreshCcw, AlertCircle } from 'lucide-react';
import { synth } from './KeyClickSynth';
import { TestStats, WpmHistoryPoint } from '../types';

interface TypingAreaProps {
  text: string;
  duration: number; // in seconds (60, 180, 300)
  onCompleted: (stats: TestStats) => void;
  onRestart: () => void;
  onResetState?: () => void;
  onTypingStateChange?: (active: boolean) => void;
}

export default function TypingArea({ text, duration, onCompleted, onRestart, onResetState, onTypingStateChange }: TypingAreaProps) {
  const [typedText, setTypedText] = useState<string>('');
  const [testActive, setTestActive] = useState<boolean>(false);
  const [testFinished, setTestFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isFocused, setIsFocused] = useState<boolean>(true);

  // Stats calculation
  const [correctKeyStrokeCount, setCorrectKeyStrokeCount] = useState<number>(0);
  const [errorKeyStrokeCount, setErrorKeyStrokeCount] = useState<number>(0);
  const [totalKeyStrokeCount, setTotalKeyStrokeCount] = useState<number>(0);
  const [historyPointSeconds, setHistoryPointSeconds] = useState<WpmHistoryPoint[]>([]);

  const correctRef = useRef<number>(0);
  const errorRef = useRef<number>(0);
  const totalRef = useRef<number>(0);

  // DOM and timing references
  const mainInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statsHistoryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Error feedback state
  const [showErrorVibe, setShowErrorVibe] = useState<boolean>(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate original words array
  const words = useRef<string[]>([]);
  useEffect(() => {
    words.current = text.split(' ');
  }, [text]);

  const totalWords = words.current;

  // Sync timing parameters and reset state on text/duration alterations
  useEffect(() => {
    setTimeLeft(duration);
    setTypedText('');
    setTestActive(false);
    setTestFinished(false);
    setCorrectKeyStrokeCount(0);
    setErrorKeyStrokeCount(0);
    setTotalKeyStrokeCount(0);
    correctRef.current = 0;
    errorRef.current = 0;
    totalRef.current = 0;
    setHistoryPointSeconds([]);
    setShowErrorVibe(false);
    
    // Clear parental state
    const resetTimeout = setTimeout(() => {
      onResetState?.();
      onTypingStateChange?.(false);
    }, 0);

    // Clear any dangling timers
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (statsHistoryIntervalRef.current) clearInterval(statsHistoryIntervalRef.current);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);

    // Automatically focus on start
    const focusTimeout = setTimeout(() => {
      mainInputRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(resetTimeout);
      clearTimeout(focusTimeout);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (statsHistoryIntervalRef.current) clearInterval(statsHistoryIntervalRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [text, duration]);

  // Focus utility
  const handleFocusClick = () => {
    setIsFocused(true);
    mainInputRef.current?.focus();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Begin typing test on the first keystroke
  const startTest = () => {
    setTestActive(true);
    onTypingStateChange?.(true);

    // Secondary core 1s statistics taker
    let elapsedTicks = 0;
    
    // Core Timer Interval
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished
          clearInterval(timerIntervalRef.current!);
          clearInterval(statsHistoryIntervalRef.current!);
          handleTestFinished();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Live Stats Recorder (every second)
    statsHistoryIntervalRef.current = setInterval(() => {
      elapsedTicks++;
      
      const currentCorrect = correctRef.current;
      const currentTotal = totalRef.current;
      const snapWpm = elapsedTicks > 0 ? Math.round((currentCorrect / 5) / (elapsedTicks / 60)) : 0;
      const snapAcc = currentTotal > 0 ? Math.round((currentCorrect / currentTotal) * 100) : 100;

      setHistoryPointSeconds((prevHist) => [
        ...prevHist,
        {
          time: elapsedTicks,
          wpm: snapWpm,
          accuracy: snapAcc,
          errors: currentTotal - currentCorrect
        }
      ]);
    }, 1000);
  };

  const calculateAndSendFinalStats = (finalCorrect: number, finalTotal: number, finalErrors: number) => {
    const elapsed = duration - timeLeft || 1;
    const finalWpm = Math.round((finalCorrect / 5) / (elapsed / 60)) || 0;
    const finalRawWpm = Math.round((finalTotal / 5) / (elapsed / 60)) || 0;
    const finalAcc = finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 100;

    // Check if we captured at least one history point, otherwise append final
    let processedHistory = [...historyPointSeconds];
    if (processedHistory.length === 0 || processedHistory[processedHistory.length - 1].time < elapsed) {
      processedHistory.push({
        time: elapsed,
        wpm: finalWpm,
        accuracy: finalAcc,
        errors: finalErrors
      });
    }

    onCompleted({
      wpm: finalWpm,
      accuracy: finalAcc,
      rawWpm: finalRawWpm,
      correctChars: finalCorrect,
      errorChars: finalErrors,
      totalChars: finalTotal,
      history: processedHistory
    });
  };

  const handleTestFinished = () => {
    setTestActive(false);
    setTestFinished(true);
    onTypingStateChange?.(false);
    
    calculateAndSendFinalStats(correctRef.current, totalRef.current, errorRef.current);
  };

  // Main mechanical keystroke event processing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (testFinished) return;

    if (!testActive) {
      startTest();
    }

    const value = e.target.value;
    const lastCharTypedIndex = value.length - 1;
    const justTypedChar = value[lastCharTypedIndex];

    // Detect backspacing (always allowed to clear correct letters)
    if (value.length < typedText.length) {
      setTypedText(value);
      return;
    }

    // Determine targeted character correctness from original source text
    const targetChar = text[lastCharTypedIndex];

    if (justTypedChar === targetChar) {
      // CORRECT CHAR - allow advancement
      correctRef.current += 1;
      totalRef.current += 1;
      setCorrectKeyStrokeCount(correctRef.current);
      setTotalKeyStrokeCount(totalRef.current);
      
      if (justTypedChar === ' ') {
        synth.playClick('space');
      } else {
        synth.playClick('correct');
      }
      setTypedText(value);

      // Auto complete check if user completes all elements early
      if (value.length >= text.length) {
        clearInterval(timerIntervalRef.current!);
        clearInterval(statsHistoryIntervalRef.current!);
        handleTestFinished();
      }
    } else {
      // INCORRECT CHAR - block advancement
      errorRef.current += 1;
      totalRef.current += 1;
      setErrorKeyStrokeCount(errorRef.current);
      setTotalKeyStrokeCount(totalRef.current);
      synth.playClick('incorrect');

      // Do NOT setTypedText(value) so that state stays correct
      // Trigger error flash/shake
      setShowErrorVibe(true);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => {
        setShowErrorVibe(false);
      }, 150);
    }
  };

  // Handle tactile Backspaces/Keydowns for synthesizer clicking feedback
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (testFinished) return;

    if (e.key === 'Backspace') {
      synth.playClick('backspace');
    }
    
    // Prevent standard scroll locks
    if (e.key === 'Tab') {
      e.preventDefault();
      onRestart();
    }
  };

  // Words list token representation
  const renderTokens = () => {
    const charsTyped = typedText.length;
    let charIndexCounter = 0;

    return totalWords.map((word, wordIdx) => {
      const isWordActive = typedText.split(' ').length - 1 === wordIdx;
      
      return (
        <span
          key={wordIdx}
          className="mr-4 mb-2 inline-flex relative py-0.5 px-1 transition-all duration-150"
        >
          {word.split('').map((char, charIdx) => {
            const globalCharIdx = charIndexCounter + charIdx;
            const hasBeenTyped = globalCharIdx < charsTyped;
            const isCorrect = hasBeenTyped && typedText[globalCharIdx] === char;
            const isCharActive = globalCharIdx === charsTyped;

            let charColorClass = 'text-[#141414] opacity-30'; // Untyped
            let bgClass = 'bg-transparent';
            let borderClass = 'border-b-2 border-transparent';

            if (hasBeenTyped) {
              if (isCorrect) {
                charColorClass = 'text-[#141414] opacity-100 font-extrabold'; // Corrected
              } else {
                charColorClass = 'text-[#E4E3E0] font-black'; // Mistake (historical, safeguards)
                bgClass = 'bg-[#FF4E00]';
                borderClass = 'border-b-2 border-[#FF4E00]';
              }
            }

            // Visual feedback on the exact character being mistyped
            if (isCharActive && showErrorVibe) {
              charColorClass = 'text-[#E4E3E0] font-black transition-none';
              bgClass = 'bg-[#FF4E00]';
              borderClass = 'border-b-2 border-[#FF4E00] rounded-xs shadow-[0_0_8px_#FF4E00]';
            } else if (isCharActive && isFocused) {
              // Highlight only the exact current active character
              borderClass = 'border-b-2 border-[#FF4E00]';
            }

            return (
              <span
                key={charIdx}
                className={`relative font-mono text-2xl sm:text-3xl transition-all duration-75 px-[1px] ${charColorClass} ${bgClass} ${borderClass}`}
              >
                {/* Embedded retro glowing security caret with error shake */}
                {isCharActive && isFocused && (
                  <motion.span
                    className="absolute left-0 top-[10%] bottom-[10%] w-[3.5px] bg-[#FF4E00] rounded-sm shadow-[0_0_8px_#FF4E00] pointer-events-none"
                    animate={showErrorVibe ? { x: [-3, 3, -3, 3, 0], opacity: 1 } : { opacity: [1, 0, 1] }}
                    transition={showErrorVibe ? { duration: 0.15 } : { repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                  />
                )}
                {char}
              </span>
            );
          })}

          {/* Invisible gap tracking for space separation */}
          {(() => {
            const spaceGlobalIndex = charIndexCounter + word.length;
            const isSpaceCurrent = spaceGlobalIndex === charsTyped;

            charIndexCounter += word.length + 1; // index modifier

            return (
              <span 
                className={`relative w-2 inline-block transition-all duration-75 border-b-2 ${
                  isSpaceCurrent && isFocused 
                    ? 'border-[#FF4E00]' 
                    : 'border-transparent'
                } ${
                  isSpaceCurrent && showErrorVibe 
                    ? 'bg-[#FF4E00] text-[#E4E3E0] font-black rounded-xs shadow-[0_0_8px_#FF4E00]' 
                    : 'text-transparent'
                }`}
              >
                {isSpaceCurrent && isFocused && (
                  <motion.span
                    className="absolute left-0 top-[10%] bottom-[10%] w-[3.5px] bg-[#FF4E00] rounded-sm shadow-[0_0_8px_#FF4E00] pointer-events-none"
                    animate={showErrorVibe ? { x: [-3, 3, -3, 3, 0], opacity: 1 } : { opacity: [1, 0, 1] }}
                    transition={showErrorVibe ? { duration: 0.15 } : { repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                  />
                )}
                _
              </span>
            );
          })()}
        </span>
      );
    });
  };

  // Convert seconds remaining to simple readable format
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${remainder.toString().padStart(2, '0')}s remain`;
  };

  // Dynamic accuracy snapshot
  const activeAccuracy = totalKeyStrokeCount > 0
    ? Math.round((correctKeyStrokeCount / totalKeyStrokeCount) * 100)
    : 100;

  // Real-time speed ticker
  const activeElapsed = duration - timeLeft;
  const activeWpm = activeElapsed > 0 
    ? Math.round((correctKeyStrokeCount / 5) / (activeElapsed / 60)) 
    : 0;

  return (
    <div id="typing-module-container" className="space-y-6 w-full select-none" dir="ltr">
      
      {/* Top dashboard controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-2 border-[#141414] bg-[#141414] text-[#E4E3E0] p-4 gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[#E4E3E0]/70 font-mono text-xs uppercase tracking-widest font-bold">
              Countdown:
            </span>
            <span id="countdown-badge" className="text-lg font-mono text-[#FF4E00] font-black border border-[#FF4E00] px-3 py-0.5 uppercase tracking-wide">
              {timeLeft <= 0 ? "Time's Up!" : formatTime(timeLeft)}
            </span>
          </div>

          {testActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 text-xs font-mono font-bold"
            >
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FF4E00] animate-bounce" />
                <span className="text-[#E4E3E0]/60 text-[10px] uppercase">
                  Live Speed:
                </span>
                <span className="text-[#FF4E00] text-sm font-black">
                  {activeWpm} WPM
                </span>
              </div>
              <span className="text-[#E4E3E0]/30 font-black">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#E4E3E0]/60 text-[10px] uppercase">
                  Accuracy:
                </span>
                <span className={`text-sm font-black ${activeAccuracy >= 90 ? 'text-[#FF4E00]' : 'text-amber-400'}`}>
                  {activeAccuracy}%
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <button
          id="quick-reset-btn"
          onClick={onRestart}
          className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[#E4E3E0] border border-[#E4E3E0] text-[#141414] font-mono text-xs uppercase font-extrabold hover:bg-[#FF4E00] hover:text-[#141414] hover:border-[#FF4E00] transition-colors cursor-pointer focus:outline-none"
          title="Restart Test [Tab]"
        >
          <RefreshCcw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Reset</span>
        </button>
      </div>

      {/* Typing box */}
      <div
        id="keystroke-sandbox-frame"
        ref={containerRef}
        onClick={handleFocusClick}
        className={`relative border-2 p-7 sm:p-9 cursor-text min-h-[190px] max-h-[320px] overflow-y-auto transition-all duration-250 ${
          isFocused
            ? 'bg-[#E4E3E0] border-[#141414] shadow-none'
            : 'bg-[#d8d7d3] border-[#141414]/60'
        }`}
      >
        
        {/* Decorative Watermark background */}
        <div className="absolute -bottom-10 -right-4 text-[120px] font-mono font-extrabold text-[#141414]/[0.024] select-none pointer-events-none uppercase">
          TYPE
        </div>

        {/* Underlay typing layout container */}
        <div 
          className="flex flex-wrap relative z-10 leading-relaxed gap-y-2 text-2xl font-sans"
          dir="ltr"
          style={{ textAlign: 'left', width: '100%' }}
        >
          {renderTokens()}
        </div>

        {/* Hidden physical receiver text input */}
        <input
          id="typing-input-receiver"
          ref={mainInputRef}
          type="text"
          value={typedText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="absolute inset-0 opacity-0 cursor-text z-0 outline-none focus:outline-none border-none"
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />


      </div>

      {/* Tips and hotkey controls footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-[#141414] font-mono text-[10px] sm:text-xs gap-3">
        <span className="flex items-center gap-1.5 bg-[#141414]/5 px-3 py-1.5 border border-[#141414]/20 rounded-md">
          <AlertCircle className="w-3.5 h-3.5 text-[#FF4E00]" />
          <span>
            Tip: Press <kbd className="bg-[#141414] border border-[#141414] text-[#E4E3E0] rounded px-1.5 font-bold">Tab</kbd> to reset instantly
          </span>
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
          * Start typing to initiate internal timing mechanism
        </span>
      </div>
    </div>
  );
}
