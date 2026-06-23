import type { StrandsGame } from "@/lib/types";
import { createContext, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Container, HStack, VStack, Box, Loader } from "rsuite";
import "@/css/Strands.css";
import StrandsSidebar from "./StrandsSidebar";
import StrandsText from "./StrandsText";
import StrandsGrid from "./StrandsGrid";
import StrandsSVG from "./StrandsSVG";
import usePersistence from "../hooks/usePersistence";

import StrandsResults from "./StrandsResults";
import StrandsLeaderboard from "./StrandsLeaderboard";

interface StrandsProps {
  data: StrandsGame;
}

export interface StrandsContextType {
  data: StrandsGame;
  selectedCells: number[][];
  setSelectedCells: Dispatch<SetStateAction<number[][]>>;
  revealedCells: number[][][];
  setRevealedCells: Dispatch<SetStateAction<number[][][]>>;
  hintProgress: number;
  setHintProgress: Dispatch<SetStateAction<number>>;
  foundHints: string[];
  setFoundHints: Dispatch<SetStateAction<string[]>>;
  revealedHintCells: number[][];
  setRevealedHintCells: Dispatch<SetStateAction<number[][]>>;
  spangramRevealedCells: number[][];
  setSpangramRevealedCells: Dispatch<SetStateAction<number[][]>>;
  hintsUsed: number;
  setHintsUsed: Dispatch<SetStateAction<number>>;
  constructedWord: string;
  setConstructedWord: Dispatch<SetStateAction<string>>;
  gameHistory: string;
  setGameHistory: Dispatch<SetStateAction<string>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export const StrandsContext = createContext<StrandsContextType | undefined>(undefined);

export default function Strands({ data }: StrandsProps) {
  const [loading, setLoading] = useState(true);
  const [selectedCells, setSelectedCells] = useState<number[][]>([]);
  const [revealedCells, setRevealedCells] = useState<number[][][]>([]);
  const [spangramRevealedCells, setSpangramRevealedCells] = useState<number[][]>([]);
  const [hintProgress, setHintProgress] = useState<number>(0);
  const [foundHints, setFoundHints] = useState<string[]>([]);
  const [revealedHintCells, setRevealedHintCells] = useState<number[][]>([]);
  const [constructedWord, setConstructedWord] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameHistory, setGameHistory] = useState("");
  const [lastInputType, setLastInputType] = useState<"click" | "drag">("click");

  const [modalState, setModalState] = useState<"results" | "leaderboard" | null>(null);

  const constructedText = useRef<HTMLParagraphElement | null>(null);

  const isComplete = revealedCells.length + (spangramRevealedCells.length > 0 ? 1 : 0) === data.themeWords.length + 1;

  const context: StrandsContextType = {
    data,
    selectedCells,
    setSelectedCells,
    revealedCells,
    setRevealedCells,
    hintProgress,
    setHintProgress,
    foundHints,
    setFoundHints,
    revealedHintCells,
    setRevealedHintCells,
    spangramRevealedCells,
    setSpangramRevealedCells,
    hintsUsed,
    setHintsUsed,
    constructedWord,
    setConstructedWord,
    gameHistory,
    setGameHistory,
    loading,
    setLoading
  };

  usePersistence(context);

  if (loading) {
    return <Loader center />;
  }

  function updateSelectedCells(newCells: number[][]) {
    if (constructedText.current) {
      constructedText.current.style.color = "black";
    }
    setSelectedCells(newCells);
    setConstructedWord(newCells.map(([row, col]) => data.startingBoard[row][col]).join(""));
  }

  function handleInteractCell(cellX: number, cellY: number, isClick = true) {
    setLastInputType(isClick ? "click" : "drag");

    if (selectedCells.length === 0) {
      updateSelectedCells([[cellY, cellX]]);
      return;
    }

    if (selectedCells.length > 19) {
      setSelectedCells([]);
      setConstructedWord("Too long");
      return;
    }

    if (selectedCells.length === 1 && selectedCells[0][0] === cellY && selectedCells[0][1] === cellX) {
      setSelectedCells([]);
      setConstructedWord("Already found");
      return;
    }

    if (isClick && selectedCells[selectedCells.length - 1][0] === cellY && selectedCells[selectedCells.length - 1][1] === cellX) {
      handleSubmitWord();
      return;
    }

    const lastCell = selectedCells[selectedCells.length - 1];
    const [lastY, lastX] = lastCell;
    const isAdjacent = Math.abs(lastY - cellY) <= 1 && Math.abs(lastX - cellX) <= 1 && !(lastY === cellY && lastX === cellX);

    const alreadyIndex = selectedCells.findIndex(([row, col]) => row === cellY && col === cellX);
    const isAlreadySelected = alreadyIndex !== -1;

    if (isAlreadySelected) {
      updateSelectedCells(selectedCells.slice(0, alreadyIndex + 1));
    } else if (isAdjacent) {
      updateSelectedCells([...selectedCells, [cellY, cellX]]);
    } else if (isClick) {
      updateSelectedCells([[cellY, cellX]]);
    }
  }

  function handleSubmitWord() {
    let cells = selectedCells;
    setSelectedCells([]);

    const word = constructedWord;

    const removeHint = () =>
      setRevealedHintCells(revealedHintCells.filter(([row, col]) => !cells.some(([r, c]) => r === row && c === col)));

    const shakeText = () => {
      constructedText.current?.classList.add("shake");
      setTimeout(() => {
        constructedText.current?.classList.remove("shake");
      }, 800);
    };

    if (revealedCells.some((cellGroup) => cellGroup.map(([row, col]) => data.startingBoard[row][col]).join("") === word)) {
      shakeText();
      return;
    }

    if (spangramRevealedCells.length > 0 && spangramRevealedCells.map(([row, col]) => data.startingBoard[row][col]).join("") === word) {
      shakeText();
      return;
    }

    if (Object.prototype.hasOwnProperty.call(data.themeCoords, word)) {
      removeHint();
      setRevealedCells([...revealedCells, [...cells]]);
      if (constructedText.current) {
        constructedText.current.style.color = "var(--clue-bg)";
      }
      setGameHistory(gameHistory + "🔵");
      return;
    }

    if (data.spangram === word) {
      removeHint();
      setSpangramRevealedCells(cells);
      setConstructedWord("SPANGRAM!");
      if (constructedText.current) {
        constructedText.current.style.color = "var(--spangram-bg)";
      }
      setGameHistory(gameHistory + "🟡");
      return;
    }

    if (data.solutions.includes(word)) {
      if (foundHints.includes(word)) {
        shakeText();
        setTimeout(() => {
          setConstructedWord("Already found");
        }, 1000);
        return;
      }
      setFoundHints([...foundHints, word]);
      if (constructedText.current) {
        constructedText.current.style.color = "var(--hint-bg)";
      }
      setHintProgress(hintProgress + 1);
      return;
    }

    shakeText();
    setTimeout(() => {
      if (constructedWord.length > 3) {
        setConstructedWord("Not in word list");
      } else {
        setConstructedWord("Too short");
      }
    }, 1000);
  }

  function handleRequestHint() {
    if (hintProgress < 3) return;

    setHintProgress(hintProgress - 3);
    setHintsUsed(hintsUsed + 1);
    setGameHistory(gameHistory + "💡");

    const notFoundWords = data.themeWords.filter(
      (word) => !revealedCells.some((cellGroup) => cellGroup.map(([row, col]) => data.startingBoard[row][col]).join("") === word)
    );

    if (notFoundWords.length === 0) return;

    const randomWord = notFoundWords[Math.floor(Math.random() * notFoundWords.length)];
    const coords = data.themeCoords[randomWord];
    setRevealedHintCells([...coords]);
  }

  const foundCount = revealedCells.length + (spangramRevealedCells.length > 0 ? 1 : 0);
  const totalCount = data.themeWords.length + 1;

  return (
    <StrandsContext.Provider value={context}>
      <Container>
        <HStack spacing={24} width={"100%"} className="strands-container">
          <StrandsSidebar
            clue={data.clue}
            hintProgress={hintProgress}
            onRequestHint={handleRequestHint}
            foundCount={foundCount}
            totalCount={totalCount}
            setModal={setModalState}
            isComplete={isComplete}
          />
          <VStack spacing={16}>
            <StrandsText constructedWord={constructedWord} textRef={constructedText} />
            <Box w={324} h={422} position={"relative"}>
              <StrandsSVG
                selectedCells={selectedCells}
                revealedCells={revealedCells}
                spangramCells={spangramRevealedCells}
                rows={data.startingBoard.length}
                cols={data.startingBoard[0].length}
              />
              <StrandsGrid
                board={data.startingBoard}
                selectedCells={selectedCells}
                revealedCells={revealedCells}
                spangramCells={spangramRevealedCells}
                hintCells={revealedHintCells}
                lastInputType={lastInputType}
                onInteractCell={handleInteractCell}
                onSubmitWord={handleSubmitWord}
              />
            </Box>
          </VStack>
        </HStack>
      </Container>
      <StrandsResults
        open={modalState === "results"}
        onClose={() => setModalState(null)}
        onOpenLeaderboard={() => setModalState("leaderboard")}
        data={data}
        resultText={hintsUsed === 0 ? "Perfect!" : hintsUsed === 1 ? "Great!" : "Well Done!"}
      />
      <StrandsLeaderboard setOpen={() => setModalState("results")} open={modalState === "leaderboard"} puzzleData={data} />
    </StrandsContext.Provider>
  );
}
