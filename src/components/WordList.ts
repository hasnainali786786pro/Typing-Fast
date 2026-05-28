/**
 * Rich offline source lists for typing challenges.
 * Includes common words, software code snippets, and inspiring proverbs.
 */

import { TextCategory } from '../types';

export const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", 
  "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", 
  "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", 
  "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", 
  "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", 
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", 
  "any", "these", "give", "day", "most", "us", "web", "layout", "flexbox", "grid", "tailwind", "react", "component", 
  "state", "props", "hook", "effect", "callback", "memo", "render", "button", "screen", "timer", "speed", "test", 
  "word", "char", "minute", "accuracy", "offline", "modern", "design", "client", "custom", "audio", "synth", 
  "keystroke", "animation", "transition", "smooth", "premium", "developer", "designer", "coding", "software", 
  "hardware", "keyboard", "switch", "linear", "clicky", "tactile", "spacebar", "caps", "shift", "cursor", "caret",
  "focus", "dashboard", "glowing", "gradient", "dark", "minimal", "sleek", "elegant", "aesthetic", "shadow", 
  "border", "padding", "margin", "scrolling", "dynamic", "random", "generator", "phrase", "quote", "proverb", 
  "philosophy", "wisdom", "efficiency", "productivity", "system", "performance", "metric", "percentage", "rhythm",
  "practice", "learn", "grow", "mastery", "finger", "muscle", "memory", "instant", "feedback", "visual", 
  "graph", "chart", "timeline", "interval", "duration", "minute", "second", "elapsed", "score", "record", 
  "challenge", "perfect", "optimal", "clean", "structure", "hierarchy", "color", "contrast", "vibe", "style",
  "apple", "stripe", "linear", "system", "atomic", "declarative", "immutable", "functional", "object", "orient",
  "class", "function", "variable", "syntax", "sugar", "debugger", "console", "terminal", "compile", "bundle",
  "package", "command", "branch", "commit", "push", "pull", "merge", "repository", "vector", "canvas", "context",
  "scale", "future", "digital", "network", "virtual", "sandbox", "preview", "container", "isolated", "responsive",
  "mobile", "desktop", "tablet", "viewport", "media", "query", "pixel", "density", "ratio", "contrast", "harmony",
  "nature", "ocean", "mountain", "forest", "desert", "valley", "river", "stream", "cloud", "breeze", "whisper",
  "silence", "stellar", "galaxy", "orbit", "gravity", "energy", "quantum", "matrix", "simulation", "universe",
  "journey", "adventure", "discovery", "pioneer", "visionary", "creator", "artist", "architect", "engineer",
  "symphony", "melody", "rhythm", "harmony", "tempo", "beat", "instrument", "acoustic", "resonant", "harmonic"
];

export const TECHNICAL_SNIPPETS = [
  "const [typing, setTyping] = useState(false);",
  "export default function TypingSpeedTest({ duration, words }) {",
  "useEffect(() => { const timer = setInterval(() => { tick(); }, 1000); return () => clearInterval(timer); }, []);",
  "const accuracy = Math.round((correctChars / totalChars) * 100) || 100;",
  "const wpm = Math.round((correctChars / 5) / (timeElapsed / 60)) || 0;",
  "app.get('/api/health', (req, res) => res.json({ status: 'ok' }));",
  "const audioCtx = new (window.AudioContext || window.webkitAudioContext)();",
  "<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className='flex' />",
  "interface CharacterState { char: string; status: 'idle' | 'correct' | 'incorrect' | 'extra'; }",
  "const handler = (e: KeyboardEvent) => { if (e.key === 'Tab') { e.preventDefault(); resetTest(); } };",
  "const activeWord = words[wordIndex]; const char = activeWord[charIndex];",
  "document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown);",
  "const db = await sqlite.open({ filename: ':memory:', driver: sqlite3.Database });",
  "margin: 0 auto; max-width: 1200px; padding: 0 2rem; display: grid;",
  "import { motion, AnimatePresence } from 'motion/react';",
  "const getPercentage = (value: number, total: number): number => (value / total) * 100;",
  "Object.keys(state).reduce((acc, curr) => ({ ...acc, [curr]: true }), {});",
  "process.env.NODE_ENV === 'production' ? startProd() : startDev();",
  "console.log(`[Typing Test] Started with ${duration}s limit`);",
  "const colors = { primary: '#0ea5e9', secondary: '#ec4899', background: '#0f172a' };"
];

export const INSPIRATIONAL_QUOTES = [
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
  "Simple things should be simple, complex things should be possible. Design is not just what it looks like and feels like. Design is how it works.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts in the long run.",
  "Code represents your thoughts. If your thoughts are messy, your code will be messy. Keep your architecture simple, clear, and focused.",
  "Strive not to be a success, but rather to be of value. In the middle of difficulty lies opportunity.",
  "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma, which is living with the results of other people's thinking.",
  "The best visual is often the one that stays out of the user's way. Premium typography, generous negative space, and smooth transitions are the keys.",
  "A brilliant designer understands that perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
  "Stay hungry, stay foolish. Dare to dream, dare to build, and dare to make mistakes that shape your journey.",
  "Great works are performed not by strength but by perseverance. Continuous progress is better than delayed perfection.",
  "The beautiful thing about learning is that no one can take it away from you. Practice everyday, build muscle memory, and conquer your typing peaks.",
  "Simplicity is the ultimate sophistication. When you write clean software, you make the world a slightly better and more accessible place for everyone."
];

export function generateTestText(category: TextCategory, count: number = 70): string {
  if (category === 'quotes') {
    // Return a random quote
    const randQuote = INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];
    return randQuote;
  }
  
  if (category === 'code') {
    // Mix 3 to 5 random code snippets joined by a space
    const list: string[] = [];
    const iterations = Math.min(5, count > 30 ? 4 : 2);
    for (let i = 0; i < iterations; i++) {
      const randSnippet = TECHNICAL_SNIPPETS[Math.floor(Math.random() * TECHNICAL_SNIPPETS.length)];
      list.push(randSnippet);
    }
    return list.join(" ");
  }

  // Shuffle common words
  const shuffled = [...COMMON_WORDS].sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, Math.min(count, shuffled.length));

  // Capitalize sentence starts, add commas in between, and end with full stops (. or ,)
  const sentences: string[] = [];
  let index = 0;

  while (index < selectedWords.length) {
    const sentenceLength = Math.floor(Math.random() * 8) + 8; // length of 8 to 15 words
    const sentenceWords = selectedWords.slice(index, index + sentenceLength);
    if (sentenceWords.length === 0) break;

    // Capitalize first letter of the first word for new sentence start
    sentenceWords[0] = sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1);

    // 45% chance to insert a comma after an intermediate word inside the sentence
    if (sentenceWords.length > 4 && Math.random() < 0.45) {
      const commaIndex = Math.floor(Math.random() * (sentenceWords.length - 3)) + 2;
      sentenceWords[commaIndex] = sentenceWords[commaIndex] + ",";
    }

    // End sentence with a full stop
    const lastWordIdx = sentenceWords.length - 1;
    if (sentenceWords[lastWordIdx].endsWith(',')) {
      sentenceWords[lastWordIdx] = sentenceWords[lastWordIdx].slice(0, -1);
    }
    sentenceWords[lastWordIdx] = sentenceWords[lastWordIdx] + ".";

    sentences.push(sentenceWords.join(" "));
    index += sentenceLength;
  }

  return sentences.join(" ");
}
