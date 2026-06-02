import { useCallback, useEffect, useMemo, useRef } from "react";
import localforage from "localforage";
import { pb } from "@/main";
import posthog from "posthog-js";
import type { WordleGame } from "@/lib/types";

export default function usePersistence(
  letters: string[][],
  setLetters: (x: string[][]) => void,
  completeRows: number[],
  setCompleteRows: (x: number[]) => void,
  complete: boolean,
  data: WordleGame
): void {
  const save = {
    letters,
    completeRows,
    complete
  };

  const saveRef = useRef(save);
  const completeRef = useRef(complete);
  const saveReadyRef = useRef(false);
  const recordIdRef = useRef<string | null>(null);
  saveRef.current = save;
  completeRef.current = complete;

  async function cloudLoad(): Promise<string> {
    const states = pb.collection("wordle_state");
    if (!pb.authStore.isValid) return "";
    try {
      const record = await states.getFirstListItem(`puzzle_id=${data.id}`);
      const storageRecord: any = {};
      Object.keys(save).forEach((key) => {
        storageRecord[key] = record.state[key];
      });
      await localforage.setItem(`wordle-${data.id}`, storageRecord);
      recordIdRef.current = record.id;
      return record.id;
    } catch (err) {
      return "";
    }
  }

  const cloudSave = () => {
    if (!pb.authStore.isValid) return;
    const user = pb.authStore.record;
    if (!user) return;
    if (saveRef.current.completeRows.length === 0) return;
    const states = pb.collection("wordle_state");

    const record = {
      user: user.id,
      puzzle_id: data.id,
      puzzle_date: data.print_date,
      state: saveRef.current,
      complete: completeRef.current
    };
    if (recordIdRef.current) {
      states
        .update(recordIdRef.current, record)
        .then((res) => {})
        .catch((err) => {
          console.error("Cloud save failed", err);
        });
    } else {
      states
        .create(record)
        .then((res) => {
          recordIdRef.current = res.id;
        })
        .catch((err) => {
          console.error("Cloud save failed", err);
        });
    }
  };

  const submitScore = useCallback(() => {
    if (!pb.authStore.isValid) return;
    const user = pb.authStore.record;
    if (!user) return;

    const leaderboard = pb.collection("wordle_leaderboard");
    const record = {
      user: user.id,
      puzzle_id: data.id,
      puzzle_date: data.print_date,
      guesses: saveRef.current.completeRows.length,
      state: saveRef.current
    };
    leaderboard.create(record);
    posthog.capture("wordle_leaderboard_submit");
  }, [data.id, data.print_date]);

  function applySave(save: any) {
    setLetters(save.letters);
    setCompleteRows(save.completeRows);
    setTimeout(() => {
      saveReadyRef.current = true;
    }, 50);
  }

  useEffect(() => {
    localforage.setItem(`wordle-${data.id}`, save);
  }, Object.values(save));

  useEffect(() => {
    cloudLoad().then(() => {
      localforage.getItem(`wordle-${data.id}`).then((saved: any) => {
        if (saved) {
          applySave(saved);
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!saveReadyRef.current) return;
    cloudSave();
  }, [completeRows]);

  useEffect(() => {
    if (complete) {
      submitScore();
      posthog.capture("wordle_complete", { puzzleId: data.id });
    }
  }, [complete]);
}
