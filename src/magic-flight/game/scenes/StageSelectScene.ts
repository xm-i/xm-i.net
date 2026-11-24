import type { Scene } from "./Scene";
import type { GameController } from "../GameController";
import type { GameImages } from "../../assets/AssetLoader";

interface IslandDef {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  targetX: number;
  targetY: number;
  flagX: number;
  flagY: number;
}

// 1994年原作 stage_select_bg.png (650x500) 上の8つの島座標
const ISLANDS: IslandDef[] = [
  { index: 0, x: 15, y: 270, w: 125, h: 105, targetX: 67, targetY: 305, flagX: 30, flagY: 280 },
  { index: 1, x: 142, y: 255, w: 72, h: 72, targetX: 158, targetY: 256, flagX: 162, flagY: 268 },
  { index: 2, x: 190, y: 195, w: 92, h: 65, targetX: 220, targetY: 196, flagX: 225, flagY: 210 },
  { index: 3, x: 285, y: 235, w: 160, h: 78, targetX: 355, targetY: 240, flagX: 365, flagY: 252 },
  { index: 4, x: 285, y: 318, w: 80, h: 70, targetX: 315, targetY: 325, flagX: 318, flagY: 335 },
  { index: 5, x: 245, y: 398, w: 145, h: 82, targetX: 305, targetY: 405, flagX: 310, flagY: 416 },
  { index: 6, x: 445, y: 332, w: 118, h: 82, targetX: 485, targetY: 338, flagX: 492, flagY: 348 },
  { index: 7, x: 568, y: 332, w: 82, h: 105, targetX: 595, targetY: 345, flagX: 602, flagY: 352 },
];

export class StageSelectScene implements Scene {
  private controller: GameController;
  private images: GameImages;
  private witchX = 67;
  private witchY = 305;
  private isFlying = false;
  private showGoal = false;

  constructor(controller: GameController, images: GameImages) {
    this.controller = controller;
    this.images = images;
  }

  enter(): void {
    this.showGoal = false;
    this.isFlying = false;

    // まず前回いた島に魔女を配置
    const currentIsland = ISLANDS[this.controller.selectedIsland] ?? ISLANDS[0];
    this.witchX = currentIsland.targetX;
    this.witchY = currentIsland.targetY;

    // クリアして戻ってきた場合は次の島へ飛行させる
    if (this.controller.justCleared) {
      if (this.controller.selectedIsland !== 7) {
        this.controller.selectedIsland++;
        this.isFlying = true;
      }
      this.controller.justCleared = false;
    } else if (this.controller.selectedIsland === 7) {
      this.showGoal = true;
    }
  }

  exit(): void {}

  tick(): void {
    const target = ISLANDS[this.controller.selectedIsland];
    if (target) {
      const dx = target.targetX - this.witchX;
      const dy = target.targetY - this.witchY;
      const p = Math.trunc(Math.sqrt(dx * dx + dy * dy));

      if (p > 5) {
        const moveX = p > 0 ? Math.round((dx / p) * 5) : 0;
        const moveY = p > 0 ? Math.round((dy / p) * 5) : 0;
        this.witchX += moveX;
        this.witchY += moveY;
        this.isFlying = true;
        this.showGoal = false;
      } else {
        this.witchX = target.targetX;
        this.witchY = target.targetY;
        this.isFlying = false;
        if (this.controller.selectedIsland === 7) {
          this.showGoal = true;
        }
      }
    }

    if (this.controller.consumeSpace()) {
      if (this.controller.selectedIsland === 7) {
        this.controller.switchScene("ending");
      } else {
        this.controller.switchScene("typing");
      }
      return;
    }

    if (this.controller.consumeEsc()) {
      this.controller.switchScene("title");
      return;
    }
  }

  update(_dt: number): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    const clearFlags = this.controller.clearFlags;
    const selected = this.controller.selectedIsland;

    // 1. 原作の島マップ背景
    ctx.drawImage(this.images.stageSelectBg, 0, 0);

    // 2. クリア済み島の旗
    for (let i = 1; i <= 7; i++) {
      if (clearFlags[i]) {
        ctx.drawImage(this.images.flag, ISLANDS[i].flagX, ISLANDS[i].flagY);
      }
    }

    // 3. 初期島(0)のとき上部オレンジバナーを表示 (画像3)
    if (selected === 0) {
      ctx.drawImage(this.images.stageBanner, 51, 15);
    }

    // 4. ゴール到達時のお祝いメッセージ
    if (this.showGoal) {
      ctx.save();
      ctx.fillStyle = "#FF8800";
      ctx.strokeStyle = "#884400";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(145, 28, 360, 56, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 24px 'MS PGothic', 'メイリオ', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ゴール！ おめでとう！", 325, 56);
      ctx.restore();
    }

    // 5. 右上の開始プロンプト (画像3・画像4)
    ctx.fillStyle = "#000000";
    ctx.font = "17px 'MS PGothic', 'メイリオ', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    if (selected === 7) {
      ctx.fillText("[Enter] エンディングを見る", 367, 168);
    } else {
      ctx.fillText("[Enter] を押してください", 367, 168);
    }

    // 6. 左下の操作案内 (画像3・画像4: 有効なら青、無効ならグレー)
    const canMoveNext = this.hasNextSelectableIsland();
    const canMovePrev = selected > 0;

    ctx.font = "16px 'MS PGothic', 'メイリオ', sans-serif";
    ctx.fillStyle = canMoveNext ? "#0022AA" : "#668899";
    ctx.fillText("[TAB]  次の島へ移動", 14, 413);

    ctx.fillStyle = canMovePrev ? "#0022AA" : "#668899";
    ctx.fillText("[BS]   前の島へ移動", 14, 437);

    ctx.fillStyle = "#0022AA";
    ctx.fillText("[ESC]  メニューへ戻る", 14, 461);

    // 7. 魔女 (飛行中はほうき飛行、島待機中は立ち姿)
    if (this.isFlying) {
      ctx.drawImage(this.images.witchFly, this.witchX, this.witchY);
    } else {
      ctx.drawImage(this.images.stageWitch, this.witchX, this.witchY);
    }
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault();
      if (this.controller.selectedIsland === 7) {
        this.controller.switchScene("ending");
      } else {
        this.controller.switchScene("typing");
      }
    } else if (e.key === "Tab" || e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      this.moveNextIsland();
    } else if (e.key === "Backspace" || e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      this.movePrevIsland();
    }
  }

  onKeyUp(_e: KeyboardEvent): void {}

  onClick(x: number, y: number): void {
    for (const island of ISLANDS) {
      if (x >= island.x && x <= island.x + island.w && y >= island.y && y <= island.y + island.h) {
        if (island.index === 0 || this.controller.clearFlags[island.index]) {
          this.selectIsland(island.index);
        }
        return;
      }
    }
  }

  private hasNextSelectableIsland(): boolean {
    const next = this.controller.selectedIsland + 1;
    return next <= 7 && Boolean(this.controller.clearFlags[next]);
  }

  private moveNextIsland(): void {
    if (this.hasNextSelectableIsland()) {
      this.selectIsland(this.controller.selectedIsland + 1);
    }
  }

  private movePrevIsland(): void {
    if (this.controller.selectedIsland > 0) {
      this.selectIsland(this.controller.selectedIsland - 1);
    }
  }

  private selectIsland(index: number): void {
    if (this.controller.selectedIsland === index) return;
    this.controller.selectedIsland = index;
    this.showGoal = false;
    this.isFlying = true;
  }
}
