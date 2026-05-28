export type TestDuration = 60 | 180 | 300; // 1, 3, or 5 minutes in seconds

export type TextCategory = 'words' | 'quotes' | 'code';

export interface CharacterState {
  char: string;
  status: 'idle' | 'correct' | 'incorrect' | 'extra';
}

export interface WpmHistoryPoint {
  time: number; // in seconds
  wpm: number;
  accuracy: number;
  errors: number;
}

export interface TestStats {
  wpm: number;
  accuracy: number;
  rawWpm: number;
  correctChars: number;
  errorChars: number;
  totalChars: number;
  history: WpmHistoryPoint[];
}

export interface SoundProfile {
  id: string;
  name: string;
  frequency: number;
  decay: number;
}
