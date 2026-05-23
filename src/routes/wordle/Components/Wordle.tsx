import type { WordleGame } from "@/lib/types";
import { useEffect, useState } from "react";
import { Center, HStack, Message, useToaster, VStack } from "rsuite";
import WordleTile from "./WordleTile";
import WordleKeyboard from "./WordleKeyboard";
import words from "../data/words.json";

import "@/css/Wordle.css";

export default function Wordle({ data }: { data: WordleGame }) {
  const [letters, setLetters] = useState(new Array(6).fill(0).map(() => new Array(5).fill("")));
  const [completeRows, setCompleteRows] = useState<number[]>([]);

  const toaster = useToaster();

  const ALLOWED_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

  const answer = data.solution.toLowerCase();
  const states = new Array(6).fill(0).map(() => new Array(5).fill(""));
  const currentRow = completeRows.length;
  const currentSpace = letters[currentRow].findIndex((x) => x === "") ?? -1;

  for (let i = 0; i < currentRow; i++) {
    let checkValue = answer;
    const row = letters[i];
    for (let j = 0; j < row.length; j++) {
      const letter = letters[i][j].toLowerCase();
      if (letter === "") {
        continue;
      }
      if (checkValue.indexOf(letter) === -1) {
        states[i][j] = "absent";
        continue;
      }
      if (letter === answer[j]) {
        states[i][j] = "correct";
        checkValue = checkValue.replace(letter, "*");
        continue;
      }
      if (answer.includes(letter)) {
        states[i][j] = "present";
        checkValue = checkValue.replace(letter, "*");
        continue;
      }
    }
  }

  function toast(message: string) {
    toaster.push(<Message>{message}</Message>, {
      placement: "topCenter",
      duration: 1500,
      container: document.documentElement
    });
  }

  function enter() {
    const word = letters[currentRow].join("").toLowerCase();
    if (word.length < 5) {
      toast("Not enough letters");
      return;
    }
    if (!words.includes(word)) {
      toast("Not in word list");
      return;
    }
    setCompleteRows([...completeRows, currentRow]);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    const key = event.key.toLowerCase();

    if (key === "enter" && !event.repeat) {
      enter();
    }

    if (key === "backspace") {
      const newLetters = [...letters];
      if (currentSpace > 0) {
        newLetters[currentRow][currentSpace - 1] = "";
      } else if (currentSpace === -1) {
        newLetters[currentRow][4] = "";
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
  }, [letters, completeRows]);

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

  return (
    <VStack height={"100%"} justifyContent={"center"} spacing={15}>
      <Center width={"100%"}>
        <VStack spacing={5}>
          {letters.map((word, row) => (
            <HStack spacing={5}>
              {word.map((letter, col) => (
                <WordleTile letter={letter} state={states[row][col]} />
              ))}
            </HStack>
          ))}
        </VStack>
      </Center>
      <Center width={"100%"}>
        <WordleKeyboard handleKeyDown={handleKeyDown} states={states} letters={letters} />
      </Center>
    </VStack>
  );
}
