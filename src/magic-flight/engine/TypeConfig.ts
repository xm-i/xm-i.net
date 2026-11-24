import { TypeOption } from "./TypeOption";

export type BoardLayout = "qwerty" | "dvorak";

export const TypeConfig = {
  QWERTY: "qwerty" as const,
  DVORAK: "dvorak" as const,
  CR_LF: "\r\n" as const,
  CR: "\r" as const,
  LF: "\n" as const,
  option: new TypeOption(),
  enter: "\r\n" as string,
  board: "qwerty" as BoardLayout,
  space: false,
};
