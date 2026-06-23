import type { ArchiveRecord, ArchiveResponse } from "./pb-types";

export interface Crossword {
  assets?: CrosswordAsset[];
  body: CrosswordBody[];
  constructors: string[];
  copyright: string;
  id: number;
  lastUpdated: string;
  publicationDate: string;
  subcategory: number;
  freePuzzle: boolean;
  title?: string;
  editor?: string;
}

export interface CrosswordBody {
  board: string;
  cells: CrosswordCell[];
  clueLists: CrosswordClueList[];
  clues: CrosswordClue[];
  dimensions: CrosswordDimensions;
  SVG?: {};
}

export interface CrosswordCell {
  answer?: string;
  clues?: number[];
  label?: string;
  type?: number;
  moreAnswers?: { valid: string[] };
}

export interface CrosswordClueList {
  clues: number[];
  name: string;
}

export interface CrosswordClue {
  cells: number[];
  direction: string;
  label: string;
  list?: number;
  text: CrosswordClueText[];
  relatives?: number[];
}

export interface CrosswordClueText {
  formatted?: string;
  plain: string;
}

export interface CrosswordDimensions {
  height: number;
  width: number;
}

export interface CrosswordAsset {
  uri: string;
}

export interface ConnectionsCard {
  content: string;
  position: number;
  image_url?: string;
  image_alt_text?: string;
}

export interface ConnectionsCategory {
  title: string;
  cards: ConnectionsCard[];
}

export interface ConnectionsGame {
  status: string;
  id: number;
  print_date: string;
  editor: string;
  categories: ConnectionsCategory[];
}

export interface WordleGame {
  id: number;
  solution: string;
  print_date: string;
  days_since_launch: number;
  editor: string;
  guesses?: number;
}

export interface WordleState {
  complete: boolean;
  completeRows: number[];
  letters: string[][];
}

export interface StrandsGame {
  status: string;
  id: number;
  printDate: string;
  themeWords: string[];
  editor: string;
  constructors: string;
  spangram: string;
  clue: string;
  startingBoard: string[];
  solutions: string[];
  themeCoords: Record<string, number[][]>;
  spangramCoords: number[][];
}

export interface StrandsState {
  foundHints: string[];
  gameHistory: string;
  hintProgress: number;
  hintsUsed: number;
  revealedCells: number[][][];
  revealedHintCells: number[][];
  selectedCells: number[][];
  spangramRevealedCells: number[][];
}

export type typedArchiveResponse<Texpand = unknown> = ArchiveResponse<
  Crossword,
  Crossword,
  Crossword,
  ConnectionsGame,
  WordleGame,
  Texpand
>;

export type typedArchiveRecord = ArchiveRecord<Crossword, Crossword, Crossword, ConnectionsGame, WordleGame>;
