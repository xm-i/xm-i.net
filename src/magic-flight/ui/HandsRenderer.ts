import { TypeData } from "../engine/TypeData";
import { TypeConfig } from "../engine/TypeConfig";

interface FingerDef {
  tipX: number;
  tipY: number;
  keys: string;
  shiftKeys: string;
  state: "up" | "down" | "over";
}

// hands_bg.png (70, 411) 上の10本の指先座標
const FINGER_TIPS: [number, number][] = [
  [106, 449], // 0: 左小指
  [150, 429], // 1: 左薬指
  [194, 429], // 2: 左中指
  [238, 439], // 3: 左人差指
  [278, 474], // 4: 左親指
  [384, 454], // 5: 右親指 (画像5のピンク丸位置)
  [422, 439], // 6: 右人差指
  [466, 424], // 7: 右中指
  [510, 429], // 8: 右薬指
  [546, 439], // 9: 右小指
];

/**
 * 1994年 NEC版『Magic Flight』の下部両手ガイド再現。
 * hands_bg.png を描画し、次に打つべき指先にピンクの丸 (#FF22EE) を表示する。
 */
export class HandsRenderer {
  private fingers: FingerDef[] = [];
  private board = TypeConfig.board;

  constructor() {
    this.buildFingers();
  }

  private buildFingers(): void {
    this.fingers = [];
    this.board = TypeConfig.board;

    const keyRows = this.board === "dvorak" ? TypeData.DVORAK_KEY : TypeData.QWERTY_KEY;
    const shiftRows = this.board === "dvorak" ? TypeData.DVORAK_SHIFT : TypeData.QWERTY_SHIFT;

    for (let i = 0; i < 10; i++) {
      this.fingers.push({
        tipX: FINGER_TIPS[i][0],
        tipY: FINGER_TIPS[i][1],
        keys: "",
        shiftKeys: "",
        state: "up",
      });
    }

    for (const row of keyRows) {
      for (let i = 0; i < row.length; i++) {
        const fingerIdx = TypeData.FINGER[i];
        if (fingerIdx !== undefined && this.fingers[fingerIdx]) {
          const ch = row.charAt(i);
          this.fingers[fingerIdx].keys += ch === "￥" ? "\\" : ch;
        }
      }
    }
    for (const row of shiftRows) {
      for (let i = 0; i < row.length; i++) {
        const fingerIdx = TypeData.FINGER[i];
        if (fingerIdx !== undefined && this.fingers[fingerIdx]) {
          this.fingers[fingerIdx].shiftKeys += row.charAt(i);
        }
      }
    }

    // スペースキーは右親指で案内 (画像5準拠)
    this.fingers[5].keys = " ";
  }

  updateHighlights(nextKeys: string[]): void {
    if (this.board !== TypeConfig.board) {
      this.buildFingers();
    }
    for (const f of this.fingers) f.state = "up";
    if (!nextKeys || nextKeys.length === 0) return;

    for (let i = 0; i < nextKeys.length; i++) {
      const str = nextKeys[i];
      for (const f of this.fingers) {
        if (f.keys.includes(str)) {
          if (i === 0) f.state = "down";
          else if (f.state === "up") f.state = "over";
        } else if (f.shiftKeys.includes(str)) {
          if (i === 0) {
            f.state = "down";
            this.fingers[0].state = "down";
            this.fingers[9].state = "down";
          } else if (f.state === "up") {
            f.state = "over";
          }
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, handsImg: HTMLImageElement): void {
    ctx.drawImage(handsImg, 70, 411);

    for (const finger of this.fingers) {
      if (finger.state === "down") {
        ctx.save();
        ctx.fillStyle = "#FF22EE";
        ctx.strokeStyle = "#CC00BB";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(finger.tipX, finger.tipY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 小さな光沢ハイライト
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(finger.tipX - 3, finger.tipY - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (finger.state === "over") {
        ctx.save();
        ctx.strokeStyle = "#FF44EE";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(finger.tipX, finger.tipY, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}
