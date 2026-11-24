import type { Scene } from "./Scene";
import type { GameController } from "../GameController";
import type { GameImages } from "../../assets/AssetLoader";
import { TypingEngine, TypeManager, TypingEvents } from "../../engine/index";
import { KeyboardRenderer, HandsRenderer, PanelRenderer } from "../../ui/index";
import { getWordsForStage } from "../../data/words";
import { Difficulty } from "./TitleScene";

const TypingState = {
  BeforeStart: 0,
  Playing: 1,
  GameOver: 2,
  Clear: 3,
} as const;

type TypingState = (typeof TypingState)[keyof typeof TypingState];

export class TypingScene implements Scene {
  private controller: GameController;
  private images: GameImages;
  private typing!: TypingEngine;
  private manager!: TypeManager;
  private keyboard = new KeyboardRenderer();
  private hands = new HandsRenderer();
  private panel = new PanelRenderer();

  private witchX = 10;
  private witchY = 65;
  private state: TypingState = TypingState.BeforeStart;
  private tc = 0;
  private tm = 0;
  private ticktack = 0;
  private panelAlpha = 0.23;
  private isDead = false;

  constructor(controller: GameController, images: GameImages) {
    this.controller = controller;
    this.images = images;
  }

  enter(): void {
    this.witchX = 10;
    this.witchY = 65;
    this.state = TypingState.BeforeStart;
    this.tc = 0;
    this.tm = 0;
    this.ticktack = 0;
    this.panelAlpha = 0.23;
    this.isDead = false;

    this.typing = new TypingEngine();
    const stageIndex = this.controller.selectedIsland + 1;
    const words = getWordsForStage(stageIndex);
    this.manager = new TypeManager(this.typing, words);
    this.manager.random = stageIndex !== 1;

    this.typing.on(TypingEvents.TYPED, () => this.updateVisualsFromTyping());
    this.typing.on(TypingEvents.WORD_ADDED, () => this.updateVisualsFromTyping());
    this.typing.on(TypingEvents.WORD_REMOVED, () => this.updateVisualsFromTyping());
    this.typing.on(TypingEvents.START, () => this.updateVisualsFromTyping());
    this.typing.on(TypingEvents.INIT, () => this.updateVisualsFromTyping());

    // 画像5: 開始前はスペースキーと右親指をハイライト
    this.keyboard.updateHighlights([" "]);
    this.hands.updateHighlights([" "]);
  }

  exit(): void {
    if (this.typing.running) {
      this.typing.stop();
    }
    this.manager.destroy();
    this.tc = 0;
    this.tm = 0;
  }

  private updateVisualsFromTyping(): void {
    if (this.state === TypingState.BeforeStart) {
      this.keyboard.updateHighlights([" "]);
      this.hands.updateHighlights([" "]);
      return;
    }
    this.keyboard.updateHighlights(this.typing.next);
    this.hands.updateHighlights(this.typing.next);
  }

  tick(): void {
    this.ticktack++;
    const fall = this.getFallInterval();
    const stageIndex = this.controller.selectedIsland + 1;

    // スペースキーを押すとゲーム開始
    if (this.controller.consumeSpace() && this.state === TypingState.BeforeStart) {
      this.panelAlpha = 1;
      this.state = TypingState.Playing;
      this.typing.start();
      this.updateVisualsFromTyping();
    }

    // ESCでゲーム終了 -> ステージ選択画面へ戻る
    if (this.controller.consumeEsc()) {
      this.state = TypingState.BeforeStart;
      this.controller.switchScene("stageSelect");
      return;
    }

    // 魔女を飛ばす処理
    if (this.state === TypingState.Playing) {
      const correctDelta = this.typing.correct - this.tc;
      if (this.witchX > 40) {
        if (this.ticktack % fall === 0) {
          this.witchY++;
        }
        this.witchY += this.typing.miss - this.tm;
        this.tm = this.typing.miss;
      }

      this.witchY -= correctDelta;
      this.witchX += correctDelta * 2.5;
      this.tc = this.typing.correct;

      if (this.witchY < 0) {
        this.witchY = 0;
      }

      if (this.witchX > 550) {
        // 右の崖到達でクリア
        this.witchX = 600;
        this.witchY = 65;
        this.typing.stop();
        this.state = TypingState.Clear;
        this.controller.setClearFlag(stageIndex);
        this.controller.justCleared = stageIndex !== 7;
        this.panelAlpha = 0.23;
        this.keyboard.updateHighlights([]);
        this.hands.updateHighlights([]);
      }

      // 水面落下 (65 + 45 = 110) でゲームオーバー
      if (this.witchY >= 110) {
        this.witchY = 117;
        this.state = TypingState.GameOver;
        this.isDead = true;
        this.typing.stop();
        this.panelAlpha = 0.23;
        this.keyboard.updateHighlights([]);
        this.hands.updateHighlights([]);
      }
    }
  }

  update(_dt: number): void {
    this.typing.update();
    this.manager.update();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // ===== 1. 上部空エリア (y=0..153) =====
    ctx.fillStyle = "#74F2FF";
    ctx.fillRect(0, 0, 650, 153);

    // 左右の崖 (緑の丸い丘 + 赤白チェック/レンガ土台)
    this.drawCliff(ctx, 0, 64, "left");
    this.drawCliff(ctx, 586, 64, "right");

    // ===== 2. 魔女 / 水しぶき (画像5 & 画像6) =====
    if (this.isDead) {
      ctx.drawImage(this.images.witchSplash, this.witchX, 117);
    } else {
      ctx.drawImage(this.images.witchFly, this.witchX, this.witchY);
    }

    // ===== 3. 中央キーボード背景 (濃い青 #010DFF, y=153..375) =====
    ctx.fillStyle = "#010DFF";
    ctx.fillRect(0, 153, 650, 222);

    // 上下の黒境界線
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 152, 650, 2);
    ctx.fillRect(0, 374, 650, 2);

    // 立体PC-98キーボード描画
    this.keyboard.draw(ctx, 37, 170);

    // ===== 4. 下部海＆両手ガイドエリア (y=376..500) =====
    ctx.fillStyle = "#74F2FF";
    ctx.fillRect(0, 376, 650, 124);

    // 両手ガイド＆ピンク丸
    this.hands.draw(ctx, this.images.handsBg);

    // 左上: [ESC] で中止 (画像5・画像6)
    ctx.fillStyle = "#FF2200";
    ctx.font = "bold 13px 'MS PGothic', 'メイリオ', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("[ESC] で中止", 10, 383);

    // 右上: 経過ステータス (hands_bg の上側の空いたスペースに配置)
    const speed =
      this.typing.time > 0 ? Math.trunc((this.typing.correct / this.typing.time) * 10000) / 10 : 0;
    ctx.fillStyle = "#002266";
    ctx.font = "bold 12px 'Consolas', 'MS Gothic', monospace";
    ctx.textAlign = "right";
    ctx.fillText(
      `速度:${speed}key/s  打鍵:${this.typing.correct}回  ミス:${this.typing.miss}回  時間:${Math.trunc(this.typing.time / 1000)}秒`,
      640,
      383,
    );

    // ===== 5. 上部メッセージ / ワードパネル =====
    if (this.state === TypingState.Playing) {
      this.panel.draw(ctx, this.typing, 0, 0, 650, 100, this.panelAlpha);
    } else if (this.state === TypingState.BeforeStart) {
      // 画像5: [スペース] で スタート！！
      ctx.fillStyle = "#FF3300";
      ctx.font = "bold 26px 'MS PMincho', '游明朝', 'Yu Mincho', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("[スペース] で スタート！！", 325, 58);
    } else if (this.state === TypingState.GameOver) {
      // 画像6: 修行が足りぬぞ。もう一度練習だ。 / [Enter] を押してください
      ctx.fillStyle = "#FF3300";
      ctx.font = "bold 25px 'MS PMincho', '游明朝', 'Yu Mincho', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("修行が足りぬぞ。もう一度練習だ。", 325, 50);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 14px 'MS PGothic', 'メイリオ', sans-serif";
      ctx.fillText("[Enter] を押してください", 325, 85);
    } else if (this.state === TypingState.Clear) {
      const stageIndex = this.controller.selectedIsland + 1;
      const clearMsg =
        stageIndex === 7 ? "見事じゃ！すべての島を制覇したぞ！" : "見事じゃ！次の島へ進むがよい。";
      ctx.fillStyle = "#FF3300";
      ctx.font = "bold 24px 'MS PMincho', '游明朝', 'Yu Mincho', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(clearMsg, 325, 50);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 14px 'MS PGothic', 'メイリオ', sans-serif";
      ctx.fillText("[Enter] を押してください", 325, 85);
    }
  }

  /** 画像5・画像6の緑の草地＋赤白網目崖を描画 */
  private drawCliff(
    ctx: CanvasRenderingContext2D,
    x: number,
    w: number,
    side: "left" | "right",
  ): void {
    ctx.save();
    const baseTop = 133;
    const baseBottom = 153;

    // 緑のドーム状の草地
    ctx.fillStyle = "#009900";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (side === "left") {
      ctx.moveTo(x, baseTop);
      ctx.lineTo(x, 106);
      ctx.quadraticCurveTo(x + w * 0.55, 100, x + w, baseTop);
    } else {
      ctx.moveTo(x, baseTop);
      ctx.quadraticCurveTo(x + w * 0.45, 100, x + w, 106);
      ctx.lineTo(x + w, baseTop);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 下部のピンク・赤の網目ブロック
    ctx.beginPath();
    ctx.rect(x, baseTop, w, baseBottom - baseTop);
    ctx.fillStyle = "#FF9999";
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "#CC1111";
    ctx.lineWidth = 1;
    const step = 8;
    for (let sx = x - 24; sx < x + w + 24; sx += step) {
      ctx.beginPath();
      ctx.moveTo(sx, baseTop);
      ctx.lineTo(sx + 20, baseBottom);
      ctx.moveTo(sx + 20, baseTop);
      ctx.lineTo(sx, baseBottom);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, baseTop, w, baseBottom - baseTop);
    ctx.restore();
  }

  onKeyDown(e: KeyboardEvent): void {
    if (this.state === TypingState.GameOver || this.state === TypingState.Clear) {
      if (e.key === "Enter" || e.key === " " || e.code === "Space" || e.key === "Escape") {
        e.preventDefault();
        this.exitAfterFinish();
      }
      return;
    }

    this.typing.handleKeyboardEvent(e);
  }

  onKeyUp(_e: KeyboardEvent): void {}

  onClick(_x: number, _y: number): void {
    if (this.state === TypingState.GameOver || this.state === TypingState.Clear) {
      this.exitAfterFinish();
    }
  }

  private exitAfterFinish(): void {
    const wasClear = this.state === TypingState.Clear;
    const stageIndex = this.controller.selectedIsland + 1;
    this.state = TypingState.BeforeStart;
    if (wasClear && stageIndex === 7) {
      this.controller.selectedIsland = 7;
      this.controller.justCleared = false;
      this.controller.switchScene("ending");
    } else {
      this.controller.switchScene("stageSelect");
    }
  }

  private getFallInterval(): number {
    switch (this.controller.difficulty) {
      case Difficulty.VeryEasy:
        return 22;
      case Difficulty.Easy:
        return 14;
      case Difficulty.Normal:
        return 9;
      case Difficulty.Hard:
        return 6;
      case Difficulty.VeryHard:
        return 4;
      default:
        return 9;
    }
  }
}
