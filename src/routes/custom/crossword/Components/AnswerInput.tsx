import { useEffect, useRef, useState } from "react";
import { Box, HStack, Input } from "rsuite";

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AnswerInput({ value, onChange }: AnswerInputProps) {
  const letters = value.split("");
  const [active, setActive] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const ALLOWED_KEYS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    inputRefs.current[active]?.focus();
  }, [active]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        if (active > 0) {
          setActive(active - 1);
        }
      } else if (e.key === "ArrowRight") {
        if (active < letters.length - 1) {
          setActive(active + 1);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  return (
    <HStack width={"100%"}>
      {letters.map((letter, i) => (
        <Input
          key={i}
          ref={(el: HTMLInputElement) => {
            inputRefs.current[i] = el;
          }}
          value={letter}
          autoFocus={i === 0}
          className="answer-input-box"
          onChange={(value) => {
            if (value.length > 0) {
              setActive(i + 1);
            }
          }}
          onKeyDown={(e) => {
            if (!ALLOWED_KEYS.includes(e.key)) {
              e.preventDefault();
              if (e.key === "Backspace") {
                onChange(value.slice(0, i) + " " + value.slice(i + 1));
                if (i > 0) {
                  setActive(i - 1);
                }
              }
              return;
            }
            onChange(value.slice(0, i) + (e.key.length === 1 ? e.key.toUpperCase() : " ") + value.slice(i + 1));
          }}
          onFocus={(e) => {
            if (active !== i) {
              setActive(i);
            }
          }}
        />
      ))}
    </HStack>
  );
}
