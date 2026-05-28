import type { WordleGame } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { Center, HStack, Message, useToaster, VStack } from "rsuite";
import WordleTile from "./WordleTile";
import WordleKeyboard from "./WordleKeyboard";
import words from "../data/words.json";

import "@/css/Wordle.css";

export default function Wordle({ data }: { data: WordleGame }) {
  const [letters, setLetters] = useState(new Array(6).fill(0).map(() => new Array(5).fill("")));
  const [completeRows, setCompleteRows] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const [checking, setChecking] = useState(false);

  const toaster = useToaster();

  const ALLOWED_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
  const END_MESSAGES = ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew"];

  const answer = data.solution.toLowerCase();
  const states = new Array(6).fill(0).map(() => new Array(5).fill(""));
  const currentRow = completeRows.length;
  const currentSpace = letters[currentRow]?.findIndex((x) => x === "") ?? -1;

  if (currentRow === 6 && currentSpace === -1 && !complete && !checking) {
    setComplete(true);
  }

  for (let i = 0; i < currentRow; i++) {
    let checkValue = answer;
    const row = letters[i];
    let allCorrect = true;
    for (let j = 0; j < row.length; j++) {
      const letter = letters[i][j].toLowerCase();
      if (letter === "") {
        continue;
      }
      if (checkValue.indexOf(letter) === -1) {
        states[i][j] = "absent";
        allCorrect = false;
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
        allCorrect = false;
        continue;
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
    if (word.length < 5) {
      toast("Not enough letters");
      return;
    }
    if (!words.includes(word)) {
      toast("Not in word list");
      return;
    }
    setChecking(true);
    setCompleteRows([...completeRows, currentRow]);
    setTimeout(() => {
      setChecking(false);
    }, 350 * 5);
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
  }, [letters, completeRows, complete, checking]);

  useEffect(() => {
    if (complete && !checking) {
      if (completeRows.length === 6 && letters[letters.length - 1].join("").toLowerCase() !== answer) {
        toast(answer.toUpperCase(), 5000);
      } else {
        toast(END_MESSAGES[completeRows.length - 1], 5000);
      }
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

  return (
    <VStack height={"100%"} justifyContent={"center"} spacing={15}>
      <Center width={"100%"}>
        <VStack spacing={5}>
          {letters.map((word, row) => (
            <HStack spacing={5}>
              {word.map((letter, col) => (
                <WordleTile letter={letter} state={states[row][col]} checking={checking && row === currentRow - 1} col={col} />
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
