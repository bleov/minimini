import { renderClue } from "@/lib/formatting";
import { GlobalState } from "@/lib/GlobalState";
import type { CustomPuzzle, CrosswordShape, MiniCrossword } from "@/lib/types";
import { pb } from "@/main";
import { Grid2X2PlusIcon, PencilIcon, SaveIcon, SaveOffIcon, UploadCloudIcon } from "lucide-react";
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type SetStateAction } from "react";
import {
  Box,
  Button,
  ButtonToolbar,
  Center,
  Checkbox,
  CheckboxGroup,
  Col,
  Form,
  Grid,
  Heading,
  HStack,
  Input,
  Modal,
  PinInput,
  Row,
  Text,
  useDialog,
  VStack
} from "rsuite";
import ShapePreview from "./Components/ShapePreview";
import { useBeforeUnload, useParams } from "react-router";

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Create() {
  const [record, setRecord] = useState<CustomPuzzle | null>(null);
  const [data, setData] = useState<MiniCrossword | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingClue, setEditingClue] = useState<number | null>(null);
  const [clueInputText, setClueInputText] = useState<string>("");
  const [clueAnswerText, setClueAnswerText] = useState<string>("");
  const [editingDetails, setEditingDetails] = useState<boolean>(false);
  const [details, setDetails] = useState({ title: "Untitled Puzzle", options: [] as string[] });
  const [hoveringClue, setHoveringClue] = useState(-1);
  const [saveStatus, setSaveStatus] = useState<"idle" | "unsaved" | "saving" | "saved" | "error">("idle");

  const [shapeDialogOpen, setShapeDialogOpen] = useState(false);
  const [shapes, setShapes] = useState<CrosswordShape[]>([]);
  const [shapesLoading, setShapesLoading] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const dialog = useDialog();
  const params = useParams();
  const { user } = useContext(GlobalState);

  const type = "mini";

  useBeforeUnload((e) => {
    if (saveStatus === "unsaved" || saveStatus === "saving" || saveStatus === "error") {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  function clearShape(shape: MiniCrossword) {
    const newShape = { ...shape };
    const body = newShape.body[0];
    body.cells.forEach((cell) => {
      if (cell.answer) {
        cell.answer = "";
      }
      if (cell.moreAnswers) {
        delete cell.moreAnswers;
      }
    });
    body.clues.forEach((clue) => {
      clue.text[0].plain = "Click to edit";
      clue.text[0].formatted = "Click to edit";
      if (clue.relatives) {
        delete clue.relatives;
      }
    });
    body.SVG = {};
    newShape.constructors = [];
    return newShape;
  }

  useEffect(() => {
    document.title = "Create Custom Puzzle - Glyph";
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/custom/favicon.svg`);

    if (params.id) {
      // Existing puzzle
      pb.collection("custom_puzzles")
        .getOne(params.id)
        .then((record) => {
          if (record.puzzle == null) {
            pb.collection("shapes")
              .getFirstListItem("", { sort: "sort_order" })
              .then((shape) => {
                const newData = clearShape(shape.data as MiniCrossword);
                record.puzzle = newData;
                setRecord(record as CustomPuzzle);
                setData(newData);
              });
          } else {
            setRecord(record as CustomPuzzle);
            setDetails({ title: record.title, options: record.public ? ["public"] : [] });
            setData(record.puzzle as MiniCrossword);
          }
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load custom puzzle.");
        });
    } else {
      // No puzzle found
      setError("Custom puzzle not found.");
    }
  }, []);

  useLayoutEffect(() => {
    if (boardRef.current && data) {
      boardRef.current.innerHTML = data.body[0].board;
      const cells = boardRef.current.querySelectorAll(".cell");
      cells.forEach((cell) => {
        const parent = cell.parentElement;
        if (!parent) return;
        const index = parseInt(parent.getAttribute("data-index") || "-1", 10);
        if (isNaN(index) || index < 0) return;
        const guess: SVGTextElement | null = parent.querySelector(".guess");

        if (guess && data.body[0].cells[index] && data.body[0].cells[index].answer) {
          guess.textContent = data.body[0].cells[index].answer;
        } else if (guess) {
          guess.textContent = "";
        }

        if (data.body[0].cells[index].clues?.includes(hoveringClue)) {
          cell.classList.add("highlighted");
        }
      });
    }
  });

  async function save() {
    if (saveStatus === "saving") return;
    if (!data || !record) return;
    if (!user || !pb.authStore.isValid) {
      return;
    }
    const customPuzzles = pb.collection("custom_puzzles");
    const newRecord = {
      author: user.id,
      title: details.title || "Untitled Puzzle",
      puzzle: data,
      public: details.options.includes("public")
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
    const body = data.body[0];

    function getClueAnswer(clueIndex: number) {
      const clue = body.clues[clueIndex];
      if (!clue) return "";
      let answer = "";
      clue.cells.forEach((cellIndex) => {
        const cell = body.cells[cellIndex];
        if (cell && cell.answer) {
          answer += cell.answer;
        } else {
          answer += " ";
        }
      });
      return answer;
    }

    if (error) {
      return (
        <Center style={{ height: "100vh" }}>
          <Text>{error}</Text>
        </Center>
      );
    }

    return (
      <>
        <HStack alignItems={"stretch"} spacing={0} className={`mini-container`}>
          <VStack className="board-container">
            <div ref={boardRef} className={`board board-${type}`} dangerouslySetInnerHTML={{ __html: body.board }}></div>
            <ButtonToolbar className="toggle-container" justifyContent={"center"}>
              <Button
                startIcon={<Grid2X2PlusIcon />}
                onClick={() => {
                  if (shapesLoading) return;
                  if (shapes.length === 0) {
                    setShapesLoading(true);
                    pb.collection("shapes")
                      .getFullList({ sort: "sort_order" })
                      .then((shapes) => {
                        setShapes(shapes as CrosswordShape[]);
                        setShapesLoading(false);
                        setShapeDialogOpen(true);
                      });
                  } else {
                    setShapeDialogOpen(true);
                  }
                }}
                loading={shapesLoading}
              >
                Shape
              </Button>
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
          <div className="clues">
            {body.clueLists.map((list, index) => {
              return (
                <div key={index}>
                  <Heading level={4} style={{ textAlign: "left" }} className="clue-set">
                    {list.name}
                  </Heading>
                  <ol>
                    {list.clues.map((clueIndex) => {
                      const clue = body.clues[clueIndex];
                      if (!clue) return null;
                      return (
                        <li
                          key={clueIndex}
                          className={`clue${hoveringClue === clueIndex ? " active-clue" : ""}`}
                          onClick={() => {
                            setEditingClue(clueIndex);
                            setClueInputText(body.clues[clueIndex].text[0].plain);
                            setClueAnswerText(getClueAnswer(clueIndex));
                          }}
                          onMouseEnter={() => {
                            setHoveringClue(clueIndex);
                          }}
                          onMouseLeave={() => {
                            setHoveringClue(-1);
                          }}
                        >
                          <span className="clue-label">{clue.label}</span> <span className="clue-text">{clue.text[0].plain}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
          </div>
        </HStack>

        <Modal
          open={editingClue !== null}
          onClose={() => {
            setEditingClue(null);
          }}
        >
          <Modal.Header>
            <Modal.Title>
              <PencilIcon /> Edit Clue
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingClue !== null && (
              <>
                <VStack spacing={10}>
                  <Box width={"100%"}>
                    <Heading level={3} textAlign={"left"}>
                      Clue
                    </Heading>
                    <Input
                      value={clueInputText}
                      onChange={(e) => {
                        setClueInputText(e);
                      }}
                    />
                  </Box>
                  <div>
                    <Heading level={3} textAlign={"left"}>
                      Answer
                    </Heading>
                    <PinInput
                      length={body.clues[editingClue].cells.length}
                      attached
                      type={"alphanumeric"}
                      value={clueAnswerText}
                      onChange={(val) => {
                        setClueAnswerText(val.toUpperCase());
                      }}
                    />
                  </div>
                </VStack>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              appearance="primary"
              onClick={() => {
                const newBody = { ...body };
                newBody.clues[editingClue!].text[0].plain = clueInputText;
                newBody.clues[editingClue!].text[0].formatted = clueInputText;
                for (let i = 0; i < newBody.clues[editingClue!].cells.length; i++) {
                  const cellIndex = newBody.clues[editingClue!].cells[i];
                  if (newBody.cells[cellIndex]) {
                    newBody.cells[cellIndex].answer = clueAnswerText[i] || "";
                  }
                }
                setData({ ...data, body: [newBody] });
                setEditingClue(null);
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>

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
                  <Form.Control name="title"></Form.Control>
                </Form.Group>
                <Form.Group width={"100%"}>
                  <Form.Control name="options" accepter={CheckboxGroup}>
                    <Checkbox value={"public"}>Publish Publicly</Checkbox>
                    <Form.Text>
                      <Text muted align="left">
                        Your puzzle will be visible publicly on the custom puzzles page, but your username will only be visible to friends.
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
        <Modal open={shapeDialogOpen} onClose={() => setShapeDialogOpen(false)} size={"md"}>
          <Modal.Header>
            <Modal.Title>
              <Grid2X2PlusIcon /> Choose Shape
            </Modal.Title>

            <Modal.Body minHeight={600}>
              <Grid fluid>
                <Row gutter={10} width={"100%"}>
                  {shapes.map((shape) => (
                    <Col key={shape.id} span={{ xs: 24, sm: 12, md: 8 }}>
                      <ShapePreview
                        shape={shape}
                        onSelect={async (newShape: CrosswordShape) => {
                          setShapeDialogOpen(false);
                          if (
                            await dialog.confirm("Changing the puzzle shape will clear any existing edits.", { title: "Are you sure?" })
                          ) {
                            setData(clearShape(newShape.data));
                          } else {
                            setShapeDialogOpen(true);
                          }
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              </Grid>
            </Modal.Body>
          </Modal.Header>
        </Modal>
      </>
    );
  }
}
