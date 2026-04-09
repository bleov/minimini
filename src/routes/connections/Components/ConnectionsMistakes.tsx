import type { ConnectionsCard } from "@/lib/types";
import { useContext } from "react";
import { Box, Center, HStack, Text } from "rsuite";
import { ConnectionsContext } from "./Connections";

const maxMistakes = 4;

function Bubble({ mistakes, index }: { mistakes: number; index: number }) {
  const classList = ["bubble"];
  if (index + 1 > maxMistakes - mistakes) {
    classList.push("used");
  }

  return <Box className={classList.join(" ")} />;
}

export function ConnectionsMistakes() {
  const { mistakes } = useContext(ConnectionsContext)!;

  return (
    <Center>
      <HStack spacing={10} alignItems={"center"}>
        <Text>Mistakes Remaining: </Text>
        {new Array(maxMistakes).fill("").map((_, index) => (
          <Bubble key={index} mistakes={mistakes} index={index} />
        ))}
      </HStack>
    </Center>
  );
}
