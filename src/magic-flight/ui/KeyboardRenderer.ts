import { TypeData } from "../engine/TypeData";
import { TypeConfig } from "../engine/TypeConfig";

interface KeyDef {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  shiftLabel: string;
  key: string;
  shiftKey: string;
  state: "up" | "down" | "over";
  smallFont?: boolean;
}

const KEY_W = 38;
const KEY_H = 39;
const ROW_STEP = 40;

/**
 * 1994年 NEC版『Magic Flight』のPC-98風 3D立体グレーキーボード再現。
 * 次にタイプすべきキーを黄色 (#FFEE00) でハイライトする。
 */
export class KeyboardRenderer {
  private keys: KeyDef[] = [];
  private shifted = false;
  private board = TypeConfig.board;

  constructor() {
    this.buildKeys();
  }

  private buildKeys(): void {
    this.keys = [];
    this.board = TypeConfig.board;

    const keyRows = this.board === "dvorak" ? TypeData.DVORAK_KEY : TypeData.QWERTY_KEY;
    const shiftRows = this.board === "dvorak" ? TypeData.DVORAK_SHIFT : TypeData.QWERTY_SHIFT;

    // 1段目 (y = 0): ESC + 13キー + BS (合計幅 607px)
    this.keys.push({
      x: 0,
      y: 0,
      w: 48,
      h: KEY_H,
      label: "ESC",
      shiftLabel: "ESC",
      key: "",
      shiftKey: "",
      state: "up",
      smallFont: true,
    });
    for (let j = 0; j < keyRows[0].length; j++) {
      const ch = keyRows[0].charAt(j);
      const sch = shiftRows[0].charAt(j);
      const disp = ch === "￥" ? "¥" : ch;
      const sdisp = sch === "　" ? "" : sch;
      this.keys.push({
        x: 48 + j * KEY_W,
        y: 0,
        w: KEY_W,
        h: KEY_H,
        label: disp,
        shiftLabel: sdisp,
        key: ch === "￥" ? "\\" : ch,
        shiftKey: sch,
        state: "up",
      });
    }
    this.keys.push({
      x: 48 + keyRows[0].length * KEY_W,
      y: 0,
      w: 65,
      h: KEY_H,
      label: "BS",
      shiftLabel: "BS",
      key: "BS",
      shiftKey: "BS",
      state: "up",
      smallFont: true,
    });

    // 2段目 (y = 40): TAB + 12キー
    this.keys.push({
      x: 0,
      y: ROW_STEP,
      w: 65,
      h: KEY_H,
      label: "TAB",
      shiftLabel: "TAB",
      key: "",
      shiftKey: "",
      state: "up",
      smallFont: true,
    });
    for (let j = 0; j < keyRows[1].length; j++) {
      const ch = keyRows[1].charAt(j);
      const sch = shiftRows[1].charAt(j);
      this.keys.push({
        x: 65 + j * KEY_W,
        y: ROW_STEP,
        w: KEY_W,
        h: KEY_H,
        label: /^[a-z]$/.test(ch) ? ch.toUpperCase() : ch,
        shiftLabel: sch,
        key: ch,
        shiftKey: sch,
        state: "up",
      });
    }

    // 3段目 (y = 80): CTRL + CAPS + 12キー
    this.keys.push({
      x: 0,
      y: ROW_STEP * 2,
      w: 38,
      h: KEY_H,
      label: "CTRL",
      shiftLabel: "CTRL",
      key: "",
      shiftKey: "",
      state: "up",
      smallFont: true,
    });
    this.keys.push({
      x: 38,
      y: ROW_STEP * 2,
      w: 40,
      h: KEY_H,
      label: "CAPS",
      shiftLabel: "CAPS",
      key: "",
      shiftKey: "",
      state: "up",
      smallFont: true,
    });
    for (let j = 0; j < keyRows[2].length; j++) {
      const ch = keyRows[2].charAt(j);
      const sch = shiftRows[2].charAt(j);
      this.keys.push({
        x: 78 + j * KEY_W,
        y: ROW_STEP * 2,
        w: KEY_W,
        h: KEY_H,
        label: /^[a-z]$/.test(ch) ? ch.toUpperCase() : ch,
        shiftLabel: sch,
        key: ch,
        shiftKey: sch,
        state: "up",
      });
    }

    // Enter (2〜3段目右端)
    this.keys.push({
      x: 538,
      y: ROW_STEP,
      w: 69,
      h: ROW_STEP + KEY_H,
      label: "Enter",
      shiftLabel: "Enter",
      key: TypeConfig.enter,
      shiftKey: TypeConfig.enter,
      state: "up",
      smallFont: true,
    });

    // 4段目 (y = 120): SHIFT + 11キー + SHIFT
    this.keys.push({
      x: 0,
      y: ROW_STEP * 3,
      w: 90,
      h: KEY_H,
      label: "SHIFT",
      shiftLabel: "SHIFT",
      key: "Shift",
      shiftKey: "Shift",
      state: "up",
      smallFont: true,
    });
    for (let j = 0; j < keyRows[3].length; j++) {
      const ch = keyRows[3].charAt(j);
      const sch = shiftRows[3].charAt(j);
      const disp = ch === "\\" ? "¥" : /^[a-z]$/.test(ch) ? ch.toUpperCase() : ch;
      this.keys.push({
        x: 90 + j * KEY_W,
        y: ROW_STEP * 3,
        w: KEY_W,
        h: KEY_H,
        label: disp,
        shiftLabel: sch,
        key: ch,
        shiftKey: sch,
        state: "up",
      });
    }
    this.keys.push({
      x: 508,
      y: ROW_STEP * 3,
      w: 99,
      h: KEY_H,
      label: "SHIFT",
      shiftLabel: "SHIFT",
      key: "Shift",
      shiftKey: "Shift",
      state: "up",
      smallFont: true,
    });

    // 5段目 (y = 160): かな, GRPH, NFER, Space, XFER
    this.keys.push(
      { x: 72, y: ROW_STEP * 4, w: 38, h: KEY_H, label: "かな", shiftLabel: "かな", key: "", shiftKey: "", state: "up", smallFont: true },
      { x: 110, y: ROW_STEP * 4, w: 38, h: KEY_H, label: "GRPH", shiftLabel: "GRPH", key: "", shiftKey: "", state: "up", smallFont: true },
      { x: 148, y: ROW_STEP * 4, w: 56, h: KEY_H, label: "NFER", shiftLabel: "NFER", key: "", shiftKey: "", state: "up", smallFont: true },
      { x: 204, y: ROW_STEP * 4, w: 249, h: KEY_H, label: "", shiftLabel: "", key: " ", shiftKey: " ", state: "up" },
      { x: 453, y: ROW_STEP * 4, w: 56, h: KEY_H, label: "XFER", shiftLabel: "XFER", key: "", shiftKey: "", state: "up", smallFont: true },
    );
  }

  updateHighlights(nextKeys: string[]): void {
    if (this.board !== TypeConfig.board) {
      this.buildKeys();
    }
    this.shifted = false;
    for (const key of this.keys) key.state = "up";
    if (!nextKeys || nextKeys.length === 0) return;

    for (let i = 0; i < nextKeys.length; i++) {
      const str = nextKeys[i];
      for (const key of this.keys) {
        if (key.key === "") continue;
        if (key.key === str) {
          if (i === 0) key.state = "down";
          else if (key.state === "up" && !this.shifted) key.state = "over";
        } else if (key.shiftKey === str) {
          if (i === 0) {
            key.state = "down";
            this.shifted = true;
            this.activateShiftKeys();
          } else if (key.state === "up" && this.shifted) {
            key.state = "over";
          }
        }
      }
    }
  }

  private activateShiftKeys(): void {
    for (const key of this.keys) {
      if (key.key === "Shift") {
        key.state = "down";
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number): void {
    for (const key of this.keys) {
      this.drawKey(ctx, key, offsetX, offsetY);
    }
  }

  private drawKey(ctx: CanvasRenderingContext2D, key: KeyDef, offsetX: number, offsetY: number): void {
    const x = offsetX + key.x;
    const y = offsetY + key.y;
    const w = key.w;
    const h = key.h;

    const isDown = key.state === "down";
    const isOver = key.state === "over";

    // キートップ面カラー
    const faceFill = isDown ? "#FFEE00" : isOver ? "#FFFF99" : "#CCCCCC";
    const lightEdge = isDown ? "#FFFFAA" : isOver ? "#FFFFDD" : "#FFFFFF";
    const darkEdge = isDown ? "#BBAA00" : isOver ? "#CCCC66" : "#777777";

    // 外枠 (黒)
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y, w, h);

    // 立体ベベル (上・左ハイライト / 下・右シャドウ)
    const ix = x + 1;
    const iy = y + 1;
    const iw = w - 2;
    const ih = h - 2;

    ctx.fillStyle = darkEdge;
    ctx.fillRect(ix, iy, iw, ih);

    ctx.fillStyle = lightEdge;
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ix + iw, iy);
    ctx.lineTo(ix + iw - 3, iy + 3);
    ctx.lineTo(ix + 3, iy + ih - 3);
    ctx.lineTo(ix, iy + ih);
    ctx.closePath();
    ctx.fill();

    // キートップ内面
    ctx.fillStyle = faceFill;
    ctx.fillRect(ix + 2, iy + 2, iw - 5, ih - 5);

    // キートップラベル
    const text = this.shifted ? key.shiftLabel : key.label;
    if (text !== "") {
      ctx.fillStyle = "#000000";
      const fontSize = key.smallFont ? 11 : 13;
      ctx.font = `${fontSize}px 'MS PGothic', 'メイリオ', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + w / 2 - 1, y + h / 2);
    }
  }
}
