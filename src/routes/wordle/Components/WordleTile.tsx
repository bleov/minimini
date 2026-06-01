import { useEffect, useRef, useState } from "react";
import { Center, Text } from "rsuite";

interface WordleTileProps {
  letter: string;
  state: "absent" | "present" | "correct" | "";
  checking: boolean;
  col: number;
}

export default function WordleTile({ letter, state, checking, col }: WordleTileProps) {
  const [revealed, setRevealed] = useState(false);

  const classList = ["wordle-tile"];
  let animationDelay = 0;

  if (revealed || !checking) {
    classList.push(state);
  }

  if (letter && !revealed) {
    classList.push("active");
    classList.push("scale-in");
  }

  if (checking) {
    classList.push("flip");
    animationDelay = 350 * col;
  }

  useEffect(() => {
    if (checking && !revealed) {
      setTimeout(
        () => {
          setRevealed(true);
        },
        350 / 2 + animationDelay
      );
    }
  }, [checking]);

  return (
    <Center className={classList.join(" ")} style={{ animationDelay: `${animationDelay}ms` }}>
      <Text>{letter}</Text>
    </Center>
  );
}
