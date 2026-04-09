import type { ConnectionsCard } from "@/lib/types";
import { useContext, useState } from "react";
import { Center, Text } from "rsuite";
import { ConnectionsContext } from "./Connections";

export function ConnectionsCard({ content, position }: ConnectionsCard) {
  const { selectedCards, setSelectedCards, checking, cards, complete } = useContext(ConnectionsContext)!;

  const [animationOffset, setAnimationOffset] = useState(0);
  const selected = selectedCards.includes(position);

  const classList = ["connections-card"];
  if (selected && !complete) {
    classList.push("selected");
  }
  if ((selectedCards.length === 4 && !selected) || complete) {
    classList.push("disabled");
  }
  if (checking && selected) {
    classList.push("bounce");
    if (animationOffset === 0) {
      const selected: ConnectionsCard[] = cards.filter((card: ConnectionsCard) => selectedCards.includes(card.position));
      selected.sort((a, b) => a.position - b.position);
      const relativeIndex = selected.findIndex((card) => card.position === position);
      setAnimationOffset(1 + relativeIndex * 150);
      setTimeout(() => {
        setAnimationOffset(0);
      }, 150 * 8);
    }
  }

  return (
    <Center
      className={classList.join(" ")}
      onMouseDown={() => {
        if (checking) return;
        if (classList.includes("disabled")) {
          return;
        }
        setSelectedCards((prevSelectedCards: number[]) => {
          if (prevSelectedCards.includes(position)) {
            return prevSelectedCards.filter((card) => card !== position);
          }
          const newSelectedCards = [...prevSelectedCards, position];
          return newSelectedCards;
        });
      }}
      style={{ animationDelay: `${Math.max(0, animationOffset - 1)}ms` }}
    >
      <Text>{content}</Text>
    </Center>
  );
}
