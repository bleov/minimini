import type { ConnectionsCard } from "@/lib/types";
import { useContext, useEffect, useRef, useState } from "react";
import { Center, Text } from "rsuite";
import { ConnectionsContext } from "./Connections";

interface ConnectionsCardProps extends ConnectionsCard {
  row: number;
  column: number;
  slideTo?: { x: number; y: number };
}

function getGridOffset(from: HTMLDivElement, toX: number, toY: number): string {
  let fromX: number = parseInt(from.dataset.column ?? "0") ?? 0;
  let fromY: number = parseInt(from.dataset.row ?? "0") ?? 0;
  const offsetX = fromX * from.offsetWidth + 8 * fromX;
  const offsetY = fromY * from.offsetHeight + 8 * fromY;
  const toOffsetX = offsetX + (toX - fromX) * (from.offsetWidth + 8);
  const toOffsetY = offsetY + (toY - fromY) * (from.offsetHeight + 8);
  return `translate(${toOffsetX - offsetX}px, ${toOffsetY - offsetY}px)`;
}

export function ConnectionsCard({ content, position, row, column, slideTo }: ConnectionsCardProps) {
  const { selectedCards, setSelectedCards, checking, cards, complete, shaking } = useContext(ConnectionsContext)!;

  const [animationOffset, setAnimationOffset] = useState(0);
  const selected = selectedCards.includes(position);
  const cardRef = useRef<HTMLDivElement>(null);

  const classList = ["connections-card"];
  if (selected && !complete) {
    classList.push("selected");
  }
  if ((selectedCards.length === 4 && !selected) || complete) {
    classList.push("disabled");
  }
  if (shaking && selected) {
    classList.push("shake");
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

  useEffect(() => {
    if (slideTo && cardRef.current) {
      cardRef.current.classList.add("slide");
      cardRef.current.style.transform = getGridOffset(cardRef.current, slideTo.x, slideTo.y);
    }
  }, [slideTo]);

  return (
    <Center
      data-row={row}
      data-column={column}
      className={classList.join(" ")}
      ref={cardRef}
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
      style={{
        animationDelay: `${Math.max(0, animationOffset - 1)}ms`
      }}
    >
      <Text>{content}</Text>
    </Center>
  );
}
