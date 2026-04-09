import { useCallback, useEffect, useMemo, useRef } from "react";
import localforage from "localforage";
import throttle from "throttleit";
import type { ConnectionsContextType } from "../Components/Connections";
import { pb } from "@/main";

export default function usePersistence(context: ConnectionsContextType): () => void {
  const {
    guesses,
    setGuesses,
    mistakes,
    setMistakes,
    selectedCards,
    setSelectedCards,
    correctCategories,
    setCorrectCategories,
    rows,
    setRows,
    data,
    complete,
    setLoading,
    revealedCategoriesRef
  } = context;

  const save = {
    guesses,
    mistakes,
    selectedCards,
    correctCategories,
    rows
  };

  const saveRef = useRef(save);
  const completeRef = useRef(complete);
  const saveReadyRef = useRef(false);
  const recordIdRef = useRef<string | null>(null);
  saveRef.current = save;
  completeRef.current = complete;

  async function cloudLoad(): Promise<string> {
    const states = pb.collection("connections_state");
    if (!pb.authStore.isValid) return "";
    try {
      const record = await states.getFirstListItem(`puzzle_id=${data.id}`);
      const storageRecord: any = {};
      Object.keys(save).forEach((key) => {
        storageRecord[key] = record.state[key];
      });
      await localforage.setItem(`connections-${data.id}`, storageRecord);
      recordIdRef.current = record.id;
      return record.id;
    } catch (err) {
      return "";
    }
  }

  const cloudSave = useCallback(() => {
    console.log("running cloud save");
    if (!pb.authStore.isValid) return;
    const user = pb.authStore.record;
    if (!user) return;
    if (saveRef.current.guesses.length === 0) return;
    const states = pb.collection("connections_state");

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
        .then((res) => {
          console.log("Cloud save successful", res);
        })
        .catch((err) => {
          console.error("Cloud save failed", err);
        });
    } else {
      states
        .create(record)
        .then((res) => {
          console.log("Cloud save successful", res);
          recordIdRef.current = res.id;
        })
        .catch((err) => {
          console.error("Cloud save failed", err);
        });
    }
  }, [data.id, data.print_date]);

  const submitScore = useCallback(() => {
    if (!pb.authStore.isValid) return;
    const user = pb.authStore.record;
    if (!user) return;
    const order = saveRef.current.correctCategories.map((x) => {
      if (revealedCategoriesRef.current.includes(x)) {
        return -1;
      }
      return x;
    });
    const leaderboard = pb.collection("connections_leaderboard");
    const record = {
      user: user.id,
      puzzle_id: data.id,
      puzzle_date: data.print_date,
      mistakes: saveRef.current.mistakes,
      order,
      guesses: saveRef.current.guesses
    };
    leaderboard.create(record);
  }, [data.id, data.print_date]);

  const throttledCloudSave = useMemo(() => throttle(cloudSave, 1000), [cloudSave]);

  function applySave(save: any) {
    setGuesses(save.guesses);
    setMistakes(save.mistakes);
    setSelectedCards(save.selectedCards);
    setCorrectCategories(save.correctCategories);
    setRows(save.rows);
    setTimeout(() => {
      saveReadyRef.current = true;
    }, 50);
  }

  useEffect(() => {
    localforage.setItem(`connections-${data.id}`, save);
  }, Object.values(save));

  useEffect(() => {
    cloudLoad().then(() => {
      localforage
        .getItem(`connections-${data.id}`)
        .then((saved: any) => {
          if (saved) {
            applySave(saved);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, []);

  useEffect(() => {
    if (!saveReadyRef.current) return;
    throttledCloudSave();
  }, [guesses]);

  useEffect(() => {
    if (complete) {
      submitScore();
    }
  }, [complete]);

  return throttledCloudSave;
}
