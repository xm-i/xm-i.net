export interface Theme {
  color1: string; // 通常の文字など
  color2: string; // メッセージの文字など
  color3: string; // アクティブな文字、アクセサリなど
  color4: string; // 準アクティブな文字、アクセサリなど
  color5: string; // アクセサリの通常色など
}

export const TYPE_FONT_FAMILY =
  '"ヒラギノ角ゴ Pro W3", "メイリオ", "Meiryo", "Osaka-Mono", "Takaoフォント", "IPAフォント", "MS PGothic", "MS Gothic", sans-serif';

export const THEMES: Record<string, Theme> = {
  cream: { color5: "#FDF0D0", color4: "#DDBB99", color3: "#DDAA77", color1: "#665544", color2: "#EE9955" },
  dark: { color5: "#111116", color4: "#1155CC", color3: "#FF4411", color1: "#DDDDEE", color2: "#DD3333" },
  sweet: { color5: "#3D7F7F", color4: "#858383", color3: "#A38282", color2: "#C28080", color1: "#FFFFFF" },
  italian: { color4: "#A62424", color5: "#BF863F", color3: "#43732D", color1: "#FFFFFF", color2: "#8C4820" },
  tiger: { color1: "#000000", color2: "#646639", color4: "#B29B2E", color5: "#F2E971", color3: "#D9561C" },
  swallow: { color1: "#FFFFFF", color2: "#EEEFFF", color4: "#5C6173", color5: "#010712", color3: "#961227" },
  mint: { color5: "#649670", color2: "#36291E", color1: "#000000", color4: "#92E57C", color3: "#C5FF84" },
  sakura: { color3: "#3C4631", color1: "#9A746F", color4: "#F8A2AB", color5: "#F4C6B3", color2: "#FFFED1" },
  cookie: { color3: "#468966", color5: "#FFF0A5", color4: "#FFB03B", color2: "#B64926", color1: "#8E2800" },
  monotone: { color3: "#444444", color5: "#FFFFFF", color4: "#CCCCCC", color2: "#888888", color1: "#000000" },
  sepia: { color1: "#322E25", color2: "#40392C", color3: "#706350", color4: "#B2A489", color5: "#EEDBBB" },
  chocolate: { color1: "#FFF1CC", color2: "#DBD1BC", color3: "#4999C3", color4: "#AB926D", color5: "#45291A" },
};

export let currentTheme: Theme = { ...THEMES.cream };

export function setTheme(theme: Theme): void {
  Object.assign(currentTheme, theme);
}
