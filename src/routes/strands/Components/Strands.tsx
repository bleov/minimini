import type { StrandsGame } from "@/lib/types";
import { createContext, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Box, Button, Col, Container, Grid, HStack, Loader, Row, Text, VStack } from "rsuite";

import "@/css/Strands.css";
import { set } from "rsuite/esm/internals/utils/date";

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
  const [revealedHintCells, setRevealedHintCells] = useState<number[][]>([]);
  const [constructedWord, setConstructedWord] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);

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
    revealedHintCells,
    setRevealedHintCells,
    constructedWord,
    setConstructedWord,
    hintsUsed,
    setHintsUsed,
    loading,
    setLoading
  };

  useEffect(() => {
    setConstructedWord(selectedCells.map(([row, col]) => data.startingBoard[row][col]).join(""));
  }, [selectedCells]);

  function handleInteractCell(cellX: number, cellY: number, isClick = true) {
    setLastInputType(isClick ? "click" : "drag");
    // if no cells are selected, add that one to the selected
    // else if the cell is already selected, if the new cell is not adjacent, clear the selection
    // else if its also already selected, if the new cell is adjacent then add it to the selection
    // if selecting an already selected cell, remove all cells after it in the chain
    // if only one cell is selected and its the same as the new cell, clear the selection
    // if is a click and is the same as the last cell, submit word

    if (selectedCells.length === 0) {
      setSelectedCells([[cellY, cellX]]);
      return;
    }

    if (selectedCells.length > 19) {
      setSelectedCells([]);
      setConstructedWord("Too long");
      return;
    }

    if (selectedCells.length === 1 && selectedCells[0][0] === cellY && selectedCells[0][1] === cellX) {
      setSelectedCells([]);
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
      setSelectedCells(selectedCells.slice(0, alreadyIsInSelection + 1));
    } else if (isAdjacent) {
      setSelectedCells([...selectedCells, [cellY, cellX]]);
    } else if (isClick) {
      setSelectedCells([[cellY, cellX]]);
    }
  }

  function handleSubmitWord() {
    let cells = selectedCells;
    setSelectedCells([]);

    const word = constructedWord;

    if (data.themeCoords.hasOwnProperty(word)) {
      console.log("Found word:", word);
      const coords = data.themeCoords[word];

      setRevealedCells([...revealedCells, [...cells]]);
    }

    if (data.spangram === word) {
      console.log("Found spangram!");
      setSpangramRevealedCells(cells);
    }
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
          </VStack>
          <VStack>
            <Text size="xl" weight="bold" w={"100%"} h={"1lh"} textAlign={"center"}>
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
                                        : "transparent"
                                }}
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
