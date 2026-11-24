import type { Scene } from "./Scene";
import type { GameController } from "../GameController";
import type { GameImages } from "../../assets/AssetLoader";

interface SparkleParticle {
  x: number;
  y: number;
  color: string;
  phase: number;
  speedY: number;
  isConfetti: boolean;
}

const SPARKLE_COLORS = ["#FFFF55", "#FF66EE", "#55FFFF", "#FFFFFF", "#FF9933", "#66FF66"];

export class EndingScene implements Scene {
  private controller: GameController;
  private images: GameImages;
  private tickCount = 0;
  private particles: SparkleParticle[] = [];

  constructor(controller: GameController, images: GameImages) {
    this.controller = controller;
    this.images = images;
    this.initParticles();
  }

  private initParticles(): void {
    this.particles = [];
    for (let i = 0; i < 28; i++) {
      this.particles.push({
        x: (i * 73 + 29) % 630 + 10,
        y: (i * 41 + 17) % 440 + 10,
        color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
        phase: i * 3,
        speedY: i % 3 === 0 ? 1.5 : i % 2 === 0 ? 1 : 0,
        isConfetti: i % 2 === 0,
      });
    }
  }

  enter(): void {
    this.tickCount = 0;
    this.initParticles();
  }

  exit(): void {}

  tick(): void {
    this.tickCount++;
    for (const p of this.particles) {
      if (p.speedY > 0) {
        p.y += p.speedY;
        if (p.y > 490) {
          p.y = 10;
        }
      }
    }
  }

  update(_dt: number): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    // 1. お宝を見つけて大喜びする魔女の全画面ドット絵
    ctx.drawImage(this.images.endingScene, 0, 0);

    // 2. キラキラ星＆紙吹雪アニメーション
    for (const p of this.particles) {
      const blink = (this.tickCount + p.phase) % 14;
      if (p.isConfetti) {
        ctx.fillStyle = p.color;
        const w = blink < 7 ? 5 : 3;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), w, 4);
      } else if (blink < 9) {
        ctx.fillStyle = p.color;
        const px = Math.round(p.x);
        const py = Math.round(p.y);
        ctx.fillRect(px - 3, py, 7, 2);
        ctx.fillRect(px, py - 3, 2, 7);
      }
    }

    // 3. 上部祝福ロゴ (空エリア y=12..70 に配置し、魔女と宝箱を隠さない)
    ctx.save();
    ctx.font = 'italic bold 28px "Times New Roman", "Georgia", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const titleText = "CONGRATULATIONS!  GAME CLEAR!!";
    for (let d = 4; d >= 1; d--) {
      ctx.fillStyle = "#5A0870";
      ctx.fillText(titleText, 325 + d, 22 + d, 620);
    }
    ctx.fillStyle = "#FFEE33";
    ctx.fillText(titleText, 325, 22, 620);
    ctx.restore();

    // 4. 祝福メッセージ枠 (y=72..132)
    ctx.save();
    ctx.fillStyle = "rgba(18, 12, 60, 0.86)";
    ctx.strokeStyle = "#FFEE33";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(65, 70, 520, 62, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = 'bold 18px "MS PGothic", "メイリオ", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ついに伝説のお宝を発見した！", 325, 90);
    ctx.fillStyle = "#FFCC44";
    ctx.fillText("空飛ぶ魔法の旅、完全制覇おめでとう！！", 325, 115);
    ctx.restore();

    // 5. 下部操作案内
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 466, 650, 34);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = 'bold 14px "MS PGothic", "メイリオ", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("[Enter] ステージ選択へ     [ESC] タイトルメニューへ", 325, 483);
    ctx.restore();
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === "Enter" || e.key === " " || e.code === "Space") {
      e.preventDefault();
      this.controller.switchScene("stageSelect");
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.controller.switchScene("title");
    }
  }

  onKeyUp(_e: KeyboardEvent): void {}

  onClick(_x: number, _y: number): void {
    this.controller.switchScene("stageSelect");
  }
}
