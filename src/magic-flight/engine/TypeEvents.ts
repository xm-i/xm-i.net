import type { TypeWord } from "./TypeWord";

export interface TypeEventData {
  time: number;
  typed: string;
  word?: TypeWord;
  miss: number;
}

export const TypingEvents = {
  INIT: "init",
  START: "start",
  STOP: "stop",
  PAUSE: "pause",
  RESUME: "resume",
  MESSAGE: "message",
  WORD_ADDED: "wordAdded",
  WORD_REMOVED: "wordRemoved",
  WORD_TYPED: "wordTyped",
  TYPED: "typed",
  MISSED: "missed",
  COMPLETE: "complete",
} as const;
