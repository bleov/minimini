import { Box, Button, Text, VStack } from "rsuite";

interface StrandsSidebarProps {
  clue: string;
  hintProgress: number;
  onRequestHint: () => void;
  foundCount: number;
  totalCount: number;
  setModal: (modal: "results" | "leaderboard" | null) => void;
  isComplete: boolean;
}

export default function StrandsSidebar({
  clue,
  hintProgress,
  onRequestHint,
  foundCount,
  totalCount,
  setModal,
  isComplete
}: StrandsSidebarProps) {
  return (
    <VStack spacing={16} alignItems={"center"}>
      <Box className="clue-box">
        <VStack spacing={0}>
          <Box width={"100%"} className="clue-title">
            Today's Theme
            {/* Theme from {data.printDate} */}
          </Box>
          <Box width={"100%"} className="clue-hint">
            {clue}
          </Box>
        </VStack>
      </Box>
      <Text size="xl">
        <span style={{ fontWeight: "bold" }}>{foundCount}</span> of <span style={{ fontWeight: "bold" }}>{totalCount}</span> theme words
        found.
      </Text>
      <Button
        className="hint-button"
        onClick={() => {
          if (isComplete) {
            setModal("results");
            return;
          }
          onRequestHint();
        }}
      >
        <Box className="hint-button-bg" width={`${((isComplete ? 0 : hintProgress) / 3) * 100}%`} />
        <Text className="hint-button-text">{isComplete ? "View Results" : "Hint"}</Text>
        <Text>{isComplete ? "View Results" : "Hint"}</Text>
      </Button>
    </VStack>
  );
}
