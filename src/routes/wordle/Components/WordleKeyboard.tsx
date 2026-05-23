import { useState } from "react";
import { KeyboardReact } from "react-simple-keyboard";
import { Box } from "rsuite";

interface WordleKeyboardProps {
  handleKeyDown: (event: KeyboardEvent, virtual: boolean) => void;
  states: string[][];
  letters: string[][];
}

export default function WordleKeyboard({ handleKeyDown, states, letters }: WordleKeyboardProps) {
  function getThemedButtons(state: string) {
    const result: string[] = [];
    states.forEach((row, rowI) => {
      row.forEach((letterState, colI) => {
        if (letterState === state) {
          result.push(letters[rowI][colI]);
        }
      });
    });
    return Array.from(new Set(result).values()).join(" ");
  }

  const absentButtons = getThemedButtons("absent");
  const presentButtons = getThemedButtons("present");
  const correctButtons = getThemedButtons("correct");

  const buttonTheme = [];

  if (absentButtons.length > 0) {
    buttonTheme.push({
      class: "absent",
      buttons: absentButtons
    });
  }
  if (presentButtons.length > 0) {
    buttonTheme.push({
      class: "present",
      buttons: presentButtons
    });
  }
  if (correctButtons.length > 0) {
    buttonTheme.push({
      class: "correct",
      buttons: correctButtons
    });
  }

  console.log(buttonTheme);

  return (
    <Box className="wordle-keyboard">
      <KeyboardReact
        theme="hg-theme-default"
        onKeyPress={(key) => {
          let keyCode = key;
          if (key === "{bksp}") keyCode = "Backspace";
          if (key === "{enter}") keyCode = "Enter";
          if (key === "{esc}") keyCode = "Escape";
          if (key === "{tab}") keyCode = "Tab";
          handleKeyDown(new KeyboardEvent("keydown", { key: keyCode }), true);
        }}
        layout={{
          default: ["Q W E R T Y U I O P", "A S D F G H J K L", "{enter} Z X C V B N M {bksp}"]
        }}
        display={{
          "{enter}": "⏎",
          "{bksp}": "⌫"
        }}
        layoutName={"default"}
        disableButtonHold={true}
        buttonTheme={buttonTheme}
      />
    </Box>
  );
}
