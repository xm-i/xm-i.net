import type { Scene } from "./scenes/Scene";
import { TitleScene, Difficulty } from "./scenes/TitleScene";
import { StageSelectScene } from "./scenes/StageSelectScene";
import { TypingScene } from "./scenes/TypingScene";
import { EndingScene } from "./scenes/EndingScene";
import type { GameImages } from "../assets/AssetLoader";
import { TypeSound } from "../engine/TypeSound";

type SceneName = "title" | "stageSelect" | "typing" | "ending";

const TICK_INTERVAL_MS = 40;

export class GameController {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scenes: Record<SceneName, Scene>;
  private currentScene: Scene;
  private animationId = 0;
  private lastTime = 0;
  private tickAccumulator = 0;
  private started = false;

  private keystateSpace = false;
  private keystateEsc = false;

  difficulty: Difficulty = Difficulty.Normal;
  selectedIsland = 0;
  clearFlags: boolean[] = new Array(8).fill(false);
  justCleared = false;

  constructor(canvas: HTMLCanvasElement, images: GameImages) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    this.scenes = {
      title: new TitleScene(this, images),
      stageSelect: new StageSelectScene(this, images),
      typing: new TypingScene(this, images),
      ending: new EndingScene(this, images),
    };

    this.currentScene = this.scenes.title;
    this.bindEvents();
  }

  start(): void {
    this.started = true;
    this.currentScene.enter();
    this.lastTime = performance.now();
    this.tickAccumulator = 0;
    this.loop();
  }

  switchScene(name: SceneName): void {
    this.currentScene.exit();
    this.keystateSpace = false;
    this.keystateEsc = false;
    this.currentScene = this.scenes[name];
    this.currentScene.enter();
  }

  setDifficulty(d: Difficulty): void {
    this.difficulty = d;
  }

  setClearFlag(stageNumber: number): void {
    if (stageNumber >= 1 && stageNumber <= 7) {
      this.clearFlags[stageNumber] = true;
    }
  }

  consumeSpace(): boolean {
    if (this.keystateSpace) {
      this.keystateSpace = false;
      return true;
    }
    return false;
  }

  consumeEsc(): boolean {
    if (this.keystateEsc) {
      this.keystateEsc = false;
      return true;
    }
    return false;
  }

  private bindEvents(): void {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    this.canvas.addEventListener("click", this.handleClick);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    TypeSound.unlock();

    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      if ((e.keyCode === 32 || e.code === "Space") && e.keyCode !== 229 && !e.isComposing) {
        e.preventDefault();
        if (!e.repeat) {
          this.keystateSpace = true;
        }
      } else if (e.keyCode === 27 || e.key === "Escape") {
        e.preventDefault();
        if (!e.repeat) {
          this.keystateEsc = true;
        }
      }
    }

    this.currentScene.onKeyDown(e);
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.currentScene.onKeyUp(e);
  };

  private handleClick = (e: MouseEvent): void => {
    TypeSound.unlock();
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    this.currentScene.onClick(x, y);
  };

  private loop = (): void => {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    this.currentScene.update(dt);

    // Main.as の Timer(40) に合わせた固定40msティック処理
    this.tickAccumulator += Math.min(dt, 200);
    while (this.tickAccumulator >= TICK_INTERVAL_MS) {
      this.tickAccumulator -= TICK_INTERVAL_MS;
      this.currentScene.tick();
      // 未消費のキー状態が次の場面へ持ち越されないようティック末にクリア
      this.keystateSpace = false;
      this.keystateEsc = false;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.currentScene.draw(this.ctx);

    this.animationId = requestAnimationFrame(this.loop);
  };

  destroy(): void {
    cancelAnimationFrame(this.animationId);
    if (this.started) {
      this.currentScene.exit();
      this.started = false;
    }
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("click", this.handleClick);
  }
}
