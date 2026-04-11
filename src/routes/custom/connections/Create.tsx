import { GlobalState } from "@/lib/GlobalState";
import type { ConnectionsGame, CustomPuzzle } from "@/lib/types";
import { pb } from "@/main";
import { PencilIcon, SaveIcon, SaveOffIcon } from "lucide-react";
import { useContext, useEffect, useState, type SetStateAction } from "react";
import { useBeforeUnload, useParams } from "react-router";
import { Button, Center, Text, VStack, ButtonToolbar, Modal, Form, CheckboxGroup, Checkbox, Box } from "rsuite";
import CategoryEditor from "./Components/CategoryEditor";

export default function ConnectionsCreator() {
  const [record, setRecord] = useState<CustomPuzzle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ConnectionsGame | null>(null);

  const [editingDetails, setEditingDetails] = useState<boolean>(false);
  const [details, setDetails] = useState({ title: "Untitled Puzzle", options: [] as string[] });
  const [saveStatus, setSaveStatus] = useState<"idle" | "unsaved" | "saving" | "saved" | "error">("idle");

  const params = useParams();
  const { user } = useContext(GlobalState);

  const DefaultPuzzle: ConnectionsGame = {
    categories: new Array(4).fill({ title: "", cards: [] }),
    editor: "",
    id: 0,
    print_date: "",
    status: "OK"
  };

  DefaultPuzzle.categories.forEach((category, index) => {
    for (let i = 0; i < 4; i++) {
      const newCards = [...DefaultPuzzle.categories[index].cards];
      newCards.push({
        position: index * 4 + i,
        content: ""
      });
      DefaultPuzzle.categories[index] = { ...category, cards: newCards };
    }
  });

  useBeforeUnload((e) => {
    if (saveStatus === "unsaved" || saveStatus === "saving" || saveStatus === "error") {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  useEffect(() => {
    document.title = "Create Custom Connections - Glyph";
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/custom_connections/favicon.svg`);

    if (params.id) {
      // Existing puzzle
      pb.collection("custom_puzzles")
        .getOne(params.id)
        .then((record) => {
          if (record.puzzle == null) {
            setRecord(record as CustomPuzzle);
            setData(DefaultPuzzle);
          } else {
            setRecord(record as CustomPuzzle);
            setDetails({ title: record.title, options: record.public ? ["public"] : [] });
            setData(record.puzzle as ConnectionsGame);
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
    if (!data || !record) return;
    if (!user || !pb.authStore.isValid) {
      return;
    }
    const customPuzzles = pb.collection("custom_puzzles");
    const puzzle = {
      ...data
    };
    const cards = puzzle.categories.flatMap((category) => category.cards);
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    shuffledCards.forEach((card, index) => {
      const cardCategory = puzzle.categories.find((category) => category.cards.some((c) => c.position === card.position));
      if (cardCategory) {
        const categoryIndex = puzzle.categories.indexOf(cardCategory);
        puzzle.categories[categoryIndex].cards[cardCategory.cards.findIndex((c) => c.position === card.position)].position = index;
      }
    });
    const newRecord = {
      author: user.id,
      title: details.title?.substring(0, 35) || "Untitled Puzzle",
      puzzle,
      public: details.options.includes("public"),
      shape: null
    };
    setSaveStatus("saving");
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
  }, [data, details]);

  if (data) {
    if (error) {
      return (
        <Center style={{ height: "100vh" }}>
          <Text>{error}</Text>
        </Center>
      );
    }

    return (
      <Box width={"min(100%, 800px)"} margin={"0 auto"}>
        <VStack spacing={8}>
          <VStack spacing={8} className="categories" width={"100%"}>
            {data.categories.map((category, categoryIndex) => (
              <CategoryEditor
                key={categoryIndex}
                category={category}
                categoryIndex={categoryIndex}
                onChange={(category) => {
                  setData((prevData) => {
                    if (!prevData) return prevData;
                    const newCategories = [...prevData.categories];
                    newCategories[categoryIndex] = category;
                    return { ...prevData, categories: newCategories };
                  });
                }}
              />
            ))}
          </VStack>
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

        <Modal
          open={editingDetails}
          onClose={() => {
            setEditingDetails(false);
          }}
        >
          <Modal.Header>
            <Modal.Title>
              <PencilIcon /> Edit Details
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form
              fluid
              onChange={(formValue) => {
                setDetails(formValue as SetStateAction<{ title: string; options: string[] }>);
              }}
              formValue={details}
              onSubmit={() => {
                setEditingDetails(false);
              }}
            >
              <VStack spacing={15}>
                <Form.Group width={"100%"}>
                  <Form.Label>Puzzle Title</Form.Label>
                  <Form.Control name="title" maxLength={35}></Form.Control>
                </Form.Group>
                <Form.Group width={"100%"}>
                  <Form.Control name="options" accepter={CheckboxGroup}>
                    <Checkbox value={"public"}>Publish Publicly</Checkbox>
                    <Form.Text>
                      <Text muted align="left">
                        Your puzzle will be visible publicly on the custom puzzles page. When your puzzle is private, you can still share
                        the preview link with others.
                      </Text>
                    </Form.Text>
                  </Form.Control>
                </Form.Group>
              </VStack>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button
              appearance="primary"
              onClick={() => {
                setEditingDetails(false);
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </Box>
    );
  }
}
