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
    let result = new Array(rows).fill(0).map(() => new Array(columns).fill(false));
    for (let i = 0; i < rows; i++) {
      let checkValue = solution;
      const row = letters[i];

      for (let j = 0; j < row.length; j++) {
        const letter = letters[i][j].toLowerCase();
        if (letter === "") {
          continue;
        }
        if (checkValue.indexOf(letter) === -1) {
          result[i][j] = "absent";
          continue;
        }
        if (letter === solution[j]) {
          result[i][j] = "correct";
          checkValue = checkValue.replace(letter, "*");
          continue;
        }
        if (solution.includes(letter)) {
          result[i][j] = "present";
          checkValue = checkValue.replace(letter, "*");
        }
      }
    }
    return result;
  }

  const states = useMemo(() => getStates(state.letters), [state, solution]);

  return (
    <Box className="wordle-preview">
      <VStack spacing={1}>
        {state.letters.map((row, rowI) => (
          <HStack spacing={1}>
            {row.map((col, colI) => {
              const state = states[rowI][colI];
              return (
                <Center className={`wordle-tile mini ${state}`}>
                  <Text>{col}</Text>
                </Center>
              );
            })}
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
