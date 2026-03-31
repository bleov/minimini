import { useLayoutEffect } from "react";

import { useCrosswordContext } from "../Components/CrosswordContext";

export function useBoardRenderer() {
  const {
    boardRef,
    body,
    data,
    selected,
    direction,
    boardState,
    autoCheck,
    complete,
    globalSelectedClue,
    setDirection,
    setSelected,
    getCellsInDirection,
    checkCell
  } = useCrosswordContext();

  useLayoutEffect(() => {
    if (!boardRef.current) return;
    const cells = boardRef.current.querySelectorAll(".cell");
    cells.forEach((cell) => {
      // Cell renderer
      const parent = cell.parentElement;
      if (!parent) return;
      const index = parseInt(parent.getAttribute("data-index") || "-1", 10);
      if (isNaN(index) || index < 0) return;
      const guess: SVGTextElement | null = parent.querySelector(".guess");

      let highlightedCells: number[] = [];
      if (selected !== null) {
        highlightedCells = getCellsInDirection(selected, direction);
      }

      if (cell.getAttribute("fill") === "#d3d3d3") {
        cell.removeAttribute("fill");
        cell.classList.add("shaded");
      }

      if (highlightedCells.includes(index)) {
        cell.classList.add("highlighted");
      }

      if (globalSelectedClue && globalSelectedClue.relatives) {
        globalSelectedClue.relatives.forEach((rel) => {
          const relClue = body.clues[rel];
          if (relClue.cells.includes(index)) {
            cell.classList.add("related");
          }
        });
      }

      if (cell.getAttribute("fill") === "none" || cell.classList.contains("shaded")) {
        if (selected === index) {
          cell.classList.add("selected");
        } else {
          cell.setAttribute("fill", "transparent");
        }
      }

      if (boardState[index]) {
        if (guess) {
          guess.innerHTML = boardState[index].toUpperCase();
        }
      }

      if ("answer" in body.cells[index]) {
        parent.addEventListener("click", () => {
          if (selected === index) {
            setDirection(direction === "across" ? "down" : "across");
          }
          setSelected(index);
        });
        if (autoCheck) {
          if (guess && checkCell(index) && boardState[index] !== undefined) {
            guess.classList.add("correct");
          } else {
            guess?.classList.add("incorrect");
          }
        }
      }

      // rebus sizing
      if (boardState[index] && boardState[index].length > 1) {
        if (guess) {
          let size = 22;
          let minFont = 0.5;
          let maxFont = 13;
          const boxWidth = cell.getBoundingClientRect().width;
          const length = guess.getBBox().width;
          size *= boxWidth / length;
          size = Math.min(maxFont, size);
          size = Math.max(minFont, Math.floor(size));
          guess.setAttribute("font-size", size.toString());
        }
      }
    });

    if (data.assets && data.assets.length > 0) {
      let startOverlay = null;
      let solveOverlay = null;
      data.assets.forEach((asset) => {
        if (asset.uri.endsWith(".start.png") || asset.uri.endsWith(".start.gif")) {
          startOverlay = asset.uri;
        }
        if (asset.uri.endsWith(".solve.png") || asset.uri.endsWith(".solve.gif")) {
          solveOverlay = asset.uri;
        }
      });
      if ((startOverlay && solveOverlay && !complete) || (startOverlay && !solveOverlay)) {
        const overlay = document.createElement("image");
        boardRef.current.querySelector("svg")?.appendChild(overlay);
        overlay.outerHTML = `<image href="${startOverlay}" width="100%" height="100%" class="overlay"></image>`;
      }
      if (solveOverlay && complete) {
        const overlay = document.createElement("image");
        boardRef.current.querySelector("svg")?.appendChild(overlay);
        overlay.outerHTML = `<image href="${solveOverlay}" width="100%" height="100%" class="overlay"></image>`;
      }
    }
  });
}
