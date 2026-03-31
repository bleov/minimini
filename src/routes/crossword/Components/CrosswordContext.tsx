import {
  createContext,
  useContext,
  type Dispatch,
  type MutableRefObject,
  type ReactNode,
  type RefObject,
  type SetStateAction
} from "react";

import type { MiniCrossword, MiniCrosswordClue } from "@/lib/types";

export type CrosswordModalType = "victory" | "incorrect" | "leaderboard" | null;

export interface CrosswordContextValue {
  body: MiniCrossword["body"][number];
  data: MiniCrossword;
  user: { id: string } | null;
  stateDocId: RefObject<string>;
  boardRef: RefObject<HTMLDivElement | null>;
  rebusRef: RefObject<HTMLInputElement | null>;
  timeRef: React.RefObject<number[]>;
  incorrectShown: MutableRefObject<boolean>;
  globalSelectedClue: MiniCrosswordClue | null;

  selected: number | null;
  direction: "across" | "down";
  boardState: { [key: number]: string };
  modalType: CrosswordModalType;
  paused: boolean;
  type: "mini" | "daily" | "midi" | "custom";
  options: (string | number)[];
  complete: boolean;
  keyboardOpen: boolean;
  autoCheck: boolean;
  rebusMode: boolean;
  rebusText: string;
  boardHeight: number;
  prefersReducedMotion: boolean;
  alreadyCompleted: boolean;
  letters: string[];
  exit: (destination?: string) => void;

  setSelected: Dispatch<SetStateAction<number | null>>;
  setDirection: Dispatch<SetStateAction<"across" | "down">>;
  setModalType: Dispatch<SetStateAction<CrosswordModalType>>;
  setComplete: (complete: boolean) => void;
  setKeyboardOpen: Dispatch<SetStateAction<boolean>>;
  setAutoCheck: Dispatch<SetStateAction<boolean>>;
  setRebusMode: Dispatch<SetStateAction<boolean>>;
  setRebusText: Dispatch<SetStateAction<string>>;

  getCellsInDirection: (start: number, dir: "across" | "down") => number[];
  checkCell: (cellIndex: number) => boolean;
  typeLetter: (letter: string, cellIndex: number) => void;
  nextCell: () => void;
  previous: (start?: boolean) => void;
  next: () => void;
  nextEditableClue: (previous?: boolean) => void;
  arrowKey: (key: string, dir: "across" | "down") => void;
  checkBoard: () => { totalCells: number; totalFilled: number; totalCorrect: number };
}

const CrosswordContext = createContext<CrosswordContextValue | null>(null);

export function CrosswordProvider({ value, children }: { value: CrosswordContextValue; children: ReactNode }) {
  return <CrosswordContext.Provider value={value}>{children}</CrosswordContext.Provider>;
}

export function useCrosswordContext() {
  const context = useContext(CrosswordContext);
  if (!context) {
    throw new Error("useCrosswordContext must be used within a CrosswordProvider");
  }
  return context;
}
