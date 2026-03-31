import localforage from "localforage";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "lucide-react";
import posthog from "posthog-js";
import { lazy, Suspense, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Button, Divider, Heading, HStack, Input, Text, Toggle, VStack } from "rsuite";

import Leaderboard from "@/Components/Leaderboard";
import { GlobalState } from "@/lib/GlobalState";
import { renderClue } from "@/lib/formatting";
import type { MiniCrossword, MiniCrosswordClue } from "@/lib/types";
import { CrosswordAppState } from "@/routes/crossword/state";
import { CrosswordProvider, type CrosswordContextValue } from "./CrosswordContext";
import IncorrectModal from "./IncorrectModal";
import PuzzleMenu from "./PuzzleMenu";
import VictoryModal from "./VictoryModal";
import { useBoardRenderer } from "../hooks/useBoardRenderer";
import { useInput } from "../hooks/useInput";
import { usePersistence } from "../hooks/usePersistence";

const Keyboard = lazy(async () => ({
  default: (await import("@/Components/VirtualKeyboard")).default
}));

interface CrosswordProps {
  data: MiniCrossword;
  startTouched: boolean;
  timeRef: React.RefObject<number[]>;
  stateDocId: RefObject<string>;
  alreadyCompleted: boolean;
}

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");

export default function Crossword({ data, startTouched, timeRef, stateDocId, alreadyCompleted }: CrosswordProps) {
  const body = data.body[0];

  const [selected, setSelected] = useState<number | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [boardState, setBoardState] = useState<{ [key: number]: string }>({});
  const [modalType, setModalType] = useState<"victory" | "incorrect" | "leaderboard" | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState<boolean>(startTouched);
  const [autoCheck, setAutoCheck] = useState(false);
  const [boardHeight, setBoardHeight] = useState(0);
  const [rebusMode, setRebusMode] = useState<boolean>(false);
  const [rebusText, setRebusText] = useState<string>("");

  const rebusRef = useRef<HTMLInputElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const incorrectShown = useRef<boolean>(false);
  const renderedClues = useMemo(() => {
    return body.clues.map((clue) => {
      return renderClue(clue);
    });
  }, [data]);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const { user } = useContext(GlobalState);
  const { paused, type, options, setModalState, complete, setComplete, setData } = useContext(CrosswordAppState);

  function exit(destination: string = "welcome") {
    setComplete(false);
    setData(null);
    setModalState(destination);
  }

  useLayoutEffect(() => {
    if (boardRef.current) {
      setBoardHeight(boardRef.current.offsetHeight);
    }
  }, [body.board]);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (boardRef.current) {
        setBoardHeight(boardRef.current.offsetHeight);
      }
    });
    // @ts-ignore
    ro.observe(boardRef.current);
    return () => ro.disconnect();
  }, []);

  function typeLetter(letter: string, cellIndex: number) {
    if (!boardRef.current) return;
    if (complete) return;
    const square = boardRef.current.querySelector(`g[data-index='${cellIndex}']`);
    if (!square) return;
    const guess = square.querySelector(".guess");
    if (!guess) return;
    if (autoCheck && "answer" in body.cells[cellIndex] && boardState[cellIndex] && checkCell(cellIndex)) {
      return;
    }
    setBoardState((prev) => {
      const newState = { ...prev };
      if (letter === "") {
        delete newState[cellIndex];
      } else {
        newState[cellIndex] = letter;
      }
      localforage.setItem(`state-${data.id}`, newState);
      return newState;
    });
  }

  function getCellsInDirection(start: number, dir: "across" | "down") {
    if (!body.cells[start].clues) return [start];
    const cells: number[] = [];
    body.cells[start].clues.forEach((clueIndex) => {
      const clue = body.clues[clueIndex];
      if (clue.direction.toLowerCase() === dir) {
        cells.push(...clue.cells);
      }
    });
    if (cells.length === 0) {
      return [start];
    }
    return cells;
  }

  function checkCell(cellIndex: number): boolean {
    const cell = body.cells[cellIndex];
    if (cell == null) return false;
    const state = boardState[cellIndex]?.toUpperCase();
    if (state == null) return false;
    if (cell.moreAnswers?.valid) {
      if (cell.moreAnswers.valid.includes(state.toUpperCase())) {
        return true;
      }
    }
    if (cell.answer && cell.answer.toUpperCase() === state) {
      return true;
    }
    return false;
  }

  const checkBoard = useCallback(() => {
    let totalCells = 0;
    let totalFilled = 0;
    let totalCorrect = 0;
    body.cells.forEach((cell, index) => {
      if (cell.answer) {
        totalCells++;
        if (boardState[index]) {
          totalFilled++;
        }
        if (checkCell(index)) {
          totalCorrect++;
        }
      }
    });
    return { totalCells, totalFilled, totalCorrect };
  }, [body.cells, boardState]);

  useEffect(() => {
    const selectedClue = document.querySelector(".selected-clue");
    if (selectedClue) {
      selectedClue.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selected, direction]);

  useEffect(() => {
    if (autoCheck) {
      localforage.setItem(`cheated-${data.id}`, true);
      posthog.capture("enabled_autocheck", { puzzle: data.id, puzzleDate: data.publicationDate, time: timeRef.current });
    }
    localforage.setItem(`autocheck-${data.id}`, autoCheck);
  }, [autoCheck]);

  function getFirstEmptyCell(clue: MiniCrosswordClue) {
    for (let i = 0; i < clue.cells.length; i++) {
      const cellIndex = clue.cells[i];
      if (!boardState[cellIndex]) {
        return cellIndex;
      }
    }
    return clue.cells[0];
  }

  function getRenderedClue(index: number): string {
    if (type === "custom") {
      return body.clues[index].text[0].plain;
    }
    if (renderedClues[index]) {
      return renderedClues[index];
    } else if (body.clues[index]) {
      return renderClue(body.clues[index]);
    }
    return "";
  }

  function getCurrentClueIndex(): number {
    if (selected === null) return 0;
    return body.clues.findIndex((clue) => clue.cells.includes(selected) && clue.direction.toLowerCase() === direction);
  }

  function isClueComplete(clueIndex: number): boolean {
    const clue = body.clues[clueIndex];
    let result = true;
    clue.cells.forEach((cellIndex) => {
      if (!boardState[cellIndex]) {
        result = false;
      }
    });
    return result;
  }

  function getNextClueIndex(previous: boolean = false): number | null {
    const currentClue = getCurrentClueIndex();
    if (currentClue === null) return null;
    let i = currentClue;
    let iterations = 0;
    while (iterations < body.clues.length) {
      let nextClueIndex = -1;
      if (previous) {
        nextClueIndex = (i - 1 + body.clues.length) % body.clues.length;
      } else {
        nextClueIndex = (i + 1) % body.clues.length;
      }
      const filled = isClueComplete(nextClueIndex);
      if (!filled) {
        return nextClueIndex;
      }
      if (previous) {
        i--;
      } else {
        i++;
      }
      iterations++;
    }
    return null;
  }

  function setActiveClue(clueIndex: number): void {
    const clue = body.clues[clueIndex];
    setSelected(getFirstEmptyCell(clue));
    setDirection(clue.direction.toLowerCase() === "across" ? "across" : "down");
  }

  function next() {
    if (selected === null) return;
    const currentClue = getCurrentClueIndex();
    if (currentClue === -1) return;
    const nextClueIndex = (currentClue + 1) % body.clues.length;
    if (nextClueIndex !== null) {
      setActiveClue(nextClueIndex);
    }
  }

  function previous(start: boolean = false) {
    if (selected === null) return;
    const currentClue = getCurrentClueIndex();
    if (currentClue === -1) return;
    const prevClue = body.clues[(currentClue - 1 + body.clues.length) % body.clues.length];
    if (prevClue) {
      if (start) {
        setSelected(getFirstEmptyCell(prevClue));
      } else {
        setSelected(prevClue.cells[prevClue.cells.length - 1]);
      }
      setDirection(prevClue.direction.toLowerCase() === "across" ? "across" : "down");
    }
  }

  function nextEditableClue(previous: boolean = false) {
    const currentClue = getCurrentClueIndex();
    if (currentClue === -1) return;
    const nextClueIndex = getNextClueIndex(previous);
    if (nextClueIndex !== null) {
      setActiveClue(nextClueIndex);
    } else {
      next();
    }
  }

  function arrowKey(key: string, dir: "across" | "down") {
    if (selected === null) return;
    if (direction !== dir) {
      setDirection(dir);
      return;
    }

    const highlightedCells = getCellsInDirection(selected, dir);
    const localIndex = highlightedCells.indexOf(selected);

    if (key === "ArrowRight" || key === "ArrowDown") {
      if (localIndex >= 0 && localIndex < highlightedCells.length - 1) {
        setSelected(highlightedCells[localIndex + 1]);
      }
    } else if (key === "ArrowLeft" || key === "ArrowUp") {
      if (localIndex > 0) {
        setSelected(highlightedCells[localIndex - 1]);
      }
    }
  }

  function nextCell() {
    if (selected === null) return;
    const highlightedCells = getCellsInDirection(selected, direction);
    const localIndex = highlightedCells.indexOf(selected);
    if (localIndex >= 0 && localIndex < highlightedCells.length - 1) {
      setSelected(highlightedCells[localIndex + 1]);
    } else if (localIndex === highlightedCells.length - 1) {
      // jump to the next editable clue if at the end of the current one
      nextEditableClue();
    }
  }

  useEffect(() => {
    Promise.all([
      localforage.getItem(`state-${data.id}`),
      localforage.getItem(`autocheck-${data.id}`),
      localforage.getItem(`selected-${data.id}`)
    ]).then(([savedState, savedAutoCheck, savedSelected]) => {
      let selectionRestored = false;
      if (savedState && typeof savedState === "object") {
        setBoardState(savedState as { [key: number]: string });
      }
      if (savedAutoCheck !== null && typeof savedAutoCheck === "boolean") {
        if (!options.includes("hardcore")) {
          setAutoCheck(savedAutoCheck);
        }
      }
      if (savedSelected && Array.isArray(savedSelected) && savedSelected.length === 2) {
        const [sel, dir] = savedSelected;
        if (typeof sel === "number" && (dir === "across" || dir === "down")) {
          setSelected(sel);
          setDirection(dir);
          selectionRestored = true;
        }
      }
      if (selected === null && !selectionRestored) {
        const firstCell = body.cells.findIndex((cell) => "answer" in cell);
        if (firstCell >= 0) {
          setSelected(firstCell);
        }
      }
    });
  }, []);

  useEffect(() => {
    localforage.setItem(`selected-${data.id}`, [selected, direction]);
  }, [selected, direction, data.id]);

  let globalSelectedClue: MiniCrosswordClue | null = null;

  if (selected !== null) {
    const activeClues = body.cells[selected].clues || [];
    const selectedClue = activeClues.findIndex((clueIndex) => body.clues[clueIndex].direction.toLowerCase() === direction);
    globalSelectedClue =
      body.clues[activeClues.find((clueIndex) => body.clues[clueIndex].direction.toLowerCase() === direction) || 0] || {};

    if (selectedClue === -1) {
      globalSelectedClue = {
        direction,
        cells: [selected],
        label: "",
        text: [
          {
            plain: "",
            formatted: ""
          }
        ]
      };
    }
  }

  const crosswordContextValue = useMemo<CrosswordContextValue>(
    () => ({
      body,
      data,
      user,
      stateDocId,
      boardRef,
      rebusRef,
      timeRef,
      incorrectShown,
      globalSelectedClue,
      selected,
      direction,
      boardState,
      modalType,
      paused,
      type,
      options,
      complete,
      keyboardOpen,
      autoCheck,
      rebusMode,
      rebusText,
      boardHeight,
      prefersReducedMotion,
      alreadyCompleted,
      letters,
      exit,
      setSelected,
      setDirection,
      setModalType,
      setComplete,
      setKeyboardOpen,
      setAutoCheck,
      setRebusMode,
      setRebusText,
      getCellsInDirection,
      checkCell,
      typeLetter,
      nextCell,
      previous,
      next,
      nextEditableClue,
      arrowKey,
      checkBoard
    }),
    [
      alreadyCompleted,
      autoCheck,
      boardState,
      body,
      checkBoard,
      complete,
      data,
      direction,
      globalSelectedClue,
      keyboardOpen,
      modalType,
      next,
      nextCell,
      nextEditableClue,
      options,
      paused,
      prefersReducedMotion,
      previous,
      rebusMode,
      rebusText,
      boardHeight,
      selected,
      setComplete,
      stateDocId,
      timeRef,
      type,
      user
    ]
  );

  return (
    <CrosswordProvider value={crosswordContextValue}>
      <CrosswordContent contextValue={crosswordContextValue} />
    </CrosswordProvider>
  );
}

function CrosswordContent({ contextValue }: { contextValue: CrosswordContextValue }) {
  const {
    data,
    stateDocId,
    body,
    boardHeight,
    boardRef,
    rebusRef,
    timeRef,
    globalSelectedClue,
    selected,
    direction,
    boardState,
    modalType,
    type,
    options,
    keyboardOpen,
    autoCheck,
    rebusMode,
    rebusText,
    letters,
    setSelected,
    setDirection,
    setModalType,
    setAutoCheck,
    setRebusText,
    nextEditableClue,
    exit
  } = contextValue;

  const { activateRebusMode, handleKeyDown } = useInput();
  useBoardRenderer();
  usePersistence();

  let activeClues: number[] = [];
  let selectedClue = -1;
  let relatedClues: number[] = [];

  function getFirstEmptyCell(clue: MiniCrosswordClue) {
    for (let i = 0; i < clue.cells.length; i++) {
      const cellIndex = clue.cells[i];
      if (!boardState[cellIndex]) {
        return cellIndex;
      }
    }
    return clue.cells[0];
  }

  function getRenderedClue(index: number): string {
    if (type === "custom") {
      return body.clues[index].text[0].plain;
    }
    return renderClue(body.clues[index]);
  }

  function getCurrentClueIndex(): number {
    if (selected === null) return 0;
    return body.clues.findIndex((clue) => clue.cells.includes(selected) && clue.direction.toLowerCase() === direction);
  }

  function isClueComplete(clueIndex: number): boolean {
    const clue = body.clues[clueIndex];
    let result = true;
    clue.cells.forEach((cellIndex) => {
      if (!boardState[cellIndex]) {
        result = false;
      }
    });
    return result;
  }

  if (selected !== null) {
    activeClues = body.cells[selected].clues || [];
    selectedClue = activeClues.findIndex((clueIndex) => body.clues[clueIndex].direction.toLowerCase() === direction);
    const selectedClueId = activeClues[selectedClue];
    if (selectedClueId && body.clues[selectedClueId].relatives) {
      relatedClues = body.clues[selectedClueId].relatives as number[];
    }
  }

  async function clearLocalPuzzleData(id = data.id): Promise<void> {
    await Promise.all([
      localforage.removeItem(`state-${id}`),
      localforage.removeItem(`time-${id}`),
      localforage.removeItem(`selected-${id}`),
      localforage.removeItem(`autocheck-${id}`),
      localforage.removeItem(`complete-${id}`),
      localforage.removeItem(`cheated-${id}`)
    ]);
    return;
  }

  return (
    <>
      {rebusMode && (
        <Input
          ref={rebusRef}
          value={rebusText}
          className="rebus"
          onChange={(e) => {
            const text = e
              .split("")
              .map((c) => {
                if (letters.includes(c)) {
                  return c.toUpperCase();
                } else {
                  return "";
                }
              })
              .join("")
              .slice(0, 10);
            setRebusText(text);
          }}
        ></Input>
      )}
      <HStack
        alignItems={"stretch"}
        spacing={0}
        className={`mini-container${!(keyboardOpen && selected !== null) ? "" : " keyboard-open"}`}
      >
        <VStack className="board-container">
          <div ref={boardRef} className={`board board-${type}`} dangerouslySetInnerHTML={{ __html: body.board }}></div>
          <HStack justifyContent={"center"} className="toggle-container">
            {!options.includes("hardcore") ? (
              <>
                <Toggle
                  checked={autoCheck}
                  name="autoCheck"
                  onChange={(e) => {
                    setAutoCheck(e);
                  }}
                />
                <label>Autocheck</label>
              </>
            ) : (
              <Text color={"orange.600"} weight="bold">
                <StarIcon strokeWidth={3} /> Hardcore Mode
              </Text>
            )}
            {type === "daily" && (
              <>
                <Divider vertical size={"md"} />
                <Button size="sm" onClick={activateRebusMode} disabled={rebusMode}>
                  Rebus
                </Button>
              </>
            )}
          </HStack>
        </VStack>

        <div className="clues" style={{ maxHeight: boardHeight - 5 }}>
          {body.clueLists.map((list, index) => {
            return (
              <div key={index}>
                <Heading level={4} style={{ textAlign: "left" }} className="clue-set">
                  {list.name}
                </Heading>
                <ol>
                  {list.clues.map((clueIndex) => {
                    const clue = body.clues[clueIndex];
                    if (!clue) return null;
                    return (
                      <li
                        key={clueIndex}
                        className={`clue ${activeClues.includes(clueIndex) ? "active-clue" : ""} ${activeClues[selectedClue] === clueIndex ? "selected-clue" : ""} ${relatedClues.includes(clueIndex) ? "related-clue" : ""} ${isClueComplete(clueIndex) ? "completed-clue" : ""}`}
                        onClick={() => {
                          const targetCell = getFirstEmptyCell(clue);
                          setSelected(targetCell);
                          setDirection(clue.direction.toLowerCase() === "across" ? "across" : "down");
                        }}
                      >
                        <span className="clue-label">{clue.label}</span>{" "}
                        <span className="clue-text" dangerouslySetInnerHTML={{ __html: getRenderedClue(clueIndex) }}></span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </div>
      </HStack>

      <VictoryModal
        open={modalType === "victory"}
        onClose={() => setModalType(null)}
        onOpenLeaderboard={() => {
          setModalType("leaderboard");
        }}
        onExit={() => {
          exit("welcome");
        }}
        type={type}
        data={data}
        timeRef={timeRef}
      />

      <Leaderboard
        open={modalType === "leaderboard"}
        setOpen={() => {
          setModalType("victory");
        }}
        puzzleData={data}
      />

      <IncorrectModal
        open={modalType === "incorrect"}
        onClose={() => {
          setModalType(null);
        }}
      />

      <div className="keyboard-container">
        <div className="bottom-icons">
          <PuzzleMenu
            data={data}
            clearLocalPuzzleData={clearLocalPuzzleData}
            stateDocId={stateDocId}
            setPuzzleModalState={setModalType}
            onExit={exit}
          />
        </div>
        {keyboardOpen && selected !== null && selectedClue != null ? (
          <>
            <div className="clue-bar">
              <div
                className="clue-bar-back"
                onClick={() => {
                  nextEditableClue(true);
                }}
              >
                <ChevronLeftIcon />
              </div>
              {globalSelectedClue !== null ? (
                <span className="clue-bar-text" dangerouslySetInnerHTML={{ __html: getRenderedClue(getCurrentClueIndex()) }}></span>
              ) : (
                ""
              )}
              <div
                className="clue-bar-forward"
                onClick={() => {
                  nextEditableClue();
                }}
              >
                <ChevronRightIcon />
              </div>
            </div>

            <Suspense fallback={null}>
              <Keyboard handleKeyDown={handleKeyDown} />
            </Suspense>
          </>
        ) : (
          ""
        )}
      </div>
    </>
  );
}
