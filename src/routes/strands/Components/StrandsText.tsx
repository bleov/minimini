import { Text } from "rsuite";
import type { RefObject } from "react";

interface StrandsTextProps {
  constructedWord: string;
  textRef: RefObject<HTMLParagraphElement | null>;
}

export default function StrandsText({ constructedWord, textRef }: StrandsTextProps) {
  return (
    <Text size="xl" weight="bold" className="constructed-word" ref={textRef} as="p">
      {constructedWord}
    </Text>
  );
}
