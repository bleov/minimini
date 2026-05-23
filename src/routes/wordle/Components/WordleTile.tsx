import { Center, Text } from "rsuite";

interface WordleTileProps {
  letter: string;
  state: "absent" | "present" | "correct" | "";
}

export default function WordleTile({ letter, state }: WordleTileProps) {
  const classList = ["wordle-tile", state];

  if (letter) {
    classList.push("active");
  }

  return (
    <Center className={classList.join(" ")}>
      <Text>{letter}</Text>
    </Center>
  );
}
