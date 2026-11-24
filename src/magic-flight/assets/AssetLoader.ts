import { TypeSound } from "../engine/TypeSound";
import { generateAllRetroArt } from "./RetroArt";

export interface GameImages {
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
  witch: HTMLImageElement;
  witchDead: HTMLImageElement;
  veryhard: HTMLImageElement;
  hard: HTMLImageElement;
  normal: HTMLImageElement;
  easy: HTMLImageElement;
  veryeasy: HTMLImageElement;
  flag: HTMLImageElement;
}

const MEDIA_BASE = `${import.meta.env.BASE_URL}magic-flight/media/`;

const STATIC_IMAGE_URLS = {
  witch: `${MEDIA_BASE}witch.gif`,
  witchDead: `${MEDIA_BASE}witch_dead.gif`,
  veryhard: `${MEDIA_BASE}veryhard.gif`,
  hard: `${MEDIA_BASE}hard.gif`,
  normal: `${MEDIA_BASE}normal.gif`,
  easy: `${MEDIA_BASE}easy.gif`,
  veryeasy: `${MEDIA_BASE}veryeasy.gif`,
  flag: `${MEDIA_BASE}flag.gif`,
} as const;

type StaticImageKey = keyof typeof STATIC_IMAGE_URLS;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * 90年代レトロ風オリジナルドット絵＋音声・AS3互換アセット一括ローダー。
 */
export async function loadAllAssets(): Promise<GameImages> {
  const entries = Object.entries(STATIC_IMAGE_URLS) as [StaticImageKey, string][];
  const soundPromise = TypeSound.preload();
  const retroArtPromise = generateAllRetroArt();
  const staticPromises = entries.map(async ([key, url]) => {
    const img = await loadImage(url);
    return [key, img] as const;
  });

  const [retroArt, staticImages] = await Promise.all([
    retroArtPromise,
    Promise.all(staticPromises),
    soundPromise,
  ]);

  const images = { ...retroArt } as GameImages;
  for (const [key, img] of staticImages) {
    images[key] = img;
  }
  return images;
}
