import { EventEmitter } from "./EventEmitter";
import { TypeConfig } from "./TypeConfig";
import { TypeUtil } from "./TypeUtil";

export interface WordDefinition {
  word: string;
  kana: string;
  tags?: string[];
}

export class TypeWord extends EventEmitter {
  readonly word: string;
  readonly kana: string;
  readonly tags: string[];
  readonly defaultRoman: string;
  readonly obj: WordDefinition;

  isTarget = false;
  isActive = false;
  chosen = false;
  roman = "";
  next: string[] = [];

  constructor(def: WordDefinition) {
    super();
    this.obj = def;
    this.word = def.word;
    let kana = def.kana;
    this.tags = def.tags ?? [];

    if (TypeConfig.space) kana += " ";
    this.kana = kana;

    const defaultRoman = TypeUtil.simplestRoman(kana, "", TypeConfig.option);
    if (defaultRoman === null) {
      throw new Error(`${kana} は正しくない文字を含みます。`);
    }
    this.defaultRoman = defaultRoman;
    this.roman = defaultRoman;
  }

  match(...tags: string[]): boolean {
    return tags.every((tag) => this.tags.includes(tag));
  }
}
