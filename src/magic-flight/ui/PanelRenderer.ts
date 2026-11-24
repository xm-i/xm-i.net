import type { TypingEngine } from "../engine/TypingEngine";

const PANEL_FONT_FAMILY = '"MS PGothic", "メイリオ", "Meiryo", sans-serif';

/**
 * プレイ中のワード表示パネル (上部空エリア x=0, y=0, w=650, h=100)。
 * かな・ワード・ローマ字(入力済み/次の1文字/未入力)を中央揃えで表示する。
 */
export class PanelRenderer {
  draw(
    ctx: CanvasRenderingContext2D,
    typing: TypingEngine,
    x: number,
    y: number,
    w: number,
    h: number,
    textAlpha: number,
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    let kanaText = "";
    let wordText = "";
    let typed = typing.text;
    let next = "";
    let untyped = "";

    if (typing.active.length === 1) {
      const wd = typing.active[0];
      const l = typing.text.length;
      kanaText = wd.kana;
      wordText = wd.word;
      typed = typing.text;
      next = wd.roman.substring(l, l + 1);
      untyped = wd.roman.substring(l + 1);
    }

    const isSpacePrompt = next === " ";
    ctx.globalAlpha = isSpacePrompt ? 0.23 : textAlpha;

    const kanaH = 14;
    const wordH = 26;
    const romanH = 20;
    const totalY = kanaH + 5 + wordH + 5 + romanH + 4;
    let curY = y + h / 2 - totalY / 2;

    // かな
    ctx.font = `12px ${PANEL_FONT_FAMILY}`;
    ctx.fillStyle = "#114466";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    if (kanaText !== "") {
      ctx.fillText(kanaText, x + w / 2, curY);
    }
    curY += kanaH + 5;

    // 単語
    ctx.font = `bold 22px ${PANEL_FONT_FAMILY}`;
    ctx.fillStyle = "#000000";
    if (wordText !== "") {
      ctx.fillText(wordText, x + w / 2, curY);
    }
    curY += wordH + 5;

    // ローマ字: typed(薄青) + next(赤強調) + untyped(濃紺)
    const romanFont = `bold 16px 'Consolas', 'MS Gothic', monospace`;
    ctx.font = romanFont;
    const typedW = ctx.measureText(typed).width;
    const nextW = ctx.measureText(next).width;
    const untypedW = ctx.measureText(untyped).width;
    const totalW = typedW + nextW + untypedW;
    let rx = x + w / 2 - totalW / 2;

    ctx.textAlign = "left";
    ctx.fillStyle = "#6699AA";
    ctx.fillText(typed, rx, curY);
    rx += typedW;

    ctx.fillStyle = "#FF2200";
    ctx.fillText(next, rx, curY);
    rx += nextW;

    ctx.fillStyle = "#001166";
    ctx.fillText(untyped, rx, curY);

    if (isSpacePrompt) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#FF3300";
      ctx.font = `bold 40px ${PANEL_FONT_FAMILY}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SPACE", x + w / 2, y + h / 2);
    }

    ctx.restore();
  }
}
