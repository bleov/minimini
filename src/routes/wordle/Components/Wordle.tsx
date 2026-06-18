import type { WordleGame } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { Center, HStack, Loader, Message, useToaster, VStack } from "rsuite";
import WordleTile from "./WordleTile";
import WordleKeyboard from "./WordleKeyboard";
import words from "../data/words.json";

import "@/css/Wordle.css";
import usePersistence from "../hooks/usePersistence";
import WordleResults from "./WordleResults";
import WordleLeaderboard from "./WordleLeaderboard";

export const DEFAULT_ROWS = 6;
export const DEFAULT_COLUMNS = 5;

export default function Wordle({ data }: { data: WordleGame }) {
  const ALLOWED_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
  const END_MESSAGES = ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew"];

  const rows = data.guesses ?? DEFAULT_ROWS;
  const columns = data.solution.length;

  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState(new Array(rows).fill(0).map(() => new Array(columns).fill("")));
  const [completeRows, setCompleteRows] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const [checking, setChecking] = useState(false);
  const [modalState, setModalState] = useState<"results" | "leaderboard" | null>(null);
  const toaster = useToaster();
  const wordList = useRef<string[]>(words);

  const answer = data.solution.toLowerCase();
  const states = new Array(rows).fill(0).map(() => new Array(columns).fill(""));
  const currentRow = completeRows.length;
  const currentSpace = letters[currentRow]?.findIndex((x) => x === "") ?? -1;
  let resultText = "???";
  if (complete && !checking) {
    if (completeRows.length === rows && letters[letters.length - 1].join("").toLowerCase() !== answer) {
      resultText = answer.toUpperCase();
    } else {
      if (rows !== DEFAULT_ROWS) {
        if (completeRows.length === rows) {
          resultText = "Phew!";
        } else if (completeRows.length === 1) {
          resultText = "Genius!";
        } else {
          resultText = "Magnificent";
        }
      } else {
        resultText = END_MESSAGES[completeRows.length - 1];
      }
    }
  }

  if (currentRow === rows && currentSpace === -1 && !complete && !checking) {
    setComplete(true);
  }

  for (let i = 0; i < currentRow; i++) {
    let checkValue = answer;
    const row = letters[i];
    let allCorrect = true;

    for (let j = 0; j < row.length; j++) {
      const letter = row[j].toLowerCase();

      if (letter === answer[j]) {
        states[i][j] = "correct";
        checkValue = checkValue.substring(0, j) + "*" + checkValue.substring(1 + j);
      }
    }

    for (let j = 0; j < row.length; j++) {
      if (states[i][j] !== "") continue;
      allCorrect = false;
      const letter = letters[i][j].toLowerCase();

      if (checkValue.includes(letter)) {
        states[i][j] = "present";
        checkValue = checkValue.substring(0, j) + "*" + checkValue.substring(1 + j);
      } else {
        states[i][j] = "absent";
      }
    }

    if (allCorrect && !complete) {
      setComplete(true);
    }
  }

  function toast(message: string, duration: number = 1500) {
    toaster.push(<Message>{message}</Message>, {
      placement: "topCenter",
      duration,
      container: document.documentElement
    });
  }

  function enter() {
    if (complete) return;
    if (checking) return;
    const word = letters[currentRow].join("").toLowerCase();
    if (word.length < columns) {
      toast("Not enough letters");
      return;
    }
    if (word.length > 1 && !wordList.current.includes(word)) {
      toast("Not in word list");
      return;
    }
    setChecking(true);
    setCompleteRows([...completeRows, currentRow]);
    setTimeout(() => {
      setChecking(false);
    }, 350 * columns);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    const key = event.key.toLowerCase();

    if (complete) return;
    if (checking) return;
    if (key === "enter" && !event.repeat) {
      enter();
    }

    if (key === "backspace") {
      const newLetters = letters.map((row) => [...row]);
      if (currentSpace > 0) {
        newLetters[currentRow][currentSpace - 1] = "";
      } else if (currentSpace === -1) {
        newLetters[currentRow][columns - 1] = "";
      }
      setLetters(newLetters);
      return;
    }

    if (ALLOWED_LETTERS.includes(key) && !event.repeat) {
      const newLetters = [...letters];
      newLetters[currentRow][currentSpace] = key.toUpperCase();
      setLetters(newLetters);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [letters, completeRows, complete, checking]);

  useEffect(() => {
    if (resultText !== "???") {
      toast(resultText, 5000);
    }
  }, [complete, checking]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      // @ts-ignore
      window.wordle = {
        data,
        letters,
        states,
        completeRows
      };
    }
  });

  useEffect(() => {
    const letters = data.solution.length;
    if (letters === 5) {
      return;
    }
    if (letters === 1) {
      wordList.current = [];
    }
    if (letters > 1 && letters <= 12) {
      (async () => {
        const newWords = await import(`../data/${letters}-letter.json`);
        if (!newWords.default.includes(data.solution)) {
          newWords.default.push(data.solution.toLowerCase());
        }
        wordList.current = newWords.default;
      })();
    }
  }, [data]);

  usePersistence(letters, setLetters, completeRows, setCompleteRows, complete, data, setLoading);

  if (loading) {
    return <Loader center />;
  }

  return (
    <>
      <VStack height={"100%"} minHeight={"100vh"} justifyContent={"center"} spacing={15}>
        <Center width={"100%"}>
          <VStack spacing={5}>
            {letters.map((word, row) => (
              <HStack key={row} spacing={5}>
                {word.map((letter, col) => (
                  <WordleTile
                    key={`${row}-${col}`}
                    letter={letter}
                    state={states[row][col]}
                    checking={checking && row === currentRow - 1}
                    col={col}
                  />
                ))}
              </HStack>
            ))}
          </VStack>
        </Center>
        <Center width={"100%"}>
          <WordleKeyboard
            handleKeyDown={handleKeyDown}
            states={states}
            letters={letters}
            complete={complete && !checking}
            setModalState={setModalState}
          />
        </Center>
      </VStack>
      <WordleResults
        open={modalState === "results"}
        onClose={() => {
          setModalState(null);
        }}
        onOpenLeaderboard={() => {
          setModalState("leaderboard");
        }}
        data={data}
        resultText={resultText}
      />
      <WordleLeaderboard
        open={modalState === "leaderboard"}
        setOpen={() => {
          setModalState("results");
        }}
        puzzleData={data}
      />
    </>
  );
}
