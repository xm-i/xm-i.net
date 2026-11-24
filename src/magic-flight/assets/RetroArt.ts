export interface GeneratedRetroArt {
  titleWitch: HTMLImageElement;
  titleMoon: HTMLImageElement;
  titleArrived: HTMLImageElement;
  stageSelectBg: HTMLImageElement;
  stageBanner: HTMLImageElement;
  stageWitch: HTMLImageElement;
  witchFly: HTMLImageElement;
  witchSplash: HTMLImageElement;
  handsBg: HTMLImageElement;
  endingScene: HTMLImageElement;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

function canvasToImage(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to convert generated retro art to Image"));
    img.src = canvas.toDataURL("image/png");
  });
}

/** 2x2ドット単位で拡大描画して90年代の粗めなピクセル絵を生成 */
function upscalePixelCanvas(
  halfCanvas: HTMLCanvasElement,
  targetW: number,
  targetH: number,
): HTMLCanvasElement {
  const [out, ctx] = makeCanvas(targetW, targetH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(halfCanvas, 0, 0, targetW, targetH);
  return out;
}

function drawGridSprite(
  grid: string[],
  palette: Record<string, string>,
  targetW: number,
  targetH: number,
): HTMLCanvasElement {
  const gh = grid.length;
  const gw = grid[0]?.length ?? 1;
  const [small, sctx] = makeCanvas(gw, gh);
  for (let y = 0; y < gh; y++) {
    const row = grid[y];
    for (let x = 0; x < gw; x++) {
      const ch = row[x];
      const color = palette[ch];
      if (color) {
        sctx.fillStyle = color;
        sctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return upscalePixelCanvas(small, targetW, targetH);
}

/** 半解像度キャンバス上に黒縁取り付きピクセル楕円/地形を描画するヘルパー */
function pxDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  ctx.fillStyle = color;
  const rx = Math.round(x);
  const ry = Math.round(y);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy <= r * r + 1) {
        ctx.fillRect(rx + dx, ry + dy, 1, 1);
      }
    }
  }
}

function drawPixelEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
): void {
  ctx.fillStyle = color;
  const x0 = Math.floor(cx - rx);
  const x1 = Math.ceil(cx + rx);
  const y0 = Math.floor(cy - ry);
  const y1 = Math.ceil(cy + ry);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      if (nx * nx + ny * ny <= 1) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

/** 1. メニュー画面：三日月 (69x74) */
function renderTitleMoonCanvas(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(35, 37);
  // 外側の黒・濃黄輪郭と三日月本体
  const cx = 14;
  const cy = 18;
  for (let y = 0; y < 37; y++) {
    for (let x = 0; x < 35; x++) {
      const dOuter = Math.hypot(x - cx, (y - cy) * 0.92);
      const dInner = Math.hypot(x - (cx - 7), (y - (cy - 3)) * 0.96);
      if (dOuter <= 15.2 && dInner >= 11.8) {
        // 右下の細い欠けや輪郭に陰影をつけてオリジナリティを出す
        if (dOuter > 14.0 || dInner < 12.6) {
          ctx.fillStyle = "#AA8800";
        } else if (dOuter > 12.2 && x > 22) {
          ctx.fillStyle = "#FFFF88";
        } else {
          ctx.fillStyle = "#FFEE11";
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  // 小さな星を2つ添える
  ctx.fillStyle = "#FFFFAA";
  ctx.fillRect(4, 9, 1, 1);
  ctx.fillRect(3, 10, 3, 1);
  ctx.fillRect(4, 11, 1, 1);
  ctx.fillRect(10, 26, 1, 1);
  return upscalePixelCanvas(c, 69, 74);
}

/** 2. メニュー画面：大型飛行魔女 (158x166) */
function renderTitleWitchCanvas(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(79, 83);

  // 小さな星くず（ほうきの後ろ）
  ctx.fillStyle = "#FFEE55";
  ctx.fillRect(72, 68, 1, 1);
  ctx.fillRect(74, 58, 1, 1);
  ctx.fillRect(69, 77, 1, 1);

  // とんがり帽子 (斜め右後ろへ反るオリジナルシルエット + 黄色いバックル帯)
  const hatPts: [number, number][] = [
    [43, 5], [47, 5], [45, 9], [41, 12], [38, 15], [33, 18],
    [29, 20], [45, 20], [50, 22], [55, 24], [19, 24],
  ];
  ctx.fillStyle = "#081C7A";
  ctx.beginPath();
  ctx.moveTo(46, 5);
  ctx.lineTo(41, 13);
  ctx.lineTo(31, 20);
  ctx.lineTo(18, 23);
  ctx.lineTo(54, 25);
  ctx.lineTo(46, 15);
  ctx.closePath();
  ctx.fill();

  // 帽子のアウトライン & ハイライト
  ctx.fillStyle = "#1D44D8";
  ctx.fillRect(36, 14, 5, 5);
  ctx.fillRect(24, 22, 24, 2);
  ctx.fillStyle = "#FFEE22"; // 黄色いリボン帯
  ctx.fillRect(30, 19, 16, 2);
  ctx.fillStyle = "#FF8800";
  ctx.fillRect(36, 19, 3, 2);

  // 赤毛のなびく髪
  const hairSpots: [number, number, number, number][] = [
    [25, 26, 14, 7],
    [22, 28, 8, 5],
    [34, 25, 13, 9],
    [40, 29, 9, 7],
    [20, 31, 6, 3],
  ];
  for (const [x, y, w, h] of hairSpots) {
    ctx.fillStyle = "#FF3300";
    ctx.fillRect(x, y, w, h);
  }
  ctx.fillStyle = "#BB1800";
  ctx.fillRect(37, 29, 8, 4);
  ctx.fillRect(22, 31, 4, 2);

  // 横顔（左向き）
  drawPixelEllipse(ctx, 29, 31, 5, 4, "#FFDF44");
  ctx.fillStyle = "#000000";
  ctx.fillRect(26, 30, 2, 2); // 目
  ctx.fillStyle = "#FFAA22";
  ctx.fillRect(24, 31, 2, 2); // 鼻先
  ctx.fillStyle = "#CC4400";
  ctx.fillRect(27, 33, 2, 1); // 口

  // ほうきの柄（左から右斜め下へ）
  for (let i = 0; i < 46; i++) {
    const bx = 4 + i;
    const by = 45 + Math.round(i * 0.36);
    ctx.fillStyle = "#3A0800";
    ctx.fillRect(bx, by, 2, 3);
    ctx.fillStyle = "#8B1D08";
    ctx.fillRect(bx, by + 1, 2, 1);
  }

  // 風になびく青いローブ・マント
  ctx.fillStyle = "#040E48";
  drawPixelEllipse(ctx, 37, 51, 14, 17, "#081C78");
  // マントの裾（右へなびく）
  ctx.fillStyle = "#0B2496";
  ctx.beginPath();
  ctx.moveTo(28, 36);
  ctx.lineTo(44, 36);
  ctx.lineTo(63, 47);
  ctx.lineTo(54, 58);
  ctx.lineTo(44, 68);
  ctx.lineTo(29, 67);
  ctx.lineTo(22, 54);
  ctx.closePath();
  ctx.fill();

  // ローブの立体シェーディング・しわ線
  ctx.fillStyle = "#1D44D8";
  ctx.fillRect(31, 40, 10, 12);
  ctx.fillRect(46, 44, 11, 7);
  ctx.fillRect(32, 56, 12, 8);
  ctx.fillStyle = "#040B38";
  ctx.fillRect(34, 46, 1, 12);
  ctx.fillRect(44, 48, 8, 1);
  ctx.fillRect(29, 65, 13, 2);
  for (const [hx, hy] of hatPts) {
    ctx.fillStyle = "#030930";
    ctx.fillRect(hx, hy, 1, 1);
  }

  // 両手（ほうきを握る黄色い手袋）
  drawPixelEllipse(ctx, 20, 48, 2.5, 2.5, "#FFEE22");
  drawPixelEllipse(ctx, 29, 51, 2.5, 2.5, "#FFEE22");

  // ほうきの穂先（右下の黄金のわら束）
  ctx.fillStyle = "#885500";
  ctx.fillRect(50, 61, 4, 4);
  ctx.fillStyle = "#FFEE22";
  ctx.beginPath();
  ctx.moveTo(52, 61);
  ctx.lineTo(71, 65);
  ctx.lineTo(74, 78);
  ctx.lineTo(64, 79);
  ctx.lineTo(54, 73);
  ctx.closePath();
  ctx.fill();

  // わらの筋
  ctx.fillStyle = "#AA8800";
  for (let s = 0; s < 5; s++) {
    ctx.fillRect(55 + s * 3, 64 + s * 2, 10, 1);
  }
  ctx.fillStyle = "#FFFF88";
  ctx.fillRect(57, 63, 9, 2);
  ctx.fillRect(60, 69, 8, 2);

  return upscalePixelCanvas(c, 158, 166);
}

/** 3. メニュー画面：魔女到着後タイトル画面 (650x500, NECコピーライトなし) */
function renderTitleArrivedCanvas(moon: HTMLCanvasElement, witch: HTMLCanvasElement): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(650, 500);

  // 黒い夜空
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 650, 500);

  // ささやかなドット星を散りばめる
  const stars: [number, number, string][] = [
    [60, 48, "#6677AA"], [185, 32, "#AAAACC"], [460, 52, "#7788BB"],
    [510, 128, "#6677AA"], [110, 220, "#556688"], [590, 260, "#7788AA"],
    [290, 415, "#556699"], [410, 345, "#6677AA"],
  ];
  for (const [sx, sy, col] of stars) {
    ctx.fillStyle = col;
    ctx.fillRect(sx, sy, 2, 2);
  }

  // 右上の三日月 & 左下の魔女
  ctx.drawImage(moon, 562, 26);
  ctx.drawImage(witch, 0, 279);

  // 3D立体イタリックロゴ: MAGIC / FLIGHT
  const draw3DWord = (word: string, x: number, y: number) => {
    ctx.save();
    ctx.font = 'italic bold 82px "Times New Roman", "Georgia", serif';
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    // 立体押し出し影（右下に段差を積む）
    for (let depth = 9; depth >= 1; depth--) {
      ctx.fillStyle = depth > 5 ? "#5A0B6E" : "#801599";
      ctx.fillText(word, x + depth, y + Math.round(depth * 0.7));
    }
    // メインの明るいピンク文字
    const grad = ctx.createLinearGradient(0, y, 0, y + 76);
    grad.addColorStop(0, "#FF88FF");
    grad.addColorStop(0.55, "#FF44DD");
    grad.addColorStop(1, "#DD22BB");
    ctx.fillStyle = grad;
    ctx.fillText(word, x, y);
    ctx.restore();
  };

  draw3DWord("M A G I C", 40, 42);
  draw3DWord("F L I G H T", 148, 146);

  // サブタイトル
  ctx.fillStyle = "#EEEE66";
  ctx.font = '22px "MS PMincho", "游明朝", "MS PGothic", serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("～ タイプレッスン ～", 325, 272);

  // キー入力促しテキスト (コピーライト表記は入れない)
  ctx.fillStyle = "#FF2200";
  ctx.font = 'bold 20px "MS PGothic", "メイリオ", sans-serif';
  ctx.textAlign = "right";
  ctx.fillText("何かキーを押してください", 612, 434);

  return c;
}

/** 4. ステージ選択：多島海マップ背景 (650x500) */
function renderStageSelectBgCanvas(): HTMLCanvasElement {
  // 325x250 のピクセルグリッドに描いて 2x に拡大することで90年代ドット絵の質感を出す
  const [c, ctx] = makeCanvas(325, 250);

  // 鮮やかなシアンブルーの海
  ctx.fillStyle = "#00E6FE";
  ctx.fillRect(0, 0, 325, 250);

  // 手描き風の青い波線 (~) を描くヘルパー
  const drawWave = (wx: number, wy: number) => {
    ctx.fillStyle = "#1144FF";
    const segs = [
      [0, 2], [1, 1], [2, 0], [4, 0], [6, 1], [7, 2], [8, 1],
      [10, 0], [12, 0], [14, 1], [15, 2], [16, 1], [18, 0], [20, 0], [22, 1], [23, 2],
    ];
    for (const [dx, dy] of segs) {
      ctx.fillRect(wx + dx, wy + dy, 2, 1);
    }
  };

  // 海の波模様
  drawWave(46, 91);
  drawWave(184, 96);
  drawWave(108, 158);
  drawWave(254, 152);
  drawWave(224, 236);

  // 島の輪郭・岩崖・緑森を描く共通ヘルパー
  const drawIslandBlob = (
    blobs: [number, number, number, number][],
    hasSandBeach = false,
    rockyGrey = false,
  ) => {
    // 1) 下部の断崖（黄色砂・赤茶岩）
    for (const [bx, by, rx, ry] of blobs) {
      drawPixelEllipse(ctx, bx, by + 5, rx, ry * 0.85, rockyGrey ? "#889999" : "#DD4422");
      drawPixelEllipse(ctx, bx - 1, by + 3, rx * 0.9, ry * 0.78, rockyGrey ? "#CCCCCC" : "#FFEE22");
      if (hasSandBeach) {
        drawPixelEllipse(ctx, bx + 2, by + 6, rx * 1.05, ry * 0.7, "#FFEE33");
      }
    }
    // 2) 緑の森本体
    for (const [bx, by, rx, ry] of blobs) {
      drawPixelEllipse(ctx, bx, by, rx, ry, "#007A00");
    }
    // 3) 濃い緑の木々ドット（90年代ペイント風のテクスチャ）
    for (const [bx, by, rx, ry] of blobs) {
      pxDot(ctx, bx - rx * 0.35, by - ry * 0.25, 2, "#004D00");
      pxDot(ctx, bx + rx * 0.25, by - ry * 0.15, 2, "#004D00");
      pxDot(ctx, bx, by + ry * 0.2, 2, "#005800");
    }
  };

  // --- 島0 (START島: x=15..140, y=270..375 -> half: 8..70, 135..188) ---
  drawIslandBlob([
    [31, 174, 14, 9],
    [48, 173, 15, 10],
    [39, 166, 13, 8],
  ]);
  // 火山 (島0右側)
  ctx.fillStyle = "#EE6633";
  ctx.beginPath();
  ctx.moveTo(45, 171);
  ctx.lineTo(50, 156);
  ctx.lineTo(57, 156);
  ctx.lineTo(62, 171);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#AA3311";
  ctx.fillRect(51, 156, 5, 2);
  ctx.fillRect(52, 160, 2, 8);
  // 火山の煙
  drawPixelEllipse(ctx, 49, 150, 5, 3, "#B8C8CC");
  drawPixelEllipse(ctx, 44, 145, 6, 3, "#C8D4D8");
  drawPixelEllipse(ctx, 39, 141, 4, 2, "#D8E0E4");
  // START 看板
  ctx.fillStyle = "#552200";
  ctx.fillRect(19, 163, 2, 12);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(19, 155, 21, 9);
  ctx.fillStyle = "#777777";
  ctx.fillRect(19, 163, 21, 1);
  ctx.fillStyle = "#DD1100";
  // 小さなドット文字風バー (START)
  ctx.fillRect(21, 157, 2, 5);
  ctx.fillRect(25, 157, 3, 5);
  ctx.fillRect(29, 157, 3, 5);
  ctx.fillRect(33, 157, 3, 5);
  ctx.fillRect(37, 157, 2, 5);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(26, 158, 1, 1);
  ctx.fillRect(30, 159, 1, 3);
  ctx.fillRect(34, 158, 1, 1);
  // カモメ2羽
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(18, 134, 3, 1);
  ctx.fillRect(21, 132, 3, 2);
  ctx.fillRect(24, 133, 2, 1);
  ctx.fillRect(28, 139, 2, 1);
  ctx.fillRect(30, 137, 3, 2);
  ctx.fillRect(33, 138, 2, 1);

  // --- 島1 (START右上: half 75..106, 132..162) ---
  drawIslandBlob([
    [82, 150, 8, 6],
    [93, 142, 9, 6],
  ]);
  // 小さな岩礁
  drawPixelEllipse(ctx, 110, 138, 3, 2, "#007A00");

  // --- 島2 (左上: half 98..140, 106..132) ---
  drawIslandBlob([
    [110, 118, 11, 7],
    [125, 115, 11, 6],
    [118, 111, 9, 5],
  ]);
  drawPixelEllipse(ctx, 118, 112, 5, 2, "#44DDFF"); // 島の小さな湖

  // --- 島3 (中央上・横長の岩山島: half 144..220, 126..158) ---
  drawIslandBlob(
    [
      [158, 139, 14, 7],
      [182, 137, 16, 8],
      [204, 144, 13, 8],
    ],
    false,
    true,
  );
  // 灰色の岩場アクセント
  drawPixelEllipse(ctx, 175, 144, 7, 3, "#DCDCDC");
  drawPixelEllipse(ctx, 198, 139, 6, 4, "#C8C8C8");

  // --- 島4 (中央: half 146..182, 164..195) ---
  drawIslandBlob([
    [157, 184, 9, 7],
    [168, 176, 10, 7],
  ]);

  // --- 島5 (中央下・カニがいる砂浜の島: half 126..196, 206..242) ---
  drawIslandBlob(
    [
      [148, 222, 16, 9],
      [169, 220, 14, 8],
    ],
    true,
  );
  // 砂浜の赤いカニ
  ctx.fillStyle = "#FF2200";
  ctx.fillRect(163, 232, 5, 3);
  ctx.fillRect(161, 231, 2, 1);
  ctx.fillRect(168, 231, 2, 1);
  ctx.fillRect(162, 235, 1, 2);
  ctx.fillRect(168, 235, 1, 2);

  // --- 島6 周辺の一本木の小島（鳥付き）: half 196..222, 195..224 ---
  drawIslandBlob([[209, 214, 10, 7]]);
  ctx.fillStyle = "#553311";
  ctx.fillRect(208, 200, 2, 12);
  drawPixelEllipse(ctx, 209, 201, 5, 4, "#006600");
  // 木の上の黒い小鳥
  ctx.fillStyle = "#111111";
  ctx.fillRect(208, 195, 3, 2);
  ctx.fillRect(211, 194, 2, 1);

  // --- 島6 (右中央・赤い実の森の島: half 224..282, 172..206) ---
  drawIslandBlob([
    [240, 186, 15, 9],
    [258, 184, 13, 8],
    [269, 191, 9, 6],
  ]);
  // 赤い木の実
  ctx.fillStyle = "#FF2200";
  ctx.fillRect(236, 181, 2, 2);
  ctx.fillRect(247, 179, 2, 2);
  ctx.fillRect(256, 182, 2, 2);
  ctx.fillRect(242, 188, 2, 2);
  // 明るい緑の丸木
  drawPixelEllipse(ctx, 268, 189, 7, 5, "#33AA44");

  // --- 南東の小さな小島: half 256..282, 208..230 ---
  drawIslandBlob([[269, 217, 10, 7]]);

  // --- 島7 (GOAL島: half 286..325, 170..220) ---
  drawIslandBlob([
    [304, 204, 14, 10],
    [317, 190, 11, 12],
  ]);
  // 輝く黄金の宝箱
  ctx.fillStyle = "#FFEE22";
  ctx.fillRect(302, 191, 13, 10);
  ctx.fillStyle = "#AA6600";
  ctx.fillRect(302, 195, 13, 1);
  ctx.strokeStyle = "#884400";
  ctx.fillRect(307, 194, 3, 3);
  // ピンクの輝き・宝石
  ctx.fillStyle = "#FF33AA";
  ctx.fillRect(311, 195, 4, 4);
  // 放射状の黄色い光線
  ctx.fillStyle = "#FFFF44";
  ctx.fillRect(293, 192, 7, 1);
  ctx.fillRect(295, 186, 5, 2);
  ctx.fillRect(304, 183, 2, 6);
  ctx.fillRect(313, 184, 5, 2);

  return upscalePixelCanvas(c, 650, 500);
}

/** 5. ステージ選択：オレンジの案内バナー (462x102) */
function renderStageBannerCanvas(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(462, 102);

  // ドロップシャドウ
  ctx.fillStyle = "#558899";
  ctx.beginPath();
  ctx.roundRect(6, 6, 454, 94, 14);
  ctx.fill();

  // オレンジの角丸ボックス
  ctx.fillStyle = "#FF8800";
  ctx.beginPath();
  ctx.roundRect(0, 0, 454, 94, 14);
  ctx.fill();

  // 上端にうっすらハイライト線
  ctx.strokeStyle = "#FFAA44";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(2, 2, 450, 90, 12);
  ctx.stroke();

  // メッセージテキスト
  ctx.fillStyle = "#111111";
  ctx.font = '24px "MS PGothic", "メイリオ", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("空飛ぶ魔法のほうきを与えよう。", 36, 16);
  ctx.fillText("最後の島までうまく渡りたまえ。", 36, 54);

  return c;
}

/** 6. ステージ選択：島の上に立つ正面魔女 (34x34) */
function renderStageWitchCanvas(): HTMLCanvasElement {
  const grid = [
    ".......PPPP......",
    "......PPPPPP.....",
    ".....PPPPPppp....",
    "....PPPPPPPPPP...",
    "..PPPPPPPPPPPPPP.",
    "....RRRRRRRRRR...",
    "...RRRFFFFFFRRR..",
    "...RRFEFFFFEFRR..",
    "...RRRFFFFFFRRR..",
    "....RRFFMMFFRR...",
    ".....PPPPPPPP....",
    "...PPPPPPPPPPPP..",
    "..BPPPPPPPPPPPP..",
    "..B.PPPPPPPPPP...",
    ".YB..PPPPPPPP....",
    "YYB..PP....PP....",
    "YY...............",
  ];
  const palette: Record<string, string> = {
    P: "#7A0A99",
    p: "#B833DD",
    R: "#FF3300",
    F: "#FFD2B8",
    E: "#221122",
    M: "#CC4444",
    B: "#7A2A08",
    Y: "#FFEE22",
  };
  return drawGridSprite(grid, palette, 34, 34);
}

/** 7. タイピング画面：右向き飛行魔女 (40x36) */
function renderWitchFlyCanvas(): HTMLCanvasElement {
  const grid = [
    "......PP............",
    ".....PPPP...........",
    "....PPPPPP..........",
    "...PPYYPPPPPP.......",
    "..PPPPPPPPPPPP......",
    ".....RRRRRFFFF......",
    "....RRRRRFFFEFF.....",
    "....RRRRRRFFFF......",
    ".....RRRRPPPP.......",
    "...PPPPPPPPPPPPP....",
    ".PPPPPPPPPPPPPPPPP..",
    ".PPPPPPPPPPPPPPPFF..",
    "...PPPPPPPPPPPPP....",
    "....PPPPPPPPPP......",
    "BBBBBBBBBBBBBBBBBB..",
    "YYYYB...............",
    "YYYYY...............",
    ".YYY................",
  ];
  const palette: Record<string, string> = {
    P: "#8811AA",
    Y: "#FFEE22",
    R: "#FF3300",
    F: "#FFD4BC",
    E: "#111122",
    B: "#771C04",
  };
  return drawGridSprite(grid, palette, 40, 36);
}

/** 8. タイピング画面：海に落下した水しぶき魔女 (40x36) */
function renderWitchSplashCanvas(): HTMLCanvasElement {
  const grid = [
    "..BB................",
    "..BBB.......BB......",
    "...BB........BB..W..",
    "....W..BB...WW......",
    "......PPPP..BB...B..",
    "....PPPPPPPP........",
    "..YYPPPPPPPP........",
    "..YY.RRRRRRRR.......",
    "....RRRFFFFRRR..B...",
    "....RRFFFFFFRR......",
    "..WW.PPPPPPPP.WW....",
    "..BBPPPPPPPPPPBB....",
    ".BBBBPPPPPPPPBBBB...",
    ".BWWBBPPPPPPBBWWB...",
    "BBBBBBBBBBBBBBBBBB..",
    "BWWBBBBBBBBBBBBWWB..",
    "BBBBWWWWBBBBWWWWBB..",
    "BBBBBBBBBBBBBBBBBB..",
  ];
  const palette: Record<string, string> = {
    B: "#0033EE",
    W: "#EEFFFF",
    P: "#8811AA",
    Y: "#FFEE22",
    R: "#FF3300",
    F: "#FFD2B8",
  };
  return drawGridSprite(grid, palette, 40, 36);
}

/** 9. タイピング画面：下部両手ガイド (524x89) */
function renderHandsBgCanvas(): HTMLCanvasElement {
  // 262x45 で描き 2x に拡大することで 90年代ペイント調の両手イラストにする
  // handsBg はキャンバス座標 (70, 411) に描画されるため、ローカル座標は (cx - 70)/2, (cy - 411)/2
  const [c, ctx] = makeCanvas(262, 45);

  ctx.fillStyle = "#10FFFF";
  ctx.fillRect(0, 0, 262, 45);

  const drawFingerCapsule = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r: number,
    color: string,
  ) => {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const fx = x0 + (x1 - x0) * t;
      const fy = y0 + (y1 - y0) * t;
      drawPixelEllipse(ctx, fx, fy, r, r, color);
    }
  };

  // 指の座標（親指・4本指ともに HandsRenderer.FINGER_TIPS に位置を合わせる）
  // Left hand local half-coords:
  // Pinky(18, 19), Ring(40, 9), Middle(62, 9), Index(84, 14), Thumb(104, 31)
  // Right hand local half-coords:
  // Thumb(157, 29), Index(176, 14), Middle(198, 6), Ring(220, 9), Pinky(238, 14)
  const leftFingers: [number, number, number, number, number][] = [
    [18, 19, 14, 42, 6.2],
    [40, 9, 34, 41, 6.8],
    [62, 9, 53, 41, 7.0],
    [84, 14, 71, 41, 7.2],
    [104, 31, 88, 44, 6.6],
  ];
  const rightFingers: [number, number, number, number, number][] = [
    [157, 29, 173, 44, 6.6],
    [176, 14, 189, 41, 7.2],
    [198, 6, 207, 41, 7.0],
    [220, 9, 226, 41, 6.8],
    [238, 14, 245, 42, 6.2],
  ];

  // 1) 右側グレー立体影
  for (const [x0, y0, x1, y1, r] of [...leftFingers, ...rightFingers]) {
    drawFingerCapsule(x0 + 3, y0 + 2, x1 + 3, y1 + 2, r, "#A8B8B8");
  }
  drawPixelEllipse(ctx, 56, 44, 44, 15, "#A8B8B8");
  drawPixelEllipse(ctx, 212, 44, 44, 15, "#A8B8B8");

  // 2) コーラルオレンジ色の手・指本体
  for (const [x0, y0, x1, y1, r] of [...leftFingers, ...rightFingers]) {
    drawFingerCapsule(x0, y0, x1, y1, r, "#FA684E");
  }
  drawPixelEllipse(ctx, 53, 44, 43, 15, "#FA684E");
  drawPixelEllipse(ctx, 209, 44, 43, 15, "#FA684E");

  // 3) 各指の付け根の赤い3本シワ線 (|||)
  const knuckles: [number, number][] = [
    [14, 38], [34, 36], [53, 36], [72, 36],
    [188, 36], [207, 36], [227, 36], [244, 36],
  ];
  ctx.fillStyle = "#C82010";
  for (const [kx, ky] of knuckles) {
    ctx.fillRect(kx - 2, ky, 1, 3);
    ctx.fillRect(kx, ky - 1, 1, 4);
    ctx.fillRect(kx + 2, ky, 1, 3);
  }

  return upscalePixelCanvas(c, 524, 89);
}

/** 10. 最終島クリア：お宝を見つけて大喜びする魔女の全画面ゲームクリア絵 (650x500) */
function renderEndingSceneCanvas(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(325, 250);

  // 1) 夕暮れ〜星空の段彩レトロ空 (y = 0..146)
  const skyBands: [number, number, string][] = [
    [0, 32, "#161052"],
    [32, 30, "#2A1874"],
    [62, 28, "#52228C"],
    [90, 28, "#943278"],
    [118, 16, "#D85858"],
    [134, 14, "#FF9844"],
  ];
  for (const [by, bh, col] of skyBands) {
    ctx.fillStyle = col;
    ctx.fillRect(0, by, 325, bh);
  }

  // 夜空の星ドット
  const stars: [number, number, string][] = [
    [22, 16, "#FFFFAA"], [58, 28, "#CCCCFF"], [105, 14, "#FFFFFF"],
    [154, 22, "#FFEE88"], [214, 18, "#FFFFFF"], [268, 26, "#FFFFAA"],
    [300, 14, "#CCCCFF"], [38, 52, "#AAAADD"], [286, 48, "#FFEE99"],
  ];
  for (const [sx, sy, col] of stars) {
    ctx.fillStyle = col;
    ctx.fillRect(sx, sy, 1, 1);
  }

  // 2) 水平線とキラキラ輝く海 (y = 148..178)
  ctx.fillStyle = "#00A8E8";
  ctx.fillRect(0, 148, 325, 30);
  ctx.fillStyle = "#00D8FF";
  ctx.fillRect(0, 154, 325, 22);
  ctx.fillStyle = "#FFEE66";
  for (let rx = 20; rx < 310; rx += 22) {
    ctx.fillRect(rx, 150 + ((rx * 3) % 8), 8, 1);
    ctx.fillRect(rx + 6, 160 + ((rx * 5) % 10), 6, 1);
  }

  // 3) 宝島の砂浜と左右の緑の丘・ヤシの木 (y = 166..250)
  drawPixelEllipse(ctx, 162, 228, 175, 58, "#FFCC33");
  drawPixelEllipse(ctx, 162, 214, 165, 42, "#FFEE66");
  // 波打ち際
  ctx.fillStyle = "#FFFFFF";
  for (let wx = 8; wx < 318; wx += 14) {
    ctx.fillRect(wx, 174 + (wx % 3), 9, 1);
  }
  // 左右の緑の丘とヤシの木
  drawPixelEllipse(ctx, 16, 198, 28, 18, "#007A00");
  drawPixelEllipse(ctx, 310, 196, 28, 18, "#007A00");
  drawPixelEllipse(ctx, 12, 194, 18, 12, "#00A000");
  drawPixelEllipse(ctx, 312, 192, 18, 12, "#00A000");

  // 左のヤシの木
  ctx.fillStyle = "#7A3A12";
  for (let i = 0; i < 42; i++) {
    ctx.fillRect(18 - Math.floor(i * 0.14), 190 - i, 3, 2);
  }
  drawPixelEllipse(ctx, 12, 146, 14, 4, "#008800");
  drawPixelEllipse(ctx, 22, 148, 12, 4, "#00AA00");
  drawPixelEllipse(ctx, 6, 152, 10, 4, "#006600");

  // 右のヤシの木
  ctx.fillStyle = "#7A3A12";
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(304 + Math.floor(i * 0.14), 188 - i, 3, 2);
  }
  drawPixelEllipse(ctx, 300, 146, 13, 4, "#008800");
  drawPixelEllipse(ctx, 312, 145, 13, 4, "#00AA00");

  // 4) 宝箱から放たれる黄金の光線
  const cxChest = 238;
  const cyChest = 162;
  ctx.fillStyle = "rgba(255, 245, 110, 0.38)";
  const rayAngles = [-2.4, -2.0, -1.55, -1.1, -0.65, -0.25];
  for (const ang of rayAngles) {
    ctx.beginPath();
    ctx.moveTo(cxChest, cyChest);
    ctx.lineTo(cxChest + Math.cos(ang - 0.1) * 115, cyChest + Math.sin(ang - 0.1) * 115);
    ctx.lineTo(cxChest + Math.cos(ang + 0.1) * 115, cyChest + Math.sin(ang + 0.1) * 115);
    ctx.closePath();
    ctx.fill();
  }

  // 5) 豪華な大宝箱 (x: 194..284, y: 126..210)
  // 地面影
  drawPixelEllipse(ctx, 240, 211, 46, 7, "#CC9922");
  // 開いたフタ（後ろ側）
  ctx.fillStyle = "#4A1604";
  ctx.fillRect(197, 126, 86, 32);
  ctx.fillStyle = "#8C320E";
  ctx.fillRect(200, 129, 80, 26);
  ctx.fillStyle = "#FFEE22"; // フタの黄金帯
  ctx.fillRect(198, 127, 84, 3);
  ctx.fillRect(212, 128, 5, 28);
  ctx.fillRect(263, 128, 5, 28);
  // 宝箱内部の闇と溢れるお宝（金貨・王冠・宝石）
  ctx.fillStyle = "#2A0C02";
  ctx.fillRect(198, 155, 84, 16);
  drawPixelEllipse(ctx, 240, 164, 40, 12, "#FFCC00");
  drawPixelEllipse(ctx, 240, 162, 34, 9, "#FFEE44");
  // 金貨のつぶつぶ
  ctx.fillStyle = "#FF9900";
  for (let gx = 206; gx <= 274; gx += 6) {
    ctx.fillRect(gx, 159 + (gx % 4), 3, 2);
    ctx.fillRect(gx + 2, 164 - (gx % 3), 3, 2);
  }
  // 黄金の王冠
  ctx.fillStyle = "#FFFF55";
  ctx.fillRect(228, 146, 16, 8);
  ctx.fillRect(228, 142, 3, 4);
  ctx.fillRect(234, 141, 4, 5);
  ctx.fillRect(241, 142, 3, 4);
  ctx.fillStyle = "#FF2244";
  ctx.fillRect(235, 148, 2, 2);
  // ルビー・サファイア・エメラルド
  pxDot(ctx, 214, 156, 4, "#FF2255");
  pxDot(ctx, 213, 155, 1, "#FFFFFF");
  pxDot(ctx, 257, 155, 4, "#22BBFF");
  pxDot(ctx, 256, 154, 1, "#FFFFFF");
  pxDot(ctx, 269, 159, 3, "#22EE66");
  // 宝箱の下部本体
  ctx.fillStyle = "#4A1604";
  ctx.fillRect(194, 165, 92, 44);
  ctx.fillStyle = "#8C320E";
  ctx.fillRect(197, 168, 86, 38);
  ctx.fillStyle = "#6E2408";
  ctx.fillRect(197, 180, 86, 2);
  ctx.fillRect(197, 193, 86, 2);
  // 金枠と鍵穴プレート
  ctx.fillStyle = "#FFEE22";
  ctx.fillRect(195, 166, 90, 4);
  ctx.fillRect(195, 204, 90, 4);
  ctx.fillRect(210, 166, 6, 42);
  ctx.fillRect(264, 166, 6, 42);
  ctx.fillRect(233, 166, 14, 16);
  ctx.fillStyle = "#331100";
  ctx.fillRect(239, 171, 2, 7);
  // 宝箱手前にこぼれ落ちた金貨と宝石
  drawPixelEllipse(ctx, 198, 211, 5, 2, "#FFEE22");
  drawPixelEllipse(ctx, 282, 212, 6, 2, "#FFEE22");
  pxDot(ctx, 214, 213, 2, "#FF2255");
  pxDot(ctx, 266, 214, 2, "#22BBFF");

  // 6) 大喜びしてジャンプする魔女 (x: 52..178, y: 74..216)
  // 地面のジャンプ影
  drawPixelEllipse(ctx, 115, 215, 26, 5, "#CC9922");

  // 左手（ほうきを掲げる腕）
  ctx.fillStyle = "#162A9E";
  ctx.beginPath();
  ctx.moveTo(98, 152);
  ctx.lineTo(74, 130);
  ctx.lineTo(80, 123);
  ctx.lineTo(104, 142);
  ctx.closePath();
  ctx.fill();
  // 右手（お宝の宝石を掲げる腕）
  ctx.beginPath();
  ctx.moveTo(130, 152);
  ctx.lineTo(156, 128);
  ctx.lineTo(162, 135);
  ctx.lineTo(136, 160);
  ctx.closePath();
  ctx.fill();

  // ほうき（左手に持って高く掲げている）
  for (let i = 0; i < 66; i++) {
    const bx = 56 + Math.round(i * 0.42);
    const by = 186 - i;
    ctx.fillStyle = "#5A1202";
    ctx.fillRect(bx, by, 3, 3);
    ctx.fillStyle = "#8C2408";
    ctx.fillRect(bx + 1, by + 1, 2, 1);
  }
  // ほうきの穂先（左下）
  ctx.fillStyle = "#FFEE22";
  ctx.beginPath();
  ctx.moveTo(57, 184);
  ctx.lineTo(44, 198);
  ctx.lineTo(57, 206);
  ctx.lineTo(67, 192);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#CC9900";
  ctx.fillRect(50, 195, 8, 1);
  ctx.fillRect(52, 199, 8, 1);

  // 魔女の足・ブーツ（嬉しくて片足跳ね上げ）
  ctx.fillStyle = "#221133";
  ctx.fillRect(102, 186, 6, 14);
  ctx.fillRect(98, 198, 10, 5);
  ctx.fillRect(120, 182, 6, 11);
  ctx.fillRect(122, 191, 10, 5);

  // 魔女のドレス・マント本体
  ctx.fillStyle = "#081458";
  drawPixelEllipse(ctx, 114, 164, 20, 24, "#10248E");
  ctx.fillStyle = "#1D40D0";
  ctx.beginPath();
  ctx.moveTo(100, 142);
  ctx.lineTo(128, 142);
  ctx.lineTo(139, 186);
  ctx.lineTo(90, 186);
  ctx.closePath();
  ctx.fill();
  // ドレスのハイライト・ひだ
  ctx.fillStyle = "#3358EE";
  ctx.fillRect(106, 148, 8, 30);
  ctx.fillStyle = "#FFEE22"; // 胸元の星ブローチ
  ctx.fillRect(113, 148, 3, 3);

  // 赤毛の髪（わっさりと元気よく広がる）
  drawPixelEllipse(ctx, 114, 122, 22, 16, "#FF3300");
  drawPixelEllipse(ctx, 97, 128, 9, 10, "#DD2200");
  drawPixelEllipse(ctx, 131, 128, 9, 10, "#DD2200");

  // 顔（満面の笑顔！）
  drawPixelEllipse(ctx, 114, 124, 14, 12, "#FFD6B8");
  // にっこり笑い目 (^ ^)
  ctx.fillStyle = "#111122";
  ctx.fillRect(104, 120, 5, 2);
  ctx.fillRect(103, 122, 2, 1);
  ctx.fillRect(108, 122, 2, 1);
  ctx.fillRect(119, 120, 5, 2);
  ctx.fillRect(118, 122, 2, 1);
  ctx.fillRect(123, 122, 2, 1);
  // ほっぺの赤み
  ctx.fillStyle = "#FF8888";
  ctx.fillRect(102, 124, 4, 2);
  ctx.fillRect(122, 124, 4, 2);
  // 大きく笑う口
  ctx.fillStyle = "#CC1122";
  drawPixelEllipse(ctx, 114, 129, 5, 3, "#CC1122");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(111, 127, 6, 1);

  // とんがり帽子（大きく立派な紺色帽子＋黄色リボン）
  ctx.fillStyle = "#081C78";
  ctx.beginPath();
  ctx.moveTo(86, 115);
  ctx.lineTo(142, 113);
  ctx.lineTo(126, 98);
  ctx.lineTo(116, 76);
  ctx.lineTo(106, 86);
  ctx.lineTo(101, 102);
  ctx.closePath();
  ctx.fill();
  // 帽子のハイライト＆黄色リボン
  ctx.fillStyle = "#1D44D8";
  ctx.fillRect(108, 86, 7, 16);
  ctx.fillStyle = "#FFEE22";
  ctx.fillRect(99, 106, 30, 3);
  ctx.fillStyle = "#FF8800";
  ctx.fillRect(112, 105, 5, 5);

  // 両手先のグローブ（左はほうき、右は巨大ダイヤ/ルビーを掲げる）
  drawPixelEllipse(ctx, 76, 125, 4, 4, "#FFEE22");
  drawPixelEllipse(ctx, 160, 130, 4, 4, "#FFEE22");

  // 魔女が右手に掲げる巨大な宝石！
  ctx.fillStyle = "#33DDFF";
  ctx.beginPath();
  ctx.moveTo(160, 110);
  ctx.lineTo(170, 118);
  ctx.lineTo(160, 128);
  ctx.lineTo(150, 118);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(157, 114, 3, 3);

  // 周囲にキラキラ・音符
  ctx.fillStyle = "#FFFF66";
  ctx.fillRect(76, 94, 2, 6);
  ctx.fillRect(74, 96, 6, 2);
  ctx.fillRect(152, 92, 2, 6);
  ctx.fillRect(150, 94, 6, 2);

  return upscalePixelCanvas(c, 650, 500);
}

export async function generateAllRetroArt(): Promise<GeneratedRetroArt> {
  const titleWitchCanvas = renderTitleWitchCanvas();
  const titleMoonCanvas = renderTitleMoonCanvas();
  const titleArrivedCanvas = renderTitleArrivedCanvas(titleMoonCanvas, titleWitchCanvas);
  const stageSelectBgCanvas = renderStageSelectBgCanvas();
  const stageBannerCanvas = renderStageBannerCanvas();
  const stageWitchCanvas = renderStageWitchCanvas();
  const witchFlyCanvas = renderWitchFlyCanvas();
  const witchSplashCanvas = renderWitchSplashCanvas();
  const handsBgCanvas = renderHandsBgCanvas();
  const endingSceneCanvas = renderEndingSceneCanvas();

  const [
    titleWitch,
    titleMoon,
    titleArrived,
    stageSelectBg,
    stageBanner,
    stageWitch,
    witchFly,
    witchSplash,
    handsBg,
    endingScene,
  ] = await Promise.all([
    canvasToImage(titleWitchCanvas),
    canvasToImage(titleMoonCanvas),
    canvasToImage(titleArrivedCanvas),
    canvasToImage(stageSelectBgCanvas),
    canvasToImage(stageBannerCanvas),
    canvasToImage(stageWitchCanvas),
    canvasToImage(witchFlyCanvas),
    canvasToImage(witchSplashCanvas),
    canvasToImage(handsBgCanvas),
    canvasToImage(endingSceneCanvas),
  ]);

  return {
    titleWitch,
    titleMoon,
    titleArrived,
    stageSelectBg,
    stageBanner,
    stageWitch,
    witchFly,
    witchSplash,
    handsBg,
    endingScene,
  };
}
