import localforage from "localforage";
import posthog from "posthog-js";
import { useContext, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useStopwatch } from "react-timer-hook";
import { HStack, Text } from "rsuite";
import { PauseIcon } from "lucide-react";

import type { MiniCrossword } from "@/lib/types";
import { CrosswordAppState } from "../state";

interface TimerProps {
  onPause: () => void;
  running: boolean;
  setTime: (time: [number, number]) => void;
  puzzle: MiniCrossword;
  restoredTime?: number;
  isPaused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
}

export default function Timer({ onPause, running, setTime, puzzle, restoredTime, isPaused, setPaused }: TimerProps) {
  const restoredTimeDate = new Date();
  restoredTimeDate.setSeconds(restoredTimeDate.getSeconds() + (restoredTime || 0));
  const { seconds, minutes, start, pause, totalSeconds } = useStopwatch({
    autoStart: false,
    interval: 20,
    offsetTimestamp: restoredTimeDate
  });

  const { type, options } = useContext(CrosswordAppState);

  useEffect(() => {
    if (running) {
      start();
    } else {
      pause();
    }
  }, [running]);

  useEffect(() => {
    setTime([minutes, seconds]);
    localforage.setItem(`time-${puzzle.id}`, totalSeconds);
  }, [minutes, seconds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (type === "daily") return; // overlaps with rebus shortcut
        if (e.repeat) return;
        e.preventDefault();
        if (isPaused) {
          setPaused(false);
          return;
        }
        onPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPause, isPaused, setPaused, type]);

  return (
    <HStack className="timer" justifyContent={"center"} spacing={0}>
      <Text className="timer-text">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </Text>
      {!options.includes("hardcore") && (
        <PauseIcon
          className="timer-icon"
          onClick={() => {
            posthog.capture("manual_pause", {
              time: `${minutes}:${seconds.toString().padStart(2, "0")}`,
              puzzle: puzzle.id,
              keyboardActivated: false
            });
            onPause();
          }}
        />
      )}
    </HStack>
  );
}
