import { GlobalState } from "@/lib/GlobalState";
import type { CustomPuzzle, WordleGame } from "@/lib/types";
import { pb } from "@/main";
import { PencilIcon, SaveIcon, SaveOffIcon } from "lucide-react";
import posthog from "posthog-js";
import { useContext, useEffect, useState } from "react";
import { useBeforeUnload, useParams } from "react-router";
import { Box, Button, ButtonToolbar, Center, HStack, Input, Slider, Text, VStack } from "rsuite";
import DetailsEditor from "../Components/DetailsEditor";

export default function WordleCreator() {
  const [record, setRecord] = useState<CustomPuzzle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingDetails, setEditingDetails] = useState<boolean>(false);
  const [details, setDetails] = useState({ title: "Untitled Puzzle", options: [] as string[] });
  const [saveStatus, setSaveStatus] = useState<"idle" | "unsaved" | "saving" | "saved" | "error">("idle");

  const [solutionValue, setSolutionValue] = useState<string>("");
  const [guessesValue, setGuessesValue] = useState<number>(6);

  const params = useParams();
  const { user } = useContext(GlobalState);

  const DefaultPuzzle: WordleGame = {
    days_since_launch: 0,
    editor: "",
    id: 0,
    print_date: "",
    solution: ""
  };

  useBeforeUnload((e) => {
    if (saveStatus === "unsaved" || saveStatus === "saving" || saveStatus === "error") {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  useEffect(() => {
    document.title = "Create Custom Wordle - Glyph";
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/custom_crossword/favicon.svg`);

    if (params.id) {
      // Existing puzzle
      pb.collection("custom_puzzles")
        .getOne(params.id)
        .then((record) => {
          if (record.puzzle == null) {
            setRecord(record as CustomPuzzle);
            setSolutionValue("");
            setGuessesValue(6);
          } else {
            setRecord(record as CustomPuzzle);
            setDetails({ title: record.title, options: record.public ? ["public"] : [] });
            const puzzle = record.puzzle as WordleGame;
            setSolutionValue(puzzle.solution);
            setGuessesValue(puzzle.guesses || 6);
          }
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load custom puzzle.");
        });
    } else {
      setError("Custom puzzle not found.");
    }
  }, []);

  async function save() {
    if (saveStatus === "saving") return;
    if (!record) return;
    if (!user || !pb.authStore.isValid) {
      return;
    }
    const customPuzzles = pb.collection("custom_puzzles");
    const puzzle = {
      ...DefaultPuzzle
    };
    puzzle.solution = solutionValue.toUpperCase();
    puzzle.guesses = guessesValue;
    const newRecord = {
      author: user.id,
      title: details.title?.substring(0, 35) || "Untitled Puzzle",
      puzzle,
      public: details.options.includes("public"),
      shape: null
    };
    setSaveStatus("saving");
    posthog.capture("save_custom_puzzle", { puzzleId: record.id, public: newRecord.public, type: "wordle" });
    customPuzzles
      .update(record.id, newRecord)
      .then(() => {
        setSaveStatus("saved");
      })
      .catch(() => {
        setSaveStatus("error");
      });
  }

  useEffect(() => {
    setSaveStatus("unsaved");
  }, [solutionValue, guessesValue, details]);

  if (error) {
    return (
      <Center style={{ height: "100vh" }}>
        <Text>{error}</Text>
      </Center>
    );
  }

  return (
    <Box width={"min(100%, 800px)"} margin={"0 auto"}>
      <VStack spacing={10}>
        <Center width={"100%"}>
          <VStack spacing={10}>
            <Input
              width={300}
              placeholder="Solution (1-12 letters)"
              maxLength={12}
              value={solutionValue}
              onChange={(e) => {
                setSolutionValue(e.replaceAll(/[^a-zA-Z]/g, ""));
              }}
              textTransform={solutionValue.length > 0 ? "uppercase" : undefined}
            ></Input>
            <HStack width={"100%"} spacing={10}>
              <Text>Guesses </Text>
              <Slider width={"100%"} progress min={1} max={12} value={guessesValue} onChange={setGuessesValue} />
            </HStack>
          </VStack>
        </Center>

        <ButtonToolbar width={"100%"} justifyContent={"center"}>
          <Button
            startIcon={<PencilIcon />}
            onClick={() => {
              setEditingDetails(true);
            }}
          >
            Details
          </Button>
          <Button
            startIcon={<SaveIcon />}
            appearance="primary"
            color={saveStatus === "unsaved" ? "blue" : undefined}
            onClick={save}
            loading={saveStatus === "saving"}
            disabled={saveStatus === "saved"}
          >
            Save
          </Button>
        </ButtonToolbar>
        <Text width={"100%"} align="center">
          {saveStatus === "error" && (
            <Text color={"red"}>
              <SaveOffIcon /> Failed to save changes
            </Text>
          )}
        </Text>
      </VStack>
      <DetailsEditor open={editingDetails} setOpen={setEditingDetails} details={details} setDetails={setDetails} />
    </Box>
  );
}
