export type SoundName =
  | "type"
  | "missType"
  | "wordType"
  | "start"
  | "stop"
  | "count"
  | "pause"
  | "resume";

const SOUND_BASE = `${import.meta.env.BASE_URL}magic-flight/assets/`;

const SOUND_PATHS: Record<SoundName, string> = {
  type: `${SOUND_BASE}type.mp3`,
  missType: `${SOUND_BASE}missType.mp3`,
  wordType: `${SOUND_BASE}wordType.mp3`,
  start: `${SOUND_BASE}start.mp3`,
  stop: `${SOUND_BASE}stop.mp3`,
  count: `${SOUND_BASE}count.mp3`,
  pause: `${SOUND_BASE}pause.mp3`,
  resume: `${SOUND_BASE}resume.mp3`,
};

/**
 * 効果音を管理・再生するクラス (AS3 TypeSound + SoundUtils 再現)
 * Main.as の SoundMixer.volume = 0.1 に合わせてマスター音量を 0.1 に設定する。
 */
export class TypeSound {
  private static audioCtx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static buffers = new Map<SoundName, AudioBuffer>();
  private static rawBuffers = new Map<SoundName, ArrayBuffer>();
  private static loadPromise: Promise<void> | null = null;
  private static masterVolume = 0.1;

  volume = 1;

  private static ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!TypeSound.audioCtx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      TypeSound.audioCtx = new Ctx();
      TypeSound.masterGain = TypeSound.audioCtx.createGain();
      TypeSound.masterGain.gain.value = TypeSound.masterVolume;
      TypeSound.masterGain.connect(TypeSound.audioCtx.destination);
    }
    return TypeSound.audioCtx;
  }

  static setMasterVolume(vol: number): void {
    TypeSound.masterVolume = Math.max(0, Math.min(1, vol));
    if (TypeSound.masterGain) {
      TypeSound.masterGain.gain.value = TypeSound.masterVolume;
    }
  }

  static getMasterVolume(): number {
    return TypeSound.masterVolume;
  }

  static unlock(): void {
    const ctx = TypeSound.ensureContext();
    if (ctx && ctx.state === "suspended") {
      void ctx.resume().then(() => TypeSound.decodePending());
    } else if (ctx && ctx.state === "running") {
      void TypeSound.decodePending();
    }
  }

  private static async decodePending(): Promise<void> {
    const ctx = TypeSound.audioCtx;
    if (!ctx) return;
    const entries = Array.from(TypeSound.rawBuffers.entries());
    for (const [name, raw] of entries) {
      if (TypeSound.buffers.has(name)) continue;
      try {
        const decoded = await ctx.decodeAudioData(raw.slice(0));
        TypeSound.buffers.set(name, decoded);
      } catch {
        // Ignore audio decode failures in restricted environments
      }
    }
  }

  static preload(): Promise<void> {
    if (TypeSound.loadPromise) return TypeSound.loadPromise;
    TypeSound.loadPromise = (async () => {
      const entries = Object.entries(SOUND_PATHS) as [SoundName, string][];
      await Promise.all(
        entries.map(async ([name, url]) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return;
            const buf = await res.arrayBuffer();
            TypeSound.rawBuffers.set(name, buf);
            const ctx = TypeSound.ensureContext();
            if (ctx) {
              try {
                const decoded = await ctx.decodeAudioData(buf.slice(0));
                TypeSound.buffers.set(name, decoded);
              } catch {
                // Will decode on unlock if browser requires gesture first
              }
            }
          } catch {
            // Ignore network/fetch errors
          }
        }),
      );
    })();
    return TypeSound.loadPromise;
  }

  play(name: SoundName): void {
    const ctx = TypeSound.ensureContext();
    if (!ctx || !TypeSound.masterGain) return;

    if (ctx.state === "suspended") {
      void ctx.resume().then(() => TypeSound.decodePending());
    }

    const buffer = TypeSound.buffers.get(name);
    if (!buffer) return;

    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      if (this.volume !== 1) {
        const g = ctx.createGain();
        g.gain.value = this.volume;
        source.connect(g);
        g.connect(TypeSound.masterGain);
      } else {
        source.connect(TypeSound.masterGain);
      }
      source.start(0);
    } catch {
      // Ignore playback errors
    }
  }
}
