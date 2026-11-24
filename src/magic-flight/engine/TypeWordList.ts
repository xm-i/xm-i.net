import { TypeWord, type WordDefinition } from "./TypeWord";

export class TypeWordList {
  private readonly _words: TypeWord[];
  private _unused: TypeWord[];

  constructor(list: WordDefinition[]) {
    this._words = list.map((def) => new TypeWord(def));
    this._unused = [...this._words];
  }

  get words(): readonly TypeWord[] {
    return this._words;
  }

  get unused(): TypeWord[] {
    return this._unused;
  }

  release(tags?: string[]): void {
    if (!tags || tags.length === 0) {
      this._unused = [...this._words];
    } else {
      for (const word of this._words) {
        if (word.match(...tags) && !this._unused.includes(word)) {
          this._unused.push(word);
        }
      }
    }
  }

  select(index: number, tags?: string[]): TypeWord | null {
    if (!tags || tags.length === 0) {
      return this._unused.splice(index, 1)[0] ?? null;
    }
    let c = 0;
    for (let i = 0; i < this._unused.length; i++) {
      if (this._unused[i].match(...tags)) {
        if (index === c++) {
          return this._unused.splice(i, 1)[0];
        }
      }
    }
    return null;
  }

  count(tags?: string[]): number {
    if (!tags || tags.length === 0) return this._unused.length;
    return this._unused.filter((w) => w.match(...tags)).length;
  }
}
