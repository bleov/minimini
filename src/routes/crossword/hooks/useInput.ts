import { useCallback, useEffect } from "react";

import { useCrosswordContext } from "../Components/CrosswordContext";

export function useInput() {
  const {
    modalType,
    paused,
    rebusMode,
    selected,
    direction,
    autoCheck,
    complete,
    type,
    boardState,
    rebusText,
    body,
    rebusRef,
    setKeyboardOpen,
    setSelected,
    setRebusMode,
    setRebusText,
    letters,
    getCellsInDirection,
    checkCell,
    typeLetter,
    nextCell,
    previous,
    next,
    nextEditableClue,
    arrowKey
  } = useCrosswordContext();

  const activateRebusMode = useCallback(() => {
    if (selected == null) return;
    if (type !== "daily") return;
    if (autoCheck && "answer" in body.cells[selected] && boardState[selected] && checkCell(selected)) {
      return;
    }
    if (complete) return;
    setRebusMode(true);
    if (boardState[selected]) {
      setRebusText(boardState[selected].toUpperCase());
    } else {
      setRebusText("");
    }
  }, [autoCheck, boardState, body.cells, checkCell, complete, selected, setRebusMode, setRebusText, type]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, virtual: boolean) => {
      if (!virtual) {
        // close the virtual keyboard when a physical key is pressed
        if (!rebusMode) {
          // don't hide the keyboard when typing rebuses on mobile
          setKeyboardOpen(false);
        }
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (modalType !== null || paused) return;
      if (rebusMode) {
        if (e.key === "Escape" || e.key === "Enter" || e.key === "`") {
          rebusRef.current?.blur();
        }
        return;
      }

      // Typing logic
      if (letters.includes(e.key) && selected !== null) {
        typeLetter(e.key, selected);
        nextCell();
      }

      if (e.key === "Backspace" && selected !== null) {
        // Delete logic
        const highlightedCells = getCellsInDirection(selected, direction);
        const localIndex = highlightedCells.indexOf(selected);
        if (localIndex > 0) {
          // clear the cell and jump back
          typeLetter("", selected);
          const lastSelected = selected;
          setSelected(highlightedCells[localIndex - 1]);
          if (!boardState[lastSelected]) {
            // jump back and clear previous only if current cell was already empty
            typeLetter("", highlightedCells[localIndex - 1]);
          }
        } else if (localIndex === 0) {
          // first cell of the clue
          const empty = boardState[highlightedCells[localIndex]] === undefined;
          if (autoCheck) {
            const correct = checkCell(highlightedCells[localIndex]);
            if (correct || empty) {
              previous();
            } else {
              typeLetter("", highlightedCells[localIndex]);
            }
          } else {
            if (empty || complete) {
              previous();
            } else {
              // clear box without moving
              typeLetter("", highlightedCells[localIndex]);
            }
          }
        }
      }

      if (e.key === "ArrowRight") {
        arrowKey("ArrowRight", "across");
      }
      if (e.key === "ArrowLeft") {
        arrowKey("ArrowLeft", "across");
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        arrowKey("ArrowDown", "down");
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        arrowKey("ArrowUp", "down");
      }

      if (e.key === "Enter" && selected !== null) {
        nextEditableClue(e.shiftKey); // previous editable clue if shift+enter
      }
      if (e.key === "Tab" && selected !== null) {
        e.preventDefault();
        if (e.shiftKey) {
          previous(true);
        } else {
          next();
        }
      }

      if (e.key === " " || e.key === "Delete") {
        typeLetter("", selected as number);
        nextCell();
      }

      if ((e.key === "Escape" || e.key === "`") && selected !== null) {
        activateRebusMode();
      }
    },
    [
      activateRebusMode,
      arrowKey,
      autoCheck,
      boardState,
      checkCell,
      complete,
      direction,
      getCellsInDirection,
      letters,
      modalType,
      next,
      nextCell,
      nextEditableClue,
      paused,
      previous,
      rebusMode,
      rebusRef,
      selected,
      setKeyboardOpen,
      setSelected,
      typeLetter
    ]
  );

  const handleRebusBlur = useCallback(() => {
    setRebusMode(false);
    typeLetter(rebusText, selected as number);
    if (rebusText !== "") {
      nextCell();
    }
  }, [nextCell, rebusText, selected, setRebusMode, typeLetter]);

  useEffect(() => {
    if (rebusMode) {
      const rebus = rebusRef.current;
      if (!rebus) return;
      rebus.focus();
      const selectedCell = document.querySelector(`g[data-index='${selected}']`);
      if (!selectedCell) return;
      const cellBox = selectedCell?.querySelector("path")?.getBoundingClientRect();
      if (!cellBox) return;
      rebus.addEventListener("blur", handleRebusBlur);
      rebus.style.width = `${cellBox.width || 0}px`;
      rebus.style.height = `${cellBox.height || 0}px`;
      rebus.style.top = `${cellBox.top || 0}px`;
      rebus.style.left = `${(cellBox.left || 0) + ((cellBox.width || 0) - rebus.offsetWidth) / 2}px`;
      return () => {
        rebus.removeEventListener("blur", handleRebusBlur);
      };
    }
  }, [handleRebusBlur, rebusMode, rebusRef, selected]);

  const handleTouchStart = useCallback(() => {
    setKeyboardOpen(true);
  }, [setKeyboardOpen]);

  const handlePhysicalKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key) && !e.metaKey && !e.altKey && !rebusMode) {
        e.preventDefault();
      }
      handleKeyDown(e, false);
    },
    [handleKeyDown, rebusMode]
  );

  useEffect(() => {
    document.addEventListener("keydown", handlePhysicalKeydown);
    document.addEventListener("touchstart", handleTouchStart);
    return () => {
      document.removeEventListener("keydown", handlePhysicalKeydown);
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [handlePhysicalKeydown, handleTouchStart]);

  return {
    activateRebusMode,
    handleKeyDown
  };
}
