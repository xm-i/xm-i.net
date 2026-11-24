import { EventEmitter } from "./EventEmitter";
import { TypeConfig } from "./TypeConfig";
import { TypeUtil } from "./TypeUtil";
import type { TypeWord } from "./TypeWord";
import { type TypeEventData, TypingEvents } from "./TypeEvents";
import { TypeSound } from "./TypeSound";
import { arrayBlend } from "./ArrayUtil";

export const TypeMessageKeys = {
  FINISH: "FINISH",
  SPACE: "SPACE",
  PUSH_SPACE_KEY: "PUSH SPACE KEY",
  MISS: "MISS",
  PAUSE: "PAUSE",
  NIHONGO: "日本語入力を解除してください。",
} as const;

export class TypingEngine extends EventEmitter {
  target: TypeWord[] = [];
  active: TypeWord[] = [];
  ignore: number[] = [];

  miss = 0;
  correct = 0;
  time = 0;
  typedWord = 0;
  addedWord = 0;
  lastType = 0;
  lastWord = 0;
  startWord = 0;
  keyMiss = 0;
  wordMiss = 0;

  readonly sound = new TypeSound();

  private _running = false;
  private _paused = false;
  private _nihongo = false;
  private _text = "";
  private _next: string[] = [];
  private _lastTick = 0;
  private _messages: string[] = [];
  private _messageTimers: ReturnType<typeof setTimeout>[] = [];

  get running(): boolean { return this._running; }
  get paused(): boolean { return this._paused; }
  get text(): string { return this._text; }
  get next(): string[] { return this._next; }
  get message(): string | null {
    return this._messages.length > 0 ? this._messages[this._messages.length - 1] : null;
  }
  get messageList(): string[] { return this._messages; }

  init(): void {
    for (const timer of this._messageTimers) clearTimeout(timer);
    this._messageTimers = [];
    while (this._messages.length > 0) this.removeMessage(this._messages[0]);
    this._next = [];
    this._text = "";
    this._running = false;
    this._paused = false;
    this._nihongo = false;
    this.time = 0;
    this.addedWord = 0;
    this.typedWord = 0;
    this.correct = 0;
    this.miss = 0;
    this.lastType = 0;
    this.lastWord = 0;
    this.startWord = 0;
    this.keyMiss = 0;
    this.wordMiss = 0;
    this.target = [];
    this.active = [];
    this.emit(TypingEvents.INIT);
  }

  addWord(word: TypeWord): boolean {
    if (this.target.includes(word)) return false;
    this.addedWord++;
    this.target.push(word);
    word.isTarget = true;
    word.next = TypeUtil.next(word.kana, this._text, TypeConfig.option);
    word.isActive = word.next.length > 0;
    if (word.isActive) this.active.push(word);
    word.roman = TypeUtil.simplestRoman(word.kana, this._text, TypeConfig.option) ?? word.defaultRoman;
    arrayBlend(this._next, word.next);

    const eventData: TypeEventData = { time: this.time, typed: "", word, miss: 0 };
    this.emit(TypingEvents.WORD_ADDED, eventData);
    word.emit(TypingEvents.WORD_ADDED, eventData);
    return true;
  }

  removeWord(word: TypeWord): void {
    const index = this.target.indexOf(word);
    if (index !== -1) this.removeAt(index);
  }

  removeAt(index: number): void {
    const word = this.target[index];
    if (!word) return;
    word.isTarget = false;
    this.target.splice(index, 1);
    const activeIndex = this.active.indexOf(word);
    if (activeIndex !== -1) {
      word.isActive = false;
      this.active.splice(activeIndex, 1);
    }
    this.updateWords();
    const eventData: TypeEventData = { time: this.time, typed: "", word, miss: 0 };
    word.emit(TypingEvents.WORD_REMOVED, eventData);
    this.emit(TypingEvents.WORD_REMOVED, eventData);
  }

  removeAll(): void {
    while (this.target.length > 0) this.removeAt(0);
  }

  start(initialize = true): void {
    if (initialize) this.init();
    if (!this._running) {
      this._running = true;
      this._lastTick = performance.now();
      this.emit(TypingEvents.START);
      this.sound.play("start");
    } else {
      this.emit(TypingEvents.START);
    }
  }

  stop(): void {
    if (this._running) {
      this._running = false;
      this.emit(TypingEvents.STOP);
      this.sound.play("stop");
    } else {
      this.emit(TypingEvents.STOP);
    }
  }

  pause(): void {
    if (this._running && !this._paused) {
      this._paused = true;
      this.addMessage(TypeMessageKeys.PAUSE);
      this.emit(TypingEvents.PAUSE);
      this.sound.play("pause");
    }
  }

  resume(): void {
    if (this._running && this._paused) {
      this._paused = false;
      this._lastTick = performance.now();
      this.removeMessage(TypeMessageKeys.PAUSE);
      this.emit(TypingEvents.RESUME);
      this.sound.play("resume");
    }
  }

  update(): void {
    if (this._running && !this._paused) {
      const now = performance.now();
      this.time += now - this._lastTick;
      this._lastTick = now;
    }
  }

  handleKeyboardEvent(evt: KeyboardEvent): void {
    const k = evt.keyCode;
    if (k === 229 || evt.isComposing) {
      if (!this._nihongo) {
        this._nihongo = true;
        this.addMessage(TypeMessageKeys.NIHONGO);
      }
    } else {
      if (this._nihongo) {
        this._nihongo = false;
        this.removeMessage(TypeMessageKeys.NIHONGO);
      }
    }
    if (this._nihongo) return;
    if (this.ignore.includes(k)) return;

    if (!this._running || this._paused) return;
    if (k === 16 || k === 17) return; // Shift / Ctrl
    if (evt.ctrlKey || evt.metaKey || evt.altKey) return;

    if (k === 8 || evt.key === "Backspace") {
      evt.preventDefault();
      this.backSpace();
      return;
    }

    const s = evt.key === "Enter" ? "\r" : evt.key.length === 1 ? evt.key : "";
    if (s === "") return;

    evt.preventDefault();
    this.handleKeyDown(s);
  }

  handleKeyDown(char: string): void {
    if (!this._running || this._paused) return;
    if (char === "" || char.length !== 1) return;

    const now = performance.now();
    this.time += now - this._lastTick;
    this._lastTick = now;

    const nx = this._next.indexOf(char);

    if (nx === -1) {
      this.miss++;
      this.keyMiss++;
      this.wordMiss++;
      this.emit(TypingEvents.MISSED, { time: this.time, typed: char, miss: this.keyMiss } as TypeEventData);
      this.addMessage(TypeMessageKeys.MISS, 100);
      this.sound.play("missType");
    } else {
      this.correct++;
      this._text += char;
      if (this._text.length === 1) this.startWord = this.time;

      let flag = false;
      let typedWordObj: TypeWord | undefined;
      this._next = [];

      for (let i = 0; i < this.active.length; i++) {
        const word = this.active[i];
        word.next = TypeUtil.next(word.kana, this._text, TypeConfig.option);
        word.isActive = word.next.length > 0;
        arrayBlend(this._next, word.next);

        if (word.roman === this._text) {
          flag = true;
          typedWordObj = word;
          this._text = "";
          this.removeWord(word);
          break;
        }

        if (word.isActive) {
          word.roman = TypeUtil.simplestRoman(word.kana, this._text, TypeConfig.option) ?? word.defaultRoman;
        } else {
          word.roman = word.defaultRoman;
          this.active.splice(i, 1);
          i--;
        }
      }

      this.lastType = this.time;
      this.emit(TypingEvents.TYPED, { time: this.time, typed: char, miss: this.keyMiss } as TypeEventData);

      if (flag && typedWordObj) {
        this.typedWord++;
        this.lastWord = this.time;
        const eventData: TypeEventData = {
          time: this.time,
          typed: typedWordObj.roman,
          word: typedWordObj,
          miss: this.wordMiss,
        };
        typedWordObj.emit(TypingEvents.WORD_TYPED, eventData);
        this.emit(TypingEvents.WORD_TYPED, eventData);
        this.wordMiss = 0;
        this.sound.play("wordType");
      } else {
        this.sound.play("type");
      }

      this.keyMiss = 0;
    }
  }

  private backSpace(): void {
    if (this._text.length === 0) {
      this.miss++;
    }
  }

  addMessage(msg: string, duration?: number): void {
    if (msg === "") return;
    this._messages.push(msg);
    if (duration !== undefined && duration >= 0) {
      const timer = setTimeout(() => {
        this.removeMessage(msg);
      }, duration);
      this._messageTimers.push(timer);
    }
    this.emit(TypingEvents.MESSAGE);
  }

  removeMessage(msg: string): boolean {
    if (msg === "") return false;
    const i = this._messages.indexOf(msg);
    if (i !== -1) {
      this._messages.splice(i, 1);
      this.emit(TypingEvents.MESSAGE);
      return true;
    }
    return false;
  }

  private updateWords(): void {
    this.active = [];
    this._next = [];
    for (const word of this.target) {
      word.isActive = true;
      this.active.push(word);
      word.next = TypeUtil.next(word.kana, this._text, TypeConfig.option);
      arrayBlend(this._next, word.next);
      word.roman = word.defaultRoman;
    }
  }
}
