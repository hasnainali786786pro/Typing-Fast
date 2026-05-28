import { motion } from 'motion/react';
import { RotateCcw, Award, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { TestStats } from '../types';

interface StatsDashboardProps {
  stats: TestStats;
  timeTotal: number;
  category: string;
  onRestart: () => void;
  key?: string;
}

export default function StatsDashboard({ stats, timeTotal, category, onRestart }: StatsDashboardProps) {
  const { wpm, accuracy, correctChars, errorChars, totalChars, history } = stats;

  const secondsToMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate clean SVG point lines
  const hasHistory = history && history.length > 1;
  const chartWidth = 650;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  let points = '';
  let areaPoints = '';
  let gridLines: { x: number; label: string }[] = [];
  let yGridLines: { y: number; label: string }[] = [];

  if (hasHistory) {
    const maxWpm = Math.max(...history.map(p => p.wpm), 20);
    const maxSecond = history[history.length - 1].time;

    const getX = (time: number) => paddingX + (time / maxSecond) * (chartWidth - paddingX * 2);
    const getY = (wpmVal: number) => chartHeight - paddingY - (wpmVal / maxWpm) * (chartHeight - paddingY * 2);

    // Coordinate builder
    points = history.map(p => `${getX(p.time).toFixed(1)},${getY(p.wpm).toFixed(1)}`).join(' ');
    
    const startX = getX(0).toFixed(1);
    const endX = getX(maxSecond).toFixed(1);
    const bottomY = (chartHeight - paddingY).toFixed(1);
    areaPoints = `${startX},${bottomY} ${points} ${endX},${bottomY}`;

    // X divisions
    const step = Math.max(1, Math.floor(maxSecond / 5));
    for (let i = 0; i <= maxSecond; i += step) {
      if (i === 0 || i === maxSecond || i % step === 0) {
        gridLines.push({ x: getX(i), label: `${i}s` });
      }
    }

    // Y divisions
    const yStep = Math.max(15, Math.round(maxWpm / 3));
    for (let w = 0; w <= maxWpm; w += yStep) {
      yGridLines.push({ y: getY(w), label: `${w}` });
    }
  }

  // Performance Coaching Rating feedback
  const getPerformanceMessage = (wpmVal: number, accVal: number) => {
    if (wpmVal >= 90 && accVal >= 95) {
      return { 
        title: "GRANDMASTER_TYPIST [CLASS S]", 
        msg: "Phenomenal! Flawless execution and staggering speed. You are typing like a professional terminal operations officer.", 
        style: "text-[#141414] border-2 border-[#141414] bg-[#FF4E00]" 
      };
    }
    if (wpmVal >= 60 && accVal >= 90) {
      return { 
        title: "OFFICER_GRADE [CLASS A]", 
        msg: "Outstanding! High precision speed. Excellent stamina suitable for production software deployment.", 
        style: "text-[#141414] border-2 border-[#141414] bg-[#E4E3E0]" 
      };
    }
    if (wpmVal >= 45) {
      return { 
        title: "COMBATANT_SPEED [CLASS B]", 
        msg: "Reliable and responsive. Muscle memory is settling in beautifully. Keep your layout relaxed to scale faster.", 
        style: "text-[#141414] border-2 border-[#141414] bg-[#d5d4d0]" 
      };
    }
    return { 
      title: "INITIATE_TACTILE [CLASS E]", 
      msg: "Stardust levels. Focus heavily on complete finger placement first. Accuracy beats hurried speed every time.", 
      style: "text-[#141414] border-2 border-[#141414] bg-[#b9b8b4]" 
    };
  };

  const advice = getPerformanceMessage(wpm, accuracy);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      id="stats-dashboard"
      className="space-y-6 w-full max-w-4xl mx-auto text-[#141414] select-none"
      dir="ltr"
    >
      {/* Prime Header Block */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-2 border-[#141414] bg-[#141414] text-[#E4E3E0] p-6 gap-4">
        <div>
          <span className="text-[#FF4E00] text-xs font-mono uppercase tracking-widest flex items-center gap-2 font-black">
            <Award className="w-5 h-5 stroke-[2.5]" /> 
            typing.sprint.completed
          </span>
          <h2 className="text-3xl font-sans font-black uppercase tracking-tight mt-1 leading-none">
            THE.METRICS.READOUT
          </h2>
          <p className="text-[#E4E3E0]/60 text-xs mt-1.5 font-mono uppercase">
            Run configuration: <span className="text-[#FF4E00] font-bold">{timeTotal / 60}m</span> in <span className="text-[#FF4E00] font-bold">{category}</span>.
          </p>
        </div>

        <button
          id="stats-restart-btn"
          onClick={onRestart}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FF4E00] border border-[#FF4E00] text-[#141414] font-mono font-black uppercase tracking-wide text-xs transition-colors hover:bg-[#E4E3E0] hover:border-[#141414] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          <span>Practice again [ESC]</span>
        </button>
      </div>

      {/* Grid of core metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* WPM Grid Panel */}
        <div id="stat-card-wpm" className="bg-[#E4E3E0] border-2 border-[#141414] p-5 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-3 translate-y-3">
            <Award className="w-24 h-24 text-[#141414]" />
          </div>
          <span className="text-[#141414]/60 text-[10px] uppercase font-mono tracking-wider font-extrabold block">
            01 // NET.WPM
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-5xl font-sans font-black text-[#FF4E00] tracking-tighter">{wpm}</span>
            <span className="text-[#141414] text-[10px] font-mono uppercase font-black">
              wpm
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#141414] font-mono uppercase font-black">
            <CheckCircle className="w-3.5 h-3.5 text-[#141414]" />
            <span>adjusted speed</span>
          </div>
        </div>

        {/* ACCURACY Grid Panel */}
        <div id="stat-card-accuracy" className="bg-[#E4E3E0] border-2 border-[#141414] p-5 relative overflow-hidden">
          <span className="text-[#141414]/60 text-[10px] uppercase font-mono tracking-wider font-extrabold block">
            02 // ACCURACY
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-5xl font-sans font-black text-[#141414] tracking-tighter">{accuracy}%</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#141414] font-mono uppercase font-black">
            <AlertCircle className="w-3.5 h-3.5 text-[#FF4E00]" />
            <span>{errorChars} errors</span>
          </div>
        </div>

        {/* TIME ELAPSED */}
        <div id="stat-card-time" className="bg-[#E4E3E0] border-2 border-[#141414] p-5 relative overflow-hidden">
          <span className="text-[#141414]/60 text-[10px] uppercase font-mono tracking-wider font-extrabold block">
            03 // DURATION
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-5xl font-sans font-black text-[#141414] tracking-tighter">{secondsToMinutes(timeTotal)}</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#141414]/70 font-mono uppercase font-black">
            <Clock className="w-3.5 h-3.5" />
            <span>sustained limit</span>
          </div>
        </div>

        {/* RAW COUNTS */}
        <div id="stat-card-raw" className="bg-[#E4E3E0] border-2 border-[#141414] p-5 relative overflow-hidden">
          <span className="text-[#141414]/60 text-[10px] uppercase font-mono tracking-wider font-extrabold block">
            04 // KEYSTROKES
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-5xl font-sans font-black text-[#141414] tracking-tighter">{totalChars}</span>
            <span className="text-[#141414] text-[10px] font-mono uppercase font-black">
              keys
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 w-full text-[10px] text-[#141414] font-mono font-black uppercase justify-between">
            <span className="text-[#141414] opacity-75">{correctChars} OK</span>
            <span>•</span>
            <span className="text-[#FF4E00]">{errorChars} ERR</span>
          </div>
        </div>
      </div>

      {/* Speed Graph timeline */}
      {hasHistory ? (
        <div id="speed-history-chart" className="border-2 border-[#141414] bg-[#E4E3E0] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div>
              <h3 className="text-sm font-mono uppercase font-black text-[#141414]">
                05 // WPM PERFORMANCE TIMELINE
              </h3>
              <p className="text-[10px] text-[#141414]/60 font-mono uppercase">
                Second-by-second analytics chart
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-extrabold">
              <div className="w-4 h-1.5 bg-[#FF4E00] border border-[#141414]" />
              <span>Words Per Minute (WPM)</span>
            </div>
          </div>

          <div className="relative w-full overflow-x-auto mt-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto text-[#141414] font-mono text-[9px]"
            >
              <defs>
                {/* Vintage flat crosshatch pattern or heavy gradient matching */}
                <linearGradient id="flatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#141414" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#141414" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {yGridLines.map((gl, idx) => (
                <g key={idx} className="opacity-40">
                  <line
                    x1={paddingX}
                    y1={gl.y}
                    x2={chartWidth - paddingX}
                    y2={gl.y}
                    stroke="#141414"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <text
                    x={paddingX - 8}
                    y={gl.y + 3}
                    textAnchor="end"
                    className="fill-[#141414] font-bold"
                  >
                    {gl.label}
                  </text>
                </g>
              ))}

              {/* Shaded Area */}
              {areaPoints && (
                <path
                  d={`M ${areaPoints}`}
                  fill="url(#flatGrad)"
                />
              )}

              {/* Main graph path - solid brick black */}
              {points && (
                <path
                  d={`M ${points}`}
                  fill="none"
                  stroke="#141414"
                  strokeWidth="3.2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              )}

              {/* Horizontal ground rule line */}
              <line
                x1={paddingX}
                y1={chartHeight - paddingY}
                x2={chartWidth - paddingX}
                y2={chartHeight - paddingY}
                stroke="#141414"
                strokeWidth="2"
              />

              {/* Timeline ticks */}
              {gridLines.map((gl, idx) => (
                <g key={idx}>
                  <line
                    x1={gl.x}
                    y1={chartHeight - paddingY}
                    x2={gl.x}
                    y2={chartHeight - paddingY + 5}
                    stroke="#141414"
                    strokeWidth="1.5"
                  />
                  <text
                    x={gl.x}
                    y={chartHeight - paddingY + 15}
                    textAnchor="middle"
                    className="fill-[#141414] font-black"
                  >
                    {gl.label}
                  </text>
                </g>
              ))}

              {/* Peak pointer bubbles */}
              {history.map((p, idx) => {
                const maxSecond = history[history.length - 1].time;
                const maxWpm = Math.max(...history.map(pt => pt.wpm), 20);
                const getX = (time: number) => paddingX + (time / maxSecond) * (chartWidth - paddingX * 2);
                const getY = (wpmVal: number) => chartHeight - paddingY - (wpmVal / maxWpm) * (chartHeight - paddingY * 2);

                const isHighest = p.wpm === Math.max(...history.map(pt => pt.wpm));
                const isFirst = idx === 0;
                const isLast = idx === history.length - 1;

                if (isHighest || isFirst || isLast) {
                  return (
                    <g key={idx}>
                      <rect
                        x={getX(p.time) - 3}
                        y={getY(p.wpm) - 3}
                        width="6"
                        height="6"
                        fill={isHighest ? "#FF4E00" : "#141414"}
                        stroke="#141414"
                        strokeWidth="1.5"
                      />
                      {isHighest && (
                        <text
                          x={getX(p.time)}
                          y={getY(p.wpm) - 9}
                          textAnchor="middle"
                          className="fill-[#141414] font-black text-[8px] uppercase"
                        >
                          PEAK: {p.wpm}
                        </text>
                      )}
                    </g>
                  );
                }
                return null;
              })}
            </svg>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 border-2 border-dashed border-[#141414]/30 rounded-xl text-[#141414]/60 text-xs font-mono uppercase">
          Timeline analyzer requires historical key logs. Complete a full sprint sequence!
        </div>
      )}

      {/* Retro bold evaluation card */}
      <div className={`p-6 ${advice.style} flex items-start gap-4 select-none text-left`}>
        <div className="p-2 border-2 border-[#141414] bg-[#141414] text-[#E4E3E0] font-black italic">
          RATING
        </div>
        <div className="flex-grow">
          <h4 className="text-base font-mono font-black uppercase tracking-tight">
            {advice.title}
          </h4>
          <p className="text-xs text-[#141414] font-medium mt-1 uppercase tracking-tight leading-relaxed">
            {advice.msg}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
