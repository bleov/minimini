import { ArrowLeftIcon, TrophyIcon } from "lucide-react";
import { Button, ButtonGroup, Center, Heading, Image, Modal, Text, VStack } from "rsuite";

import Rating from "@/Components/Rating";
import { formatDate } from "@/lib/formatting";
import type { MiniCrossword } from "@/lib/types";

interface VictoryModalProps {
  open: boolean;
  onClose: () => void;
  onOpenLeaderboard: () => void;
  onExit: () => void;
  type: "mini" | "daily" | "midi" | "custom";
  data: MiniCrossword;
  timeRef: React.RefObject<number[]>;
}

export default function VictoryModal({ open, onClose, onOpenLeaderboard, onExit, type, data, timeRef }: VictoryModalProps) {
  return (
    <Modal open={open} onClose={onClose} centered size="fit-content" overflow={false} dialogClassName="complete-dialog">
      <VStack spacing={15} width={"100%"}>
        <VStack spacing={5} width={"100%"}>
          <Center width={"100%"}>
            <Image src={type === "custom" ? `/icons/custom_crossword/pwa-192x192.png` : `/icons/${type}/pwa-192x192.png`} width={42} />
          </Center>
          <Heading level={2} className="merriweather-display">
            Congratulations!
          </Heading>
        </VStack>
        <VStack spacing={5} width={"100%"} alignItems={"center"}>
          {timeRef.current.length === 2 && (
            <Text>
              {type === "custom" ? "You solved this puzzle in " : `You solved The ${type.charAt(0).toUpperCase()}${type.substring(1)} in `}
              <Text weight="bold">
                {timeRef.current[0]}:{timeRef.current[1].toString().padStart(2, "0")}
              </Text>
            </Text>
          )}
          <Text>{formatDate(data.publicationDate)}</Text>
        </VStack>
        <Rating id={data.id} />
        <ButtonGroup vertical block width={"100%"}>
          <Button onClick={onClose} appearance="primary">
            Admire Puzzle
          </Button>
          <Button onClick={onOpenLeaderboard} startIcon={<TrophyIcon />}>
            Leaderboard
          </Button>
          <Button appearance="default" startIcon={<ArrowLeftIcon />} onClick={onExit}>
            Back
          </Button>
        </ButtonGroup>
      </VStack>
    </Modal>
  );
}
