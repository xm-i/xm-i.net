export type TypeOptionTuple = [kana: string, roman: string];
export interface TypeOptionEntry {
  kana: string;
  roman: string;
}

export class TypeOption {
  options: TypeOptionTuple[] = [];

  static readonly IROHA: TypeOptionTuple[] = [
    ["ゑ", "we"],
    ["ゐ", "wi"],
  ];
  static readonly CHA: TypeOptionTuple[] = [
    ["ちゃ", "cha"],
    ["ちゅ", "chu"],
    ["ちぇ", "che"],
    ["ちょ", "cho"],
  ];
  static readonly SHA: TypeOptionTuple[] = [
    ["しゃ", "sha"],
    ["しゅ", "shu"],
    ["しぇ", "she"],
    ["しょ", "sho"],
  ];
  static readonly ZYA: TypeOptionTuple[] = [
    ["じゃ", "zya"],
    ["じゅ", "zyu"],
    ["じぇ", "zye"],
    ["じょ", "zyo"],
  ];

  constructor(...arrays: (TypeOptionTuple[] | TypeOptionEntry[])[]) {
    for (const arr of arrays) {
      for (const item of arr) {
        this.addOption(item);
      }
    }
  }

  addOption(item: TypeOptionTuple | TypeOptionEntry): void {
    if (Array.isArray(item)) {
      this.options.push(item);
    } else {
      this.options.push([item.kana, item.roman]);
    }
  }

  romans(kana: string): string[] {
    const romans: string[] = [];
    for (const option of this.options) {
      if (option[0] === kana) {
        romans.push(option[1]);
      }
    }
    return romans;
  }

  kana(roman: string): string | null {
    for (const option of this.options) {
      if (option[1] === roman) {
        return option[0];
      }
    }
    return null;
  }
}
