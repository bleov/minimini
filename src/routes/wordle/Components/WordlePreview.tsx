import type { WordleState } from "@/lib/types";
import { useMemo, useState } from "react";
import { Box, Center, HStack, Text, VStack } from "rsuite";

interface WordlePreviewProps {
  state: WordleState;
  rows: number;
  columns: number;
  solution: string;
}

export default function WordlePreview({ state, rows, columns, solution }: WordlePreviewProps) {
  function getStates(letters: string[][]): string[][] {
    const states = new Array(rows).fill(0).map(() => new Array(columns).fill(""));
    let wasAllCorrect = false;

    state.letters.forEach((row, i) => {
      if (wasAllCorrect) {
        // stop at any extra rows
        return;
      }

      let checkValue = solution;
      let allCorrect = true;

      for (let j = 0; j < row.length; j++) {
        const letter = row[j].toLowerCase();

        if (letter === solution[j]) {
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
          checkValue = checkValue.substring(0, checkValue.indexOf(letter)) + "*" + checkValue.substring(1 + checkValue.indexOf(letter));
        } else {
          states[i][j] = "absent";
        }
      }

      if (allCorrect) {
        wasAllCorrect = true;
      }
    });

    return states;
  }

  const states = useMemo(() => getStates(state.letters), [state, solution, rows, columns]);

  let scale = 1;
  if (columns > 8) {
    scale = 0.6;
  }

  return (
    <Box className="wordle-preview">
      <VStack spacing={1}>
        {state.letters.map((row, rowI) => (
          <HStack spacing={1}>
            {row.map((col, colI) => {
              const state = states[rowI][colI];
              return (
                <Center className={`wordle-tile mini ${state}`} style={{ width: 16 * scale, height: 16 * scale }}>
                  <Text style={{ scale }}>{col}</Text>
                </Center>
              );
            })}
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
