import { useCallback, useEffect, useMemo, useRef } from "react";
import localforage from "localforage";
import throttle from "throttleit";
import type { StrandsContextType } from "../Components/Strands";
import { pb } from "@/main";
import posthog from "posthog-js";

export default function usePersistence(context: StrandsContextType): () => void {
  const {
    data,
    selectedCells,
    setSelectedCells,
    revealedCells,
    setRevealedCells,
    spangramRevealedCells,
    setSpangramRevealedCells,
    hintProgress,
    setHintProgress,
    foundHints,
    setFoundHints,
    revealedHintCells,
    setRevealedHintCells,
    constructedWord,
    setConstructedWord,
    hintsUsed,
    setHintsUsed,
    gameHistory,
    setGameHistory,
    loading,
    setLoading
  } = context;

  const save = {
    selectedCells,
    revealedCells,
    spangramRevealedCells,
    hintProgress,
    foundHints,
    revealedHintCells,
    gameHistory,
    hintsUsed
  };

  const saveRef = useRef(save);
  const saveReadyRef = useRef(false);
  const recordIdRef = useRef<string | null>(null);

  saveRef.current = save;

  async function cloudLoad(): Promise<string> {
    const states = pb.collection("strands_state");
    if (!pb.authStore.isValid) return "";

    try {
      const record = await states.getFirstListItem(`puzzle_id=${data.id}`);
      const storageRecord: any = {};

      Object.keys(save).forEach((key) => {
        storageRecord[key] = record.state[key];
      });

      await localforage.setItem(`strands-${data.id}`, storageRecord);
      recordIdRef.current = record.id;

      return record.id;
    } catch (err) {
      return "";
    }
  }

  const cloudSave = useCallback(() => {
    if (!pb.authStore.isValid) return;
    const user = pb.authStore.record;
    if (!user) return;

    const states = pb.collection("strands_state");

    const record = {
      user: user.id,
      puzzle_id: data.id,
      puzzle_date: data.printDate,
      state: saveRef.current,
      complete:
        saveRef.current.revealedCells.length + (saveRef.current.spangramRevealedCells.length > 0 ? 1 : 0) === data.themeWords.length + 1
    };

    if (recordIdRef.current) {
      states.update(recordIdRef.current, record).catch(() => {});
    } else {
      states
        .create(record)
        .then((res) => {
          recordIdRef.current = res.id;
        })
        .catch(() => {});
    }
  }, [data.id, data.printDate]);

  const throttledCloudSave = useMemo(() => throttle(cloudSave, 1000), [cloudSave]);

  function applySave(save: any) {
    setSelectedCells(save.selectedCells);
    setRevealedCells(save.revealedCells);
    setSpangramRevealedCells(save.spangramRevealedCells);
    setHintProgress(save.hintProgress);
    setFoundHints(save.foundHints);
    setRevealedHintCells(save.revealedHintCells);
    setConstructedWord(save.constructedWord);
    setHintsUsed(save.hintsUsed);
    setGameHistory(save.gameHistory);

    setTimeout(() => {
      saveReadyRef.current = true;
    }, 50);
  }

  useEffect(() => {
    localforage.setItem(`strands-${data.id}`, save);
  }, Object.values(save));

  useEffect(() => {
    cloudLoad().then(() => {
      localforage
        .getItem(`strands-${data.id}`)
        .then((saved: any) => {
          if (saved) applySave(saved);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, []);

  useEffect(() => {
    if (!saveReadyRef.current) return;
    throttledCloudSave();
  }, [revealedCells, spangramRevealedCells, hintProgress, foundHints, revealedHintCells, hintsUsed]);

  useEffect(() => {
    const isComplete =
      saveRef.current.revealedCells.length + (saveRef.current.spangramRevealedCells.length > 0 ? 1 : 0) === data.themeWords.length + 1;

    if (isComplete) {
      if (pb.authStore.isValid) {
        const leaderboard = pb.collection("strands_leaderboard");
        const user = pb.authStore.record;

        leaderboard.create({
          user: user.id,
          puzzle_id: data.id,
          puzzle_date: data.printDate,
          hints_used: saveRef.current.hintsUsed,
          state: saveRef.current
        });

        posthog.capture("strands_complete", { puzzleId: data.id });
      }
    }
  }, [revealedCells, spangramRevealedCells, data.id, data.printDate, data.themeWords.length]);

  return throttledCloudSave;
}
