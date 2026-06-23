import { Col, Text } from "rsuite";

interface StrandsCellProps {
  row: number;
  col: number;
  letter: string;
  isSelected: boolean;
  isRevealed: boolean;
  isSpangram: boolean;
  isHint: boolean;
  animationDelay: number;
  onMouseDown: () => void;
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function StrandsCell({
  row,
  col,
  letter,
  isSelected,
  isRevealed,
  isSpangram,
  isHint,
  animationDelay,
  onMouseDown,
  onMouseEnter
}: StrandsCellProps) {
  const bgColor = isSelected ? "var(--guess-bg)" : isRevealed ? "var(--clue-bg)" : isSpangram ? "var(--spangram-bg)" : "transparent";

  return (
    <Col span={4} className="strands-cell">
      <button
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        style={{
          backgroundColor: bgColor,
          outline: isHint ? "2px dashed var(--clue-bg)" : "none",
          animationDelay: `${animationDelay}ms`
        }}
        className={isSelected ? "scale" : isSpangram ? "scale-found" : isRevealed ? "scale-clue" : ""}
      >
        <Text size="xl">{letter}</Text>
      </button>
    </Col>
  );
}
