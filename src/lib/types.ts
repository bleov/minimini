export interface MiniCrossword {
  assets?: MiniCrosswordAsset[];
  body: MiniCrosswordBody[];
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

export interface MiniCrosswordBody {
  board: string;
  cells: MiniCrosswordCell[];
  clueLists: MiniCrosswordClueList[];
  clues: MiniCrosswordClue[];
  dimensions: MiniCrosswordDimensions;
  SVG?: {};
}

export interface MiniCrosswordCell {
  answer?: string;
  clues?: number[];
  label?: string;
  type?: number;
  moreAnswers?: { valid: string[] };
}

export interface MiniCrosswordClueList {
  clues: number[];
  name: string;
}

export interface MiniCrosswordClue {
  cells: number[];
  direction: string;
  label: string;
  list?: number;
  text: MiniCrosswordClueText[];
  relatives?: number[];
}

export interface MiniCrosswordClueText {
  formatted?: string;
  plain: string;
}

export interface MiniCrosswordDimensions {
  height: number;
  width: number;
}

export interface MiniCrosswordAsset {
  uri: string;
}

export interface BaseRecord {
  collectionId: string;
  collectionName: string;
  created: string;
  id: string;
  updated: string;
}

export interface ArchiveRecord extends BaseRecord {
  mini: MiniCrossword;
  daily: MiniCrossword;
  publication_date: string;
  mini_id: number;
  daily_id: number;
  midi: MiniCrossword;
  midi_id: number;
}

export interface BasicArchiveRecord {
  publication_date: string;
  mini_id: number;
  daily_id: number;
  midi_id: number;
  connections_id: number;
  id: string;
}

export interface ArchiveStateRecord extends BaseRecord {
  puzzle_id: number;
  complete: boolean;
  cheated: boolean;
  time: number;
}

export interface StateRecord extends ArchiveStateRecord {
  id: string;
  user: string;
  board_state: Record<string, string>;
  autocheck: boolean;
  selected: [number, string];
}

export interface LeaderboardRecord extends StateRecord {
  rank: number;
  expand: {
    user: {
      id: string;
      username: string;
    };
  };
}

export interface UserRecord extends BaseRecord {
  username: string;
  friends: string[];
  friend_code: string;
  avatar?: string;
}

export interface CrosswordShape extends BaseRecord {
  sort_order: number;
  type: string;
  data: MiniCrossword;
}

export interface CustomPuzzle extends BaseRecord {
  author: string;
  title: string;
  puzzle: MiniCrossword | null;
  public: boolean;
  type: string;
  shape: string | null;
  expand?: {
    author: UserRecord;
    shape: CrosswordShape;
  };
}

export interface CustomPuzzleData extends CustomPuzzle {
  author_name: string;
  avg_rating: number;
  completions: number;
}

export interface ConnectionsCard {
  content: string;
  position: number;
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

export interface ConnectionsLeaderboardRecord extends BaseRecord {
  puzzle_id: number;
  puzzle_date: string;
  mistakes: number;
  order: number[];
  guesses: number[][];
  expand: {
    user: UserRecord;
  };
}

export interface WordleGame {
  id: number;
  solution: string;
  print_date: string;
  days_since_launch: number;
  editor: string;
}
