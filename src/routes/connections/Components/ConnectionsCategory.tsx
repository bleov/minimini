import type { ConnectionsCard } from "@/lib/types";
import { useContext } from "react";
import { Box, Center, HStack, Text, VStack } from "rsuite";
import { ConnectionsContext } from "./Connections";

export const categoryColors = ["#F9DF6D", "#A0C35A", "#B0C4EF", "#BA81C5"];

export function ConnectionsCategory({ index }: { index: number }) {
  const { data } = useContext(ConnectionsContext)!;

  const category = data.categories[index];

  return (
    <Center width={"100%"}>
      <Box className="connections-category" backgroundColor={categoryColors[index]}>
        <VStack height={"100%"} justify={"center"} align={"center"} spacing={0}>
          <Text align="center" weight="bold" size={20}>
            {category.title}
          </Text>
          <Text align="center" size={20}>
            {category.cards.map((card) => card.content).join(", ")}
          </Text>
        </VStack>
      </Box>
    </Center>
  );
}
