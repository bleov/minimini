import type { ConnectionsCard, ConnectionsGame } from "@/lib/types";
import { createContext, useEffect, useLayoutEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { Box, Text, VStack, HStack, Center, Button, ButtonToolbar, useToaster, Message, Loader } from "rsuite";
import { ConnectionsCard as ConnectionsCardElement } from "./ConnectionsCard";
import { ConnectionsMistakes } from "./ConnectionsMistakes";
import { ConnectionsCategory } from "./ConnectionsCategory";
import usePersistence from "../hooks/usePersistence";
import ConnectionsResults from "./ConnectionsResults";
import ConnectionsLeaderboard from "./ConnectionsLeaderboard";
import posthog from "posthog-js";

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
  shaking: boolean;
  resultText: string;
  cards: ConnectionsCard[];
  data: ConnectionsGame;
  complete: boolean;
  revealedCategoriesRef: RefObject<number[]>;
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
  const [shaking, setShaking] = useState(false);
  const [cards, setCards] = useState<ConnectionsCard[]>(data.categories.flatMap((x) => x.cards).sort((a, b) => a.position - b.position));
  const [rows, setRows] = useState(splitRows(cards));
  const [modalState, setModalState] = useState<"results" | "leaderboard" | null>(null);
  const [resultText, setResultText] = useState<string>("Well done!");
  const [slidingCards, setSlidingCards] = useState<number[]>([]);

  const toaster = useToaster();
  const complete = correctCategories.length === 4 || mistakes >= 4;
  const revealedCategoriesRef = useRef<number[]>([]);

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
    shaking,
    resultText,
    cards,
    data,
    complete,
    revealedCategoriesRef
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

  function revealCategory(category: ConnectionsGame["categories"][number]) {
    const revealPositions = category.cards.map((card) => card.position);
    const categoryIndex = data.categories.findIndex((c) => c === category);
    if (categoryIndex < 0) {
      setChecking(false);
      return;
    }

    const rowZeroUnselectedPositions = rows[0].filter((card) => !revealPositions.includes(card.position)).map((card) => card.position);
    setSlidingCards([...revealPositions, ...rowZeroUnselectedPositions]);

    setTimeout(() => {
      const gridLocations = new Map<number, { x: number; y: number }>();
      rows.forEach((row, y) => {
        row.forEach((card, x) => {
          gridLocations.set(card.position, { x, y });
        });
      });

      const resolvedGrid: (ConnectionsCard | undefined)[][] = rows.map((row) => row.map(() => undefined));
      const movedCardPositions = new Set<number>();

      revealPositions.forEach((position) => {
        const card = rows.flat().find((c) => c.position === position);
        if (!card) {
          return;
        }

        const relativeCardIndex = category.cards.findIndex((c) => c.position === position);
        if (relativeCardIndex < 0 || !resolvedGrid[0]) {
          return;
        }
        if (resolvedGrid[0][relativeCardIndex]) {
          return;
        }

        resolvedGrid[0][relativeCardIndex] = card;
        movedCardPositions.add(position);
      });

      if (rows.length > 1 && rows[0]) {
        const rowZeroUnselectedSliding = rows[0]
          .filter((card) => !revealPositions.includes(card.position))
          .sort((a, b) => a.position - b.position);

        const movingUpSelected = revealPositions
          .map((position) => {
            const location = gridLocations.get(position);
            return location ? { position, location } : undefined;
          })
          .filter((item): item is { position: number; location: { x: number; y: number } } => !!item && item.location.y > 0)
          .sort((a, b) => a.position - b.position);

        rowZeroUnselectedSliding.forEach((rowZeroCard, index) => {
          const vacatedSlot = movingUpSelected[index];
          if (!vacatedSlot) {
            return;
          }
          resolvedGrid[vacatedSlot.location.y][vacatedSlot.location.x] = rowZeroCard;
          movedCardPositions.add(rowZeroCard.position);
        });
      }

      rows.forEach((row, y) => {
        row.forEach((card, x) => {
          if (movedCardPositions.has(card.position)) {
            return;
          }
          if (!resolvedGrid[y][x]) {
            resolvedGrid[y][x] = card;
          }
        });
      });

      const orderedResolvedCards = resolvedGrid.flat().filter((card): card is ConnectionsCard => !!card);
      const revealedCardSet = new Set(revealPositions);
      const remainingCards = orderedResolvedCards.filter((card) => !revealedCardSet.has(card.position));

      setCards(remainingCards);
      setRows(splitRows(remainingCards));
      setSelectedCards([]);
      setGuesses((prevGuesses) => [...prevGuesses, revealPositions]);
      setCorrectCategories((prevCorrectCategories) => [...prevCorrectCategories, categoryIndex]);
      setSlidingCards([]);
      setChecking(false);
    }, 600);
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
    let matchedCategory: ConnectionsGame["categories"][number] | undefined;
    data.categories.forEach((category) => {
      let correctInCategory = 0;
      category.cards.forEach((card) => {
        if (selectedCards.includes(card.position)) {
          correctInCategory++;
        }
      });
      if (correctInCategory === 4) {
        correct = true;
        matchedCategory = category;
      }
    });
    setTimeout(() => {
      if (correct) {
        if (!matchedCategory) {
          setChecking(false);
          return;
        }
        revealCategory(matchedCategory);
        posthog.capture("connections_correct");
      } else {
        setShaking(true);
        setTimeout(() => {
          setShaking(false);
        }, 500);
        setMistakes((prevMistakes) => prevMistakes + 1);
        setGuesses((prevGuesses) => [...prevGuesses, selectedCards]);
        // reveal remaining categories on last mistake
        if (mistakes + 1 >= 4) {
          setCorrectCategories((prevCorrectCategories) => {
            const revealedCategories = data.categories.map((_, i) => i).filter((i) => !prevCorrectCategories.includes(i));
            revealedCategoriesRef.current = revealedCategories;
            return [...prevCorrectCategories, ...revealedCategories];
          });
          posthog.capture("connections_fail");
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
          posthog.capture("connections_one_away");
        }
        posthog.capture("connections_mistake");
        setChecking(false);
      }
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
  }, [correctCategories, loading]);

  if (loading) {
    return <Loader center />;
  }

  const cardGridLocation = new Map<number, { x: number; y: number }>();
  rows.forEach((row, y) => {
    row.forEach((card, x) => {
      cardGridLocation.set(card.position, { x, y });
    });
  });

  const swapSlideTargets = new Map<number, { x: number; y: number }>();
  if (rows.length > 1 && rows[0]) {
    const rowZeroUnselectedSliding = rows[0]
      .filter((card) => slidingCards.includes(card.position) && !selectedCards.includes(card.position))
      .sort((a, b) => a.position - b.position);

    const movingUpSelected = selectedCards
      .map((position) => {
        const location = cardGridLocation.get(position);
        return location ? { position, location } : undefined;
      })
      .filter((item): item is { position: number; location: { x: number; y: number } } => !!item && item.location.y > 0)
      .sort((a, b) => a.position - b.position);

    rowZeroUnselectedSliding.forEach((rowZeroCard, index) => {
      const vacatedSlot = movingUpSelected[index];
      if (!vacatedSlot) {
        return;
      }
      swapSlideTargets.set(rowZeroCard.position, vacatedSlot.location);
    });
  }

  return (
    <ConnectionsContext.Provider value={context}>
      <VStack spacing={24} width={"100%"} className="connections-container">
        <VStack spacing={8} width={"100%"}>
          {correctCategories.map((category, index) => (
            <ConnectionsCategory key={index} index={category} />
          ))}
          {rows.map((row, rowIndex) => (
            <HStack key={rowIndex} spacing={8} justify={"center"} width={"100%"}>
              {row.map((card, columnIndex) => {
                let slideTo: { x: number; y: number } | undefined;
                if (slidingCards.includes(card.position) && selectedCards.includes(card.position)) {
                  const categoryIndex = data.categories.findIndex((category) => category.cards.some((c) => c.position === card.position));
                  const relativeCardIndex = data.categories[categoryIndex].cards.findIndex((c) => c.position === card.position);
                  slideTo = { x: relativeCardIndex, y: 0 };
                }

                if (!slideTo) {
                  slideTo = swapSlideTargets.get(card.position);
                }

                return (
                  <ConnectionsCardElement
                    key={card.position}
                    content={card.content}
                    position={card.position}
                    row={rowIndex}
                    column={columnIndex}
                    slideTo={slideTo}
                  />
                );
              })}
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
                  const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
                  setCards(shuffledCards);
                  setRows(splitRows(shuffledCards));
                  posthog.capture("connections_shuffle");
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
                    posthog.capture("connections_view_results");
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
              <ConnectionsLeaderboard open={modalState === "leaderboard"} onClose={() => setModalState("results")} puzzleData={data} />
            </>
          )}
        </ButtonToolbar>
      </VStack>
    </ConnectionsContext.Provider>
  );
}
