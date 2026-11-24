export interface Scene {
  enter(): void;
  exit(): void;
  tick(): void;
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
  onKeyDown(e: KeyboardEvent): void;
  onKeyUp(e: KeyboardEvent): void;
  onClick(x: number, y: number): void;
}
