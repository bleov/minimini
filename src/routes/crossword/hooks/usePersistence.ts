import localforage from "localforage";
import posthog from "posthog-js";
import throttle from "throttleit";
import { useCallback, useEffect, useMemo } from "react";

import { fireworks } from "@/lib/confetti";
import { pb } from "@/main";
import { useCrosswordContext } from "../Components/CrosswordContext";

export function usePersistence() {
  const {
    user,
    data,
    stateDocId,
    boardState,
    autoCheck,
    complete,
    selected,
    direction,
    keyboardOpen,
    type,
    options,
    timeRef,
    prefersReducedMotion,
    alreadyCompleted,
    incorrectShown,
    setModalType,
    setComplete,
    checkBoard
  } = useCrosswordContext();

  const cloudSave = useCallback(async () => {
    if (!user) return;
    const puzzleState = pb.collection("puzzle_state");
    const record = new FormData();

    Promise.all([
      localforage.getItem(`state-${data.id}`),
      localforage.getItem(`time-${data.id}`),
      localforage.getItem(`autocheck-${data.id}`),
      localforage.getItem(`selected-${data.id}`),
      localforage.getItem(`complete-${data.id}`),
      localforage.getItem(`cheated-${data.id}`)
    ] as any[]).then((saved) => {
      record.set("user", user.id);
      record.set("puzzle_id", data.id.toString());
      record.set("board_state", JSON.stringify(saved[0]));
      record.set("selected", JSON.stringify(saved[3]));
      record.set("time", saved[1]?.toString() ?? "0");
      record.set("autocheck", saved[2]?.toString() ?? "false");
      record.set("complete", saved[4]?.toString() ?? "false");
      record.set("cheated", saved[5]?.toString() ?? "false");

      function onSaveError(err: any) {
        console.error(err);
        ``;
        posthog.capture("cloud_save_error", { puzzle: data.id, puzzleDate: data.publicationDate, error: err.message });
      }

      if (stateDocId.current) {
        puzzleState.update(stateDocId.current, record).catch(onSaveError);
      } else {
        puzzleState
          .create(record)
          .then((createdRecord) => {
            stateDocId.current = createdRecord.id;
            posthog.capture("cloud_save_create", { puzzle: data.id, puzzleDate: data.publicationDate, stateDocId: stateDocId.current });
          })
          .catch(onSaveError);
      }
    });
  }, [data.id, data.publicationDate, stateDocId, user]);

  const submitScore = useCallback(async () => {
    if (!user) return;

    const leaderboard = pb.collection("leaderboard");
    const record = new FormData();

    Promise.all([
      localforage.getItem(`time-${data.id}`),
      localforage.getItem(`complete-${data.id}`),
      localforage.getItem(`cheated-${data.id}`)
    ] as any[]).then((saved) => {
      if (!saved[1]) return;
      record.set("user", user.id);
      record.set("puzzle_id", data.id.toString());
      record.set("time", saved[0]?.toString() ?? "0");
      record.set("cheated", saved[2]?.toString() ?? "false");
      record.set("platform", keyboardOpen ? "mobile" : "desktop");
      record.set("type", type);
      record.set("hardcore", options.includes("hardcore").toString());

      leaderboard
        .create(record)
        .catch((err) => {
          console.warn("Leaderboard submit error, this may be intentional:", err);
        })
        .then(() => {
          posthog.capture("leaderboard_submission", { puzzle: data.id, puzzleDate: data.publicationDate, time: timeRef.current });
        });
    });
  }, [data.id, data.publicationDate, keyboardOpen, options, timeRef, type, user]);

  const throttledCloudSave = useMemo(() => throttle(cloudSave, 4000), [cloudSave]);

  useEffect(() => {
    throttledCloudSave();
  }, [throttledCloudSave, boardState, autoCheck, complete, selected, direction, user]);

  useEffect(() => {
    const results = checkBoard();
    if (results.totalCells > 0 && results.totalCells === results.totalCorrect) {
      setModalType("victory");
      if (!prefersReducedMotion && !alreadyCompleted) {
        fireworks();
      }
      incorrectShown.current = false;
      posthog.capture("completed_puzzle", { puzzle: data.id, puzzleDate: data.publicationDate, time: timeRef.current, autoCheck });
      setComplete(true);
      localforage.setItem(`complete-${data.id}`, true).then(() => {
        cloudSave();
        submitScore();
      });
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } else if (results.totalCells > 0 && results.totalCells === results.totalFilled && results.totalCorrect < results.totalCells) {
      if (incorrectShown.current) return;
      setModalType("incorrect");
      incorrectShown.current = true;
      posthog.capture("incorrect_solution", { puzzle: data.id, puddleDate: data.publicationDate, time: timeRef.current, autoCheck });
    }
  }, [
    alreadyCompleted,
    autoCheck,
    boardState,
    checkBoard,
    cloudSave,
    data.id,
    data.publicationDate,
    incorrectShown,
    prefersReducedMotion,
    setComplete,
    setModalType,
    submitScore,
    timeRef
  ]);

  return {
    cloudSave,
    submitScore
  };
}
