import { useRef } from "react";

export const replayEvents: Record<string, number> = {
  start: 0,
  complete: 1,
  select_cell: 2,
  change_direction: 3,
  modify_cell: 4
};

export interface ReplayRecording {
  version: string;
  events: [number, number, ...any[]][];
}

export interface ReplayRecorder {
  start: () => void;
  end: () => void;
  cancel: () => void;
  record: (eventId: string, ...data: any[]) => void;
  isRecording: () => boolean;
  getData: () => ReplayRecording;
}

const defaultReplay: ReplayRecording = {
  version: "1",
  events: [[replayEvents.start, 0]]
};

interface ReplayBufferItem {
  event: number;
  timestamp: number;
  data: any[];
}

export default function useReplayRecorder(): ReplayRecorder {
  const replay = useRef<ReplayRecording>(defaultReplay);
  const replayBuffer = useRef([] as ReplayBufferItem[]);

  const replayObject = {
    start: () => {
      console.log("Starting replay");
      replay.current.events = [];
      replayBuffer.current = [];
      // @ts-ignore
      window.timerEvent = (ms: number) => {
        // resolve race conditions to the millisecond
        replayBuffer.current.sort((a, b) => a.timestamp - b.timestamp);
        replayBuffer.current.forEach((event) => {
          replay.current.events.push([event.event, ms, ...event.data]);
        });
        replayBuffer.current = [];
      };
    },
    end: () => {
      replayBuffer.current = [];
      // @ts-ignore
      window.timerEvent = (ms: number) => {
        replay.current.events.push([replayEvents.complete, ms]);
        // @ts-ignore
        delete window.timerEvent;
      };
    },
    cancel: () => {
      replayBuffer.current = [];
      // @ts-ignore
      delete window.timerEvent;
    },
    record: (eventId: string, ...data: any[]) => {
      if (!(eventId in replayEvents)) return;
      replayBuffer.current.push({
        event: replayEvents[eventId],
        timestamp: Date.now(),
        data
      });
    },
    isRecording: () => {
      return "timerEvent" in window;
    },
    getData: () => {
      return replay.current;
    }
  };

  return replayObject;
}
