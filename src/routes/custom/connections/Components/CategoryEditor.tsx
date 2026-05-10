import type { ConnectionsCategory } from "@/lib/types";
import { categoryColorNames, categoryColors, categoryDifficulties } from "@/routes/connections/Components/ConnectionsCategory";
import { useEffect, useState } from "react";
import { Box, Card, Dropdown, HStack, Input, Stack, Text, VStack } from "rsuite";

interface CategoryEditorProps {
  category: ConnectionsCategory;
  categoryIndex: number;
  onChange: (updatedCategory: ConnectionsCategory) => void;
  onSwap: (oldCategory: number, newCategory: number) => void;
}

export default function CategoryEditor({ category, categoryIndex, onChange, onSwap }: CategoryEditorProps) {
  const [cardContents, setCardContents] = useState(category.cards.map((card) => card.content));
  const [title, setTitle] = useState(category.title);

  useEffect(() => {
    onChange({
      cards: category.cards.map((card, index) => ({ ...card, content: cardContents[index] })),
      title
    });
  }, [cardContents, title]);

  const dropdownData = categoryColorNames.map((color, i) => `${color}${categoryDifficulties[i]}`);

  return (
    <Box backgroundColor={categoryColors[categoryIndex]} padding={16} borderRadius={"md"} width={"100%"}>
      <VStack spacing={5}>
        <Dropdown title={`${categoryColorNames[categoryIndex]}${categoryDifficulties[categoryIndex]}`} className="category-dropdown">
          {dropdownData.map((text, newIndex) => (
            <Dropdown.Item
              onClick={() => {
                onSwap(categoryIndex, newIndex);
              }}
              key={newIndex}
            >
              {text}
            </Dropdown.Item>
          ))}
        </Dropdown>
        <Input
          value={title}
          onChange={(value) => setTitle(value)}
          maxLength={50}
          placeholder="Description"
          backgroundColor={"rgba(255, 255, 255, 0.6)"}
          textTransform={"uppercase"}
          width={"100%"}
        ></Input>
        <Stack width={"100%"} spacing={5} direction={{ xs: "column", sm: "row" }}>
          {category.cards.map((card, cardIndex) => (
            <Input
              key={cardIndex}
              value={cardContents[cardIndex]}
              onChange={(value) => {
                const newCardContents = [...cardContents];
                newCardContents[cardIndex] = value;
                setCardContents(newCardContents);
              }}
              maxLength={25}
              backgroundColor={"rgba(255, 255, 255, 0.6)"}
              textTransform={"uppercase"}
            />
          ))}
        </Stack>
      </VStack>
    </Box>
  );
}
