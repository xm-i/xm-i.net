import type { Scene } from "./Scene";
import type { GameController } from "../GameController";
import type { GameImages } from "../../assets/AssetLoader";

export const Difficulty = {
  VeryEasy: 1,
  Easy: 2,
  Normal: 3,
  Hard: 4,
  VeryHard: 5,
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

type TitlePhase = "intro" | "title" | "difficulty";

interface DifficultyOption {
  label: string;
  desc: string;
  difficulty: Difficulty;
  color: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { label: "VERY HARD", desc: "超上級", difficulty: Difficulty.VeryHard, color: "#FF5555" },
  { label: "HARD", desc: "上級", difficulty: Difficulty.Hard, color: "#FF9944" },
  { label: "NORMAL", desc: "標準", difficulty: Difficulty.Normal, color: "#FFFF55" },
  { label: "EASY", desc: "初級", difficulty: Difficulty.Easy, color: "#88FF66" },
  { label: "VERY EASY", desc: "練習向け", difficulty: Difficulty.VeryEasy, color: "#66DDFF" },
];

const DIFF_PANEL = { x: 185, y: 244, w: 280, h: 228 };
const BTN_START_Y = 282;
const BTN_STEP_Y = 36;
const BTN_X = 205;
const BTN_W = 240;
const BTN_H = 30;

export class TitleScene implements Scene {
  private controller: GameController;
  private images: GameImages;
  private phase: TitlePhase = "intro";
  private hasPlayedIntro = false;
  private witchX = 650;
  private witchY = 335;
  private tickCount = 0;
  private selectedIndex = 2; // NORMAL

  constructor(controller: GameController, images: GameImages) {
    this.controller = controller;
    this.images = images;
  }

  enter(): void {
    this.selectedIndex = Math.max(
      0,
      DIFFICULTY_OPTIONS.findIndex((o) => o.difficulty === this.controller.difficulty),
    );
    if (!this.hasPlayedIntro) {
      this.phase = "intro";
      this.witchX = 650;
      this.witchY = 335;
      this.tickCount = 0;
    } else {
      this.phase = "title";
    }
  }

  exit(): void {}

  tick(): void {
    if (this.phase !== "intro") return;

    this.tickCount++;
    this.witchX -= 9;
    const t = Math.max(0, Math.min(1, this.witchX / 650));
    this.witchY = 279 + t * 56 + Math.sin(this.tickCount * 0.25) * 3;

    if (this.witchX <= 0) {
      this.witchX = 0;
      this.witchY = 279;
      this.phase = "title";
      this.hasPlayedIntro = true;
    }
  }

  update(_dt: number): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.phase === "intro") {
      // 画像1: 黒背景に右上の三日月、右下から左へ飛ぶ魔女
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 650, 500);
      ctx.drawImage(this.images.titleMoon, 562, 26);
      ctx.drawImage(this.images.titleWitch, this.witchX, this.witchY);
      return;
    }

    // 画像2: 魔女が左到達後のタイトル画面
    ctx.drawImage(this.images.titleArrived, 0, 0);

    if (this.phase === "difficulty") {
      this.drawDifficultyPanel(ctx);
    }
  }

  private drawDifficultyPanel(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    // 下部の案内文字と重ならないよう背景を少し落としてウィンドウを描画
    ctx.fillStyle = "rgba(0, 0, 32, 0.92)";
    ctx.fillRect(DIFF_PANEL.x, DIFF_PANEL.y, DIFF_PANEL.w, DIFF_PANEL.h);

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(DIFF_PANEL.x, DIFF_PANEL.y, DIFF_PANEL.w, DIFF_PANEL.h);
    ctx.strokeStyle = "#CC44CC";
    ctx.lineWidth = 1;
    ctx.strokeRect(DIFF_PANEL.x + 3, DIFF_PANEL.y + 3, DIFF_PANEL.w - 6, DIFF_PANEL.h - 6);

    ctx.fillStyle = "#FF88FF";
    ctx.font = "bold 16px 'MS PGothic', 'メイリオ', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("難易度を選択してください", DIFF_PANEL.x + DIFF_PANEL.w / 2, DIFF_PANEL.y + 21);

    for (let i = 0; i < DIFFICULTY_OPTIONS.length; i++) {
      const opt = DIFFICULTY_OPTIONS[i];
      const by = BTN_START_Y + i * BTN_STEP_Y;
      const isSelected = i === this.selectedIndex;

      ctx.fillStyle = isSelected ? "#332266" : "#111128";
      ctx.fillRect(BTN_X, by, BTN_W, BTN_H);

      ctx.strokeStyle = isSelected ? "#FFFF00" : "#666699";
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(BTN_X, by, BTN_W, BTN_H);

      ctx.fillStyle = opt.color;
      ctx.font = "bold 15px 'MS PGothic', 'メイリオ', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(isSelected ? `▶ ${opt.label}` : `  ${opt.label}`, BTN_X + 14, by + BTN_H / 2);

      ctx.fillStyle = "#CCCCCC";
      ctx.font = "12px 'MS PGothic', 'メイリオ', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(opt.desc, BTN_X + BTN_W - 14, by + BTN_H / 2);
    }

    ctx.fillStyle = "#AAAAAA";
    ctx.font = "11px 'MS PGothic', 'メイリオ', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("[↑↓] 選択 / [Enter] 決定 / [ESC] 戻る", DIFF_PANEL.x + DIFF_PANEL.w / 2, DIFF_PANEL.y + DIFF_PANEL.h - 11);
    ctx.restore();
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey || e.altKey || /^F\d+$/.test(e.key)) {
      return;
    }
    if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") {
      return;
    }

    if (this.phase === "intro") {
      e.preventDefault();
      this.witchX = 0;
      this.witchY = 279;
      this.phase = "title";
      this.hasPlayedIntro = true;
      return;
    }

    if (this.phase === "title") {
      e.preventDefault();
      this.phase = "difficulty";
      return;
    }

    if (this.phase === "difficulty") {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + DIFFICULTY_OPTIONS.length) % DIFFICULTY_OPTIONS.length;
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % DIFFICULTY_OPTIONS.length;
      } else if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        e.preventDefault();
        this.selectDifficulty(DIFFICULTY_OPTIONS[this.selectedIndex].difficulty);
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.phase = "title";
      }
    }
  }

  onKeyUp(_e: KeyboardEvent): void {}

  onClick(x: number, y: number): void {
    if (this.phase === "intro") {
      this.witchX = 0;
      this.witchY = 279;
      this.phase = "title";
      this.hasPlayedIntro = true;
      return;
    }

    if (this.phase === "title") {
      this.phase = "difficulty";
      return;
    }

    if (this.phase === "difficulty") {
      for (let i = 0; i < DIFFICULTY_OPTIONS.length; i++) {
        const by = BTN_START_Y + i * BTN_STEP_Y;
        if (x >= BTN_X && x <= BTN_X + BTN_W && y >= by && y <= by + BTN_H) {
          this.selectedIndex = i;
          this.selectDifficulty(DIFFICULTY_OPTIONS[i].difficulty);
          return;
        }
      }
    }
  }

  private selectDifficulty(difficulty: Difficulty): void {
    this.controller.setDifficulty(difficulty);
    this.controller.switchScene("stageSelect");
  }
}
