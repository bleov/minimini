import type { ConnectionsCard, ConnectionsGame } from "@/lib/types";
import { createContext, useEffect, useLayoutEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Box, Text, VStack, HStack, Center, Button, ButtonToolbar, useToaster, Message, Loader } from "rsuite";
import { ConnectionsCard as ConnectionsCardElement } from "./ConnectionsCard";
import { ConnectionsMistakes } from "./ConnectionsMistakes";
import { ConnectionsCategory } from "./ConnectionsCategory";
import usePersistence from "../hooks/usePersistence";
import ConnectionsResults from "./ConnectionsResults";
import ConnectionsLeaderboard from "./ConnectionsLeaderboard";

export interface ConnectionsContextType {
  selectedCards: number[];
  setSelectedCards: Dispatch<SetStateAction<number[]>>;
  guesses: number[][];
  setGuesses: Dispatch<SetStateAction<number[][]>>;
  mistakes: number;
  setMistakes: Dispatch<SetStateAction<number>>;
  correctCategories: number[];
  setCorrectCategories: Dispatch<SetStateAction<number[]>>;
  rows: ConnectionsCard[][];
  setRows: Dispatch<SetStateAction<ConnectionsCard[][]>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  checking: boolean;
  resultText: string;
  cards: ConnectionsCard[];
  data: ConnectionsGame;
  complete: boolean;
}

interface ConnectionsProps {
  data: ConnectionsGame;
}

export const ConnectionsContext = createContext<ConnectionsContextType | undefined>(undefined);

function splitRows(arr: any[]): any[][] {
  const rows: any[][] = [];
  for (let i = 0; i < arr.length; i += 4) {
    rows.push(arr.slice(i, i + 4));
  }
  return rows;
}

export default function Connections({ data }: ConnectionsProps) {
  const [loading, setLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<number[][]>([]);
  const [correctCategories, setCorrectCategories] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [checking, setChecking] = useState<boolean>(false);
  const [cards, setCards] = useState<ConnectionsCard[]>(data.categories.flatMap((x) => x.cards).sort((a, b) => a.position - b.position));
  const [rows, setRows] = useState(splitRows(cards));
  const [modalState, setModalState] = useState<"results" | "leaderboard" | null>(null);
  const [resultText, setResultText] = useState<string>("Well done!");

  const toaster = useToaster();
  const complete = correctCategories.length === 4 || mistakes >= 4;

  const context: ConnectionsContextType = {
    selectedCards,
    setSelectedCards,
    guesses,
    setGuesses,
    mistakes,
    setMistakes,
    correctCategories,
    setCorrectCategories,
    rows,
    setRows,
    loading,
    setLoading,
    checking,
    resultText,
    cards,
    data,
    complete
  };

  usePersistence(context);

  if (import.meta.env.DEV) {
    // @ts-ignore
    window.connections = { ...context };
  }

  function toast(message: string) {
    toaster.push(<Message>{message}</Message>, {
      placement: "topCenter",
      duration: 3000,
      container: document.documentElement
    });
  }

  function check() {
    if (checking) return;
    setChecking(true);

    if (guesses.some((guess) => guess.every((card) => selectedCards.includes(card)) && guess.length === selectedCards.length)) {
      setChecking(false);
      toast("Already guessed!");
      return;
    }

    let correct = false;
    data.categories.forEach((category) => {
      let correctInCategory = 0;
      category.cards.forEach((card) => {
        if (selectedCards.includes(card.position)) {
          correctInCategory++;
        }
      });
      if (correctInCategory === 4) {
        correct = true;
      }
    });
    const correctCategory = data.categories.findIndex((category) => category.cards.every((card) => selectedCards.includes(card.position)));
    setTimeout(() => {
      if (correct) {
        console.log("correct");
        setGuesses((prevGuesses) => [...prevGuesses, selectedCards]);
        setCorrectCategories((prevCorrectCategories) => [...prevCorrectCategories, correctCategory]);
        setSelectedCards([]);
      } else {
        setMistakes((prevMistakes) => prevMistakes + 1);
        setGuesses((prevGuesses) => [...prevGuesses, selectedCards]);
        if (mistakes + 1 >= 4) {
          setCorrectCategories((prevCorrectCategories) => [
            ...prevCorrectCategories,
            ...data.categories.map((_, i) => i).filter((i) => !prevCorrectCategories.includes(i))
          ]);
        }
        // one away detection
        const categoryMistakes = data.categories.map((category) => {
          let correctInCategory = 0;
          category.cards.forEach((card) => {
            if (selectedCards.includes(card.position)) {
              correctInCategory++;
            }
          });
          return correctInCategory;
        });
        const oneAway = categoryMistakes.some((mistakes) => mistakes === 3);
        if (oneAway) {
          toast("One away...");
        }
      }
      setChecking(false);
    }, 150 * 8);
  }

  useLayoutEffect(() => {
    if (!loading) {
      let newCards = [...cards];
      correctCategories.forEach((categoryIndex) => {
        const category = data.categories[categoryIndex];
        category.cards.forEach((card) => {
          newCards = newCards.filter((c) => c.position !== card.position);
        });
      });
      setCards(newCards);
      setRows(splitRows(newCards));
    }

    if (complete) {
      let result = "";
      if (correctCategories.length === 4 && mistakes < 4) {
        if (mistakes === 3) {
          result = "Phew...";
        } else if (mistakes === 0) {
          result = "Perfect!";
        } else {
          result = "Well done!";
        }
      } else {
        result = "Next time!";
      }
      toast(result);
      setResultText(result);
    }
  }, [correctCategories]);

  if (loading) {
    return <Loader center />;
  }

  return (
    <ConnectionsContext.Provider value={context}>
      <VStack spacing={24} width={"100%"}>
        <VStack spacing={8} width={"100%"}>
          {correctCategories.map((category, index) => (
            <ConnectionsCategory key={index} index={category} />
          ))}
          {rows.map((row, rowIndex) => (
            <HStack key={rowIndex} spacing={8} justify={"center"} width={"100%"}>
              {row.map((card) => (
                <ConnectionsCardElement key={card.position} content={card.content} position={card.position} />
              ))}
            </HStack>
          ))}
        </VStack>
        <Box width={"100%"}>
          <ConnectionsMistakes />
        </Box>
        <ButtonToolbar width={"100%"} justifyContent={"center"} className="action-btns">
          {!complete ? (
            <HStack spacing={10}>
              <Button
                appearance="ghost"
                onClick={() => {
                  if (checking) return;
                  setRows(splitRows([...cards].sort(() => Math.random() - 0.5)));
                }}
              >
                Shuffle
              </Button>
              <Button
                appearance="ghost"
                onClick={() => {
                  if (checking) return;
                  setSelectedCards([]);
                }}
                disabled={selectedCards.length === 0}
              >
                Deselect All
              </Button>
              <Button appearance={selectedCards.length < 4 ? "ghost" : "primary"} disabled={selectedCards.length < 4} onClick={check}>
                Submit
              </Button>
            </HStack>
          ) : (
            <>
              <HStack spacing={10}>
                <Button
                  appearance="ghost"
                  className={modalState === null ? "breathe" : ""}
                  onClick={() => {
                    setModalState("results");
                  }}
                >
                  View Results
                </Button>
              </HStack>
              <ConnectionsResults
                open={modalState === "results"}
                onClose={() => setModalState(null)}
                onOpenLeaderboard={() => {
                  setModalState("leaderboard");
                }}
              />
              <ConnectionsLeaderboard open={modalState === "leaderboard"} onClose={() => setModalState(null)} puzzleData={data} />
            </>
          )}
        </ButtonToolbar>
      </VStack>
    </ConnectionsContext.Provider>
  );
}
