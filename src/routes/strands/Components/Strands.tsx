import type { StrandsGame } from "@/lib/types";
import { createContext, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Box, Button, Col, Container, Grid, HStack, Loader, Row, Text, VStack } from "rsuite";

import "@/css/Strands.css";
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

  const isComplete = revealedCells.length + (spangramRevealedCells.length > 0 ? 1 : 0) === data.themeWords.length + 1;

  const constructedText = useRef<HTMLParagraphElement | null>(null);

  const [lastInputType, setLastInputType] = useState<"click" | "drag">("click");

  const context: StrandsContextType = {
    data,
    selectedCells,
    setSelectedCells,
    revealedCells,
    setRevealedCells,
    spangramRevealedCells,
    setSpangramRevealedCells,
    hintProgress,
    setHintProgress,
    foundHints,
    setFoundHints,
    revealedHintCells,
    setRevealedHintCells,
    constructedWord,
    setConstructedWord,
    hintsUsed,
    setHintsUsed,
    loading,
    setLoading
  };

  function handleInteractCell(cellX: number, cellY: number, isClick = true) {
    setLastInputType(isClick ? "click" : "drag");

    const updateCells = (newCells: number[][]) => {
      constructedText.current!.style.color = "black";
      setSelectedCells(newCells);
      setConstructedWord(newCells.map(([row, col]) => data.startingBoard[row][col]).join(""));
    };

    // if no cells are selected, add that one to the selected
    // else if the cell is already selected, if the new cell is not adjacent, clear the selection
    // else if its also already selected, if the new cell is adjacent then add it to the selection
    // if selecting an already selected cell, remove all cells after it in the chain
    // if only one cell is selected and its the same as the new cell, clear the selection
    // if is a click and is the same as the last cell, submit word

    if (selectedCells.length === 0) {
      updateCells([[cellY, cellX]]);
      return;
    }

    if (selectedCells.length > 19) {
      updateCells([]);
      setConstructedWord("Too long");
      return;
    }

    if (selectedCells.length === 1 && selectedCells[0][0] === cellY && selectedCells[0][1] === cellX) {
      updateCells([]);
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
    const alreadyIsInSelection = selectedCells.findIndex(([row, col]) => row === cellY && col === cellX);
    const isAlreadySelected = alreadyIsInSelection !== -1;

    if (isAlreadySelected) {
      updateCells(selectedCells.slice(0, alreadyIsInSelection + 1));
    } else if (isAdjacent) {
      updateCells([...selectedCells, [cellY, cellX]]);
    } else if (isClick) {
      updateCells([[cellY, cellX]]);
    }
  }

  function handleSubmitWord() {
    console.log("submitting");
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
    //check for dupes
    if (revealedCells.some((cellGroup) => cellGroup.map(([row, col]) => data.startingBoard[row][col]).join("") === word)) {
      console.log("Already found word:", word);
      shakeText();
      return;
    }

    if (spangramRevealedCells.length > 0 && spangramRevealedCells.map(([row, col]) => data.startingBoard[row][col]).join("") === word) {
      console.log("Already found spangram");
      shakeText();
      return;
    }

    if (data.themeCoords.hasOwnProperty(word)) {
      console.log("Found word:", word);

      removeHint();
      setRevealedCells([...revealedCells, [...cells]]);
      constructedText.current!.style.color = "var(--clue-bg)";

      return;
    }

    if (data.spangram === word) {
      console.log("spangrammmm!!!!~~~~ :3");

      removeHint();
      setSpangramRevealedCells(cells);
      setConstructedWord("SPANGRAM!");
      constructedText.current!.style.color = "var(--spangram-bg)";

      return;
    }

    if (data.solutions.includes(word)) {
      console.log("Found solution:", word);
      if (foundHints.includes(word)) {
        shakeText();
        setTimeout(() => {
          setConstructedWord("Already found");
        }, 1000);
        return;
      }

      setFoundHints([...foundHints, word]);
      constructedText.current!.style.color = "var(--hint-bg)";
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
    if (hintProgress < 3) {
      return;
    }

    setHintProgress(hintProgress - 3);

    const notFoundWords = data.themeWords.filter(
      (word) => !revealedCells.some((cellGroup) => cellGroup.map(([row, col]) => data.startingBoard[row][col]).join("") === word)
    );

    if (notFoundWords.length === 0) {
      return;
    }

    const randomWord = notFoundWords[Math.floor(Math.random() * notFoundWords.length)];
    const coords = data.themeCoords[randomWord];

    setRevealedHintCells([...coords]);
  }

  const selectedPath = selectedCells.map(([row, col], i) => {
    const x = (col + 0.5) * (313 / data.startingBoard[0].length);
    const y = (row + 0.5) * (422 / data.startingBoard.length);

    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  });

  const spangramSelectedPath = spangramRevealedCells.map(([row, col], i) => {
    const x = (col + 0.5) * (313 / data.startingBoard[0].length);
    const y = (row + 0.5) * (422 / data.startingBoard.length);

    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  });

  return (
    <StrandsContext.Provider value={context}>
      <Container>
        <HStack spacing={24} width={"100%"} className="strands-container">
          <VStack spacing={16} alignItems={"center"}>
            <Box className="clue-box">
              <VStack spacing={0}>
                <Box width={"100%"} className="clue-title">
                  Today's Theme
                  {/* Theme from {data.printDate} */}
                </Box>
                <Box width={"100%"} className="clue-hint">
                  {data.clue}
                </Box>
              </VStack>
            </Box>
            <Text size="xl">
              <span style={{ fontWeight: "bold" }}>{revealedCells.length + (spangramRevealedCells.length > 0 ? 1 : 0)}</span> of{" "}
              <span style={{ fontWeight: "bold" }}>
                {/* length plus the spangram */}
                {data.themeWords.length + 1}
              </span>{" "}
              theme words found.
            </Text>
            <Button className="hint-button" onClick={handleRequestHint}>
              <Box className="hint-button-bg" width={`${(hintProgress / 3) * 100}%`}></Box>
              <Text className="hint-button-text">Hint</Text>
              <Text>Hint</Text>
            </Button>
          </VStack>
          <VStack>
            <Text size="xl" weight="bold" className="constructed-word" ref={constructedText}>
              {constructedWord}
            </Text>
            <Box w={324} h={422} position={"relative"}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 324 422"
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none"
                }}
              >
                {revealedCells.map((cellGroup, i) => {
                  const path = cellGroup
                    .map(([row, col], i) => {
                      // 313 is some magic number, should find a way to calc it or smth
                      const x = (col + 0.5) * (313 / data.startingBoard[0].length);
                      const y = (row + 0.5) * (422 / data.startingBoard.length);

                      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(" ");

                  return <path key={i} d={path} stroke="var(--clue-bg)" fill="none" strokeWidth={12} strokeLinecap="round"></path>;
                })}
                <path d={selectedPath.join(" ")} stroke="var(--guess-bg)" fill="none" strokeWidth={12} strokeLinecap="round"></path>
                <path
                  d={spangramSelectedPath.join(" ")}
                  stroke="var(--spangram-bg)"
                  fill="none"
                  strokeWidth={12}
                  strokeLinecap="round"
                ></path>
              </svg>
              <Box position={"absolute"} inset={0}>
                <Grid
                  fluid
                  h={"100%"}
                  justify={"space-between"}
                  onMouseUp={() => {
                    if (lastInputType === "drag") {
                      handleSubmitWord();
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (lastInputType === "drag" && e.buttons === 1) {
                      handleSubmitWord();
                    }
                  }}
                >
                  {data.startingBoard.map((row, rowIndex) => {
                    return (
                      <Row height={"calc(100% / " + data.startingBoard.length + ")"} key={rowIndex} className="strands-row" w={"100%"}>
                        {row.split("").map((cell, cellIndex) => {
                          return (
                            <Col span={4} key={cellIndex} className="strands-cell">
                              <button
                                key={
                                  spangramRevealedCells.some(([r, c]) => r === rowIndex && c === cellIndex)
                                    ? `spangram-${rowIndex}-${cellIndex}`
                                    : selectedCells.some(([r, c]) => r === rowIndex && c === cellIndex)
                                      ? `selected-${rowIndex}-${cellIndex}`
                                      : `normal-${rowIndex}-${cellIndex}`
                                }
                                onMouseDown={() => handleInteractCell(cellIndex, rowIndex)}
                                onMouseEnter={(e) => {
                                  if (e.buttons === 1) {
                                    handleInteractCell(cellIndex, rowIndex, false);
                                  }
                                }}
                                style={{
                                  backgroundColor: selectedCells.some(([r, c]) => r === rowIndex && c === cellIndex)
                                    ? "var(--guess-bg)"
                                    : revealedCells.flat(1).some(([r, c]) => r === rowIndex && c === cellIndex)
                                      ? "var(--clue-bg)"
                                      : spangramRevealedCells.some(([r, c]) => r === rowIndex && c === cellIndex)
                                        ? "var(--spangram-bg)"
                                        : "transparent",
                                  outline: revealedHintCells.some(([r, c]) => r === rowIndex && c === cellIndex)
                                    ? "2px dashed var(--clue-bg)"
                                    : "none",
                                  animationDelay: `${
                                    spangramRevealedCells.some(([r, c]) => r === rowIndex && c === cellIndex)
                                      ? (spangramRevealedCells.findIndex(([r, c]) => r === rowIndex && c === cellIndex) + 1) * 50
                                      : 0
                                  }ms`
                                }}
                                className={`${
                                  selectedCells.some(([r, c]) => r === rowIndex && c === cellIndex)
                                    ? "scale"
                                    : spangramRevealedCells.some(([r, c]) => r === rowIndex && c === cellIndex)
                                      ? "scale-found"
                                      : revealedCells.flat(1).some(([r, c]) => r === rowIndex && c === cellIndex)
                                        ? "scale-clue"
                                        : ""
                                }`}
                              >
                                <Text size="xl">{cell}</Text>
                              </button>
                            </Col>
                          );
                        })}
                      </Row>
                    );
                  })}
                </Grid>
              </Box>
            </Box>
          </VStack>
        </HStack>
      </Container>
    </StrandsContext.Provider>
  );
}
