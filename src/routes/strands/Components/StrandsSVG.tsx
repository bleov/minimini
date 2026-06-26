import { Box } from "rsuite";

interface StrandsSVGProps {
  selectedCells: number[][];
  revealedCells: number[][][];
  spangramCells: number[][];
  rows: number;
  cols: number;
}

export default function StrandsSVG({ selectedCells, revealedCells, spangramCells, rows, cols }: StrandsSVGProps) {
  const makePath = (cells: number[][], label: string) => {
    const segments = cells.map(([row, col], i) => {
      const x = (col + 0.5) * (313 / cols);
      const y = (row + 0.5) * (422 / rows);

      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    });

    const path = segments.join(" ");
    return path;
  };

  const selectedPath = makePath(selectedCells, "selected");
  const spangramPath = makePath(spangramCells, "spangram");

  return (
    <Box as="svg" width="100%" height="100%" viewBox="0 0 324 422" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {revealedCells.map((cellGroup, i) => {
        const path = makePath(cellGroup, `revealed-${i}`);
        if (!path) return null;

        return <path key={i} d={path} stroke="var(--clue-bg)" fill="none" strokeWidth={12} strokeLinecap="round" />;
      })}

      {spangramPath && <path d={spangramPath} stroke="var(--spangram-bg)" fill="none" strokeWidth={12} strokeLinecap="round" />}

      {selectedPath && <path d={selectedPath} stroke="var(--guess-bg)" fill="none" strokeWidth={12} strokeLinecap="round" />}
    </Box>
  );
}
