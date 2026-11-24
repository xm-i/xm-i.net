import { TypeData } from "./TypeData";
import type { TypeOption } from "./TypeOption";
import { arrayBlend } from "./ArrayUtil";

/** タイピングゲームに用いられる静的な関数をおさめたクラス */
export class TypeUtil {
  /** ローマ字のかなに変換可能な部分をかなに変換して返します。 */
  static kana(roman: string, option?: TypeOption): string {
    if (roman === "") return "";
    let kana: string | undefined | null;
    for (let i = 3; i > 0; i--) {
      const subroman = roman.substring(0, i);
      kana = undefined;
      if (option) {
        kana = option.kana(subroman);
      }
      if (!kana) {
        kana = TypeData.KANA[subroman];
      }
      if (!kana && i === 1) {
        const nextChar = roman.substring(i, i + 1);
        const hankaku = TypeData.HANKAKU.indexOf(subroman);
        if (subroman === nextChar && TypeData.LTU.includes(subroman)) {
          kana = "っ";
        } else if (subroman === "n" && !TypeData.NN.includes(nextChar)) {
          kana = "ん";
        } else if (hankaku !== -1) {
          kana = TypeData.ZENKAKU.substring(hankaku, hankaku + 1);
        }
      }
      if (kana) {
        return kana + TypeUtil.kana(roman.substring(i), option);
      }
    }
    return "";
  }

  /** 次にタイプできるキーの候補を返します。 */
  static next(kana: string, roman: string = "", option?: TypeOption): string[] {
    const nextKeys: string[] = [];
    if (kana === "") return [];

    for (let i = 2; i > 0; i--) {
      let roman2 = roman;
      const subkana = kana.substring(0, i);
      const nextKana = kana.substring(i);
      const subromans: string[] = [];

      if (option) {
        arrayBlend(subromans, option.romans(subkana));
      }

      if (i === 1) {
        const zenkaku = TypeData.ZENKAKU.indexOf(subkana);
        const hankaku = TypeData.HANKAKU.indexOf(subkana);
        if (subkana === "っ") {
          arrayBlend(subromans, this.preLtu(nextKana, option));
        } else if (subkana === "ん") {
          arrayBlend(subromans, this.preN(nextKana, option));
        } else if (zenkaku !== -1) {
          subromans.push(TypeData.HANKAKU.substring(zenkaku, zenkaku + 1));
        } else if (hankaku !== -1) {
          subromans.push(TypeData.HANKAKU.substring(hankaku, hankaku + 1));
        }
      }
      arrayBlend(subromans, TypeData.ROMANS[subkana]);

      let l = subromans.length;
      while (l > 0) {
        if (roman2.length === 0) {
          arrayBlend(nextKeys, this.firsts(subromans));
          break;
        }
        const first = roman2.substring(0, 1);
        for (let j = 0; j < l; j++) {
          if (subromans[j].substring(0, 1) === first) {
            subromans[j] = subromans[j].substring(1);
            if (subromans[j] === "") {
              arrayBlend(nextKeys, TypeUtil.next(nextKana, roman2.substring(1), option));
              subromans.splice(j, 1);
              l--;
              j--;
            }
          } else {
            subromans.splice(j, 1);
            l--;
            j--;
          }
        }
        roman2 = roman2.substring(1);
      }
    }
    return nextKeys;
  }

  /** かなに対するもっとも簡単なローマ字のふりかたを返します。 */
  static simplestRoman(kana: string, roman: string = "", option?: TypeOption): string | null {
    if (roman === "") return this.simplestRomanInternal(kana, option);

    for (let i = 2; i > 0; i--) {
      const roman2 = roman;
      const subkana = kana.substring(0, i);
      const nextKana = kana.substring(i);
      const subromans: string[] = [];

      if (option) arrayBlend(subromans, option.romans(subkana));

      if (i === 1) {
        const zenkaku = TypeData.ZENKAKU.indexOf(subkana);
        const hankaku = TypeData.HANKAKU.indexOf(subkana);
        if (subkana === "っ") arrayBlend(subromans, this.preLtu(nextKana, option));
        else if (subkana === "ん") arrayBlend(subromans, this.preN(nextKana, option));
        else if (zenkaku !== -1) subromans.push(TypeData.HANKAKU.substring(zenkaku, zenkaku + 1));
        else if (hankaku !== -1) subromans.push(TypeData.HANKAKU.substring(hankaku, hankaku + 1));
      }
      arrayBlend(subromans, TypeData.ROMANS[subkana]);

      for (const subroman of subromans) {
        const rl = subroman.length;
        let c = 0;
        while (true) {
          // AS3版の roman2.substr(c, 1) と indexOf(one, c) == c の挙動を忠実に再現。
          // c >= roman2.length のとき one === "" となり、途中一致中の subroman でも最簡ローマ字を返せる。
          const one = roman2.substring(c, c + 1);
          if (subroman.indexOf(one, c) === c) {
            if (rl === c + 1) {
              const nextResult = this.simplestRoman(nextKana, roman2.substring(rl), option);
              if (nextResult !== null) return subroman + nextResult;
              break;
            }
          } else {
            break;
          }
          c++;
        }
      }
    }
    return null;
  }

  private static simplestRomanInternal(kana: string, option?: TypeOption): string | null {
    if (kana === "") return "";

    for (let i = 2; i > 0; i--) {
      const subkana = kana.substring(0, i);
      const nextKana = kana.substring(i);
      let roman: string | undefined;

      if (option) {
        roman = option.romans(subkana)[0];
      }
      if (!roman && i === 1) {
        const zenkaku = TypeData.ZENKAKU.indexOf(subkana);
        const hankaku = TypeData.HANKAKU.indexOf(subkana);
        if (subkana === "っ") {
          roman = this.preLtu(nextKana, option)[0];
        } else if (subkana === "ん") {
          roman = this.preN(nextKana, option)[0];
        } else if (zenkaku !== -1) {
          roman = TypeData.HANKAKU.substring(zenkaku, zenkaku + 1);
        } else if (hankaku !== -1) {
          roman = TypeData.HANKAKU.substring(hankaku, hankaku + 1);
        }
      }
      if (!roman) {
        const romans = TypeData.ROMANS[subkana];
        if (romans) roman = romans[0];
      }
      if (roman) {
        const nextResult = this.simplestRomanInternal(nextKana, option);
        if (nextResult !== null) return roman + nextResult;
      }
    }
    return null;
  }

  private static preLtu(kana: string, option?: TypeOption): string[] {
    const nextKeys = TypeUtil.next(kana, "", option);
    const pre: string[] = [];
    for (const n of nextKeys) {
      if (TypeData.LTU.includes(n)) pre.push(n);
    }
    return pre;
  }

  private static preN(kana: string, option?: TypeOption): string[] {
    const nextKeys = TypeUtil.next(kana, "", option);
    for (const n of nextKeys) {
      if (!TypeData.NN.includes(n)) return ["n"];
    }
    return [];
  }

  private static firsts(arr: string[]): string[] {
    return arr.map((s) => s.substring(0, 1));
  }
}
