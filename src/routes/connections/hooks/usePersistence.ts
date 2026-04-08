import { useContext, useEffect } from "react";
import localforage from "localforage";
import type { ConnectionsContextType } from "../Components/Connections";

export default function usePersistence(context: ConnectionsContextType) {
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
    data
  } = context;

  const save = {
    guesses,
    mistakes,
    selectedCards,
    correctCategories,
    rows
  };

  useEffect(() => {
    localforage.setItem(`connections-${data.id}`, save);
  }, Object.values(save));

  useEffect(() => {
    localforage.getItem(`connections-${data.id}`).then((saved: any) => {
      if (saved) {
        setGuesses(saved.guesses);
        setMistakes(saved.mistakes);
        setSelectedCards(saved.selectedCards);
        setCorrectCategories(saved.correctCategories);
        setTimeout(() => {
          setRows(saved.rows);
        }, 10);
      }
    });
  }, []);
}
