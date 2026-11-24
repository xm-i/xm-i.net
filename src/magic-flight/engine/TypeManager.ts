import { EventEmitter } from "./EventEmitter";
import { type TypingEngine, TypeMessageKeys } from "./TypingEngine";
import type { TypeWord, WordDefinition } from "./TypeWord";
import { TypeWordList } from "./TypeWordList";
import { TypingEvents } from "./TypeEvents";

export class TypeManager extends EventEmitter {
  private _typing: TypingEngine;
  private _wordLists: TypeWordList[] = [];

  hint: TypeWord[] = [];
  timeLimit = -1;
  postLimit = -1;
  postCount = 0;
  wordLimit = -1;
  zeroPost = true;
  postTime = -1;
  random = false;

  private _lastPost = 0;
  private _counting = false;
  private _delay = 0;
  private _countLength = 3;
  private _countText = "";
  private _startTime = 0;

  isReady = false;

  constructor(typing: TypingEngine, ...wordLists: (WordDefinition[] | TypeWordList)[]) {
    super();
    this._typing = typing;
    for (const list of wordLists) {
      if (Array.isArray(list)) {
        this._wordLists.push(new TypeWordList(list));
      } else {
        this._wordLists.push(list);
      }
    }
    this.bindTyping();
    this.managerInit();
  }

  get typing(): TypingEngine { return this._typing; }
  get wordLists(): readonly TypeWordList[] { return this._wordLists; }
  get counting(): boolean { return this._counting; }
  get delay(): number { return this._delay; }
  get countLength(): number { return this._countLength; }

  private bindTyping(): void {
    this._typing.on(TypingEvents.START, this.onStart);
    this._typing.on(TypingEvents.WORD_REMOVED, this.onWordRemoved);
  }

  destroy(): void {
    this._typing.off(TypingEvents.START, this.onStart);
    this._typing.off(TypingEvents.WORD_REMOVED, this.onWordRemoved);
  }

  managerInit(): void {
    this._counting = false;
    this.isReady = false;
    this.hint = [];
    this.postCount = 0;
    this._delay = 0;
    this.release();
  }

  release(): void {
    for (const list of this._wordLists) list.release();
  }

  ready(delay = 0, countLength = 3): void {
    if (this._typing.running) this._typing.stop();
    this._typing.init();
    this.managerInit();
    this._delay = delay;
    this._countLength = countLength;
    this.isReady = true;
    this._typing.addMessage(TypeMessageKeys.PUSH_SPACE_KEY);
  }

  startFromSpaceKey(): void {
    if (!this.isReady) return;
    this._typing.removeMessage(TypeMessageKeys.PUSH_SPACE_KEY);
    this.isReady = false;
    if (this._delay <= 0) {
      this._typing.start(false);
    } else {
      this._startTime = performance.now() + this._delay;
      this._counting = true;
    }
  }

  update(): void {
    if (this._counting) {
      const t2 = this._startTime - performance.now();
      const t = Math.ceil(t2 / 1000);
      if (t <= 0) {
        this._counting = false;
        this._typing.start(false);
      } else if (t <= this._countLength) {
        const str = t.toString();
        if (this._countText !== str) {
          this._countText = str;
          this._typing.sound.play("count");
          this._typing.addMessage(str, 1000);
        }
      }
    }
    if (this._typing.running) {
      if (this.timeLimit !== -1 && this._typing.time >= this.timeLimit) {
        this.complete();
      }
      if (this.postTime !== -1 && this._typing.time - this._lastPost >= this.postTime) {
        this.post();
      }
    }
  }

  post(): TypeWord | null {
    if (this.postLimit === this.postCount) return null;

    let word: TypeWord | null = null;
    let success = false;
    while (!success) {
      if (this.hint.length === 0) this.addHint();
      word = this.hint[0];
      success = this._typing.addWord(word);
      this.hint.shift();
    }
    this._lastPost = this._typing.time;
    this.postCount++;
    return word;
  }

  addHint(...tags: string[]): void {
    let totalCount = 0;
    const counts: number[] = [];

    for (let attempt = 0; totalCount === 0; attempt++) {
      if (attempt === 1) {
        for (const list of this._wordLists) list.release(tags);
      } else if (attempt > 1) {
        throw new Error("追加できる単語がありません。");
      }
      counts.length = 0;
      totalCount = 0;
      for (const list of this._wordLists) {
        const c = list.count(tags);
        counts.push(c);
        totalCount += c;
      }
    }

    let num = this.random ? Math.floor(totalCount * Math.random()) : 0;
    for (let i = 0; i < this._wordLists.length; i++) {
      if (num < counts[i]) {
        const word = this._wordLists[i].select(num, tags);
        if (word) this.hint.push(word);
        return;
      }
      num -= counts[i];
    }
  }

  complete(): void {
    this.emit(TypingEvents.COMPLETE);
    this._typing.stop();
    this.release();
    this._typing.addMessage(TypeMessageKeys.FINISH);
  }

  private onStart = (): void => { this.check(); };
  private onWordRemoved = (): void => { this.check(); };

  private check(): void {
    if (this.wordLimit === this._typing.typedWord) {
      this.complete();
      return;
    }
    if (this._typing.target.length === 0) {
      if (this.postLimit === this.postCount) {
        this.complete();
      } else if (this.zeroPost) {
        this.post();
      }
    }
  }
}
