import { Grid, Row, Box } from "rsuite";
import StrandsCell from "./StrandsCell";

interface StrandsGridProps {
  board: string[];
  selectedCells: number[][];
  revealedCells: number[][][];
  spangramCells: number[][];
  hintCells: number[][];
  lastInputType: "click" | "drag";
  onInteractCell: (x: number, y: number, isClick: boolean) => void;
  onSubmitWord: () => void;
}

export default function StrandsGrid({
  board,
  selectedCells,
  revealedCells,
  spangramCells,
  hintCells,
  lastInputType,
  onInteractCell,
  onSubmitWord
}: StrandsGridProps) {
  const flatRevealed = revealedCells.flat(1);

  return (
    <Box position={"absolute"} inset={0} className="strands-grid">
      <Grid
        fluid
        h={"100%"}
        justify={"space-between"}
        onMouseUp={() => {
          if (lastInputType === "drag") {
            onSubmitWord();
          }
        }}
        onMouseLeave={(e) => {
          if (lastInputType === "drag" && e.buttons === 1) {
            onSubmitWord();
          }
        }}
      >
        {board.map((row, rowIndex) => (
          <Row height={`calc(100% / ${board.length})`} key={rowIndex} className="strands-row" w={"100%"}>
            {row.split("").map((cell, cellIndex) => {
              const isSelected = selectedCells.some(([r, c]) => r === rowIndex && c === cellIndex);
              const isRevealed = flatRevealed.some(([r, c]) => r === rowIndex && c === cellIndex);
              const isSpangram = spangramCells.some(([r, c]) => r === rowIndex && c === cellIndex);
              const isHint = hintCells.some(([r, c]) => r === rowIndex && c === cellIndex);
              const animationDelayMs = isSpangram ? (spangramCells.findIndex(([r, c]) => r === rowIndex && c === cellIndex) + 1) * 20 : 0;

              return (
                <StrandsCell
                  key={`${rowIndex}-${cellIndex}-${isSelected}-${isRevealed}-${isSpangram}`}
                  row={rowIndex}
                  col={cellIndex}
                  letter={cell}
                  isSelected={isSelected}
                  isRevealed={isRevealed}
                  isSpangram={isSpangram}
                  isHint={isHint}
                  animationDelay={animationDelayMs}
                  onMouseDown={() => onInteractCell(cellIndex, rowIndex, true)}
                  onMouseEnter={(e) => {
                    if (e.buttons === 1) {
                      onInteractCell(cellIndex, rowIndex, false);
                    }
                  }}
                />
              );
            })}
          </Row>
        ))}
      </Grid>
    </Box>
  );
}
