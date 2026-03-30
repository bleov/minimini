import type { CustomPuzzle } from "@/lib/types";
import { pb } from "@/main";
import { ArrowLeftIcon, EyeIcon, LayoutGridIcon, PencilIcon, PlayIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button, ButtonGroup, ButtonToolbar, Center, Heading, HStack, IconButton, Image, List, Text, useDialog, VStack } from "rsuite";

export default function Custom() {
  const [userPuzzles, setUserPuzzles] = useState<CustomPuzzle[]>([]);
  const [puzzles, setPuzzles] = useState<CustomPuzzle[]>([]);
  const [createLoading, setCreateLoading] = useState(false);

  const navigate = useNavigate();
  const dialog = useDialog();

  useEffect(() => {
    pb.collection("custom_puzzles")
      .getFullList({ expand: "author" })
      .then((puzzles) => {
        if (pb.authStore.isValid && pb.authStore.record) {
          const userPuzzles = puzzles.filter((puzzle) => puzzle.author === pb.authStore.record?.id);
          setUserPuzzles(userPuzzles as CustomPuzzle[]);
          puzzles = puzzles.filter((puzzle) => puzzle.public === true);
        }
        setPuzzles(puzzles as CustomPuzzle[]);
      });
  }, []);

  return (
    <VStack spacing={15}>
      <VStack spacing={3} width={"100%"}>
        <Center width={"100%"}>
          <Image src={`/icons/custom/pwa-192x192.png`} width={48} />
        </Center>
        <Heading level={1} className="merriweather-display">
          Custom Puzzles
        </Heading>
      </VStack>
      {pb.authStore.isValid && (
        <Center width={"100%"}>
          <ButtonToolbar>
            <Button
              startIcon={<ArrowLeftIcon />}
              onClick={() => {
                navigate("/");
              }}
            >
              Back
            </Button>
            <Button
              appearance="default"
              startIcon={<PlusIcon />}
              loading={createLoading}
              onClick={() => {
                if (createLoading) return;
                setCreateLoading(true);
                const idDigits = new Array(15)
                  .fill(0)
                  .map(() => Math.floor(Math.random() * 9))
                  .join("");
                pb.collection("custom_puzzles")
                  .create({
                    id: idDigits,
                    title: "Untitled Puzzle",
                    author: pb.authStore.record?.id,
                    puzzle: null,
                    public: false,
                    type: "mini"
                  })
                  .then((record) => {
                    setCreateLoading(false);
                    navigate(`/custom/${record.id}/edit`);
                  })
                  .catch((err) => {
                    setCreateLoading(false);
                    console.error(err);
                  });
              }}
            >
              Create
            </Button>
          </ButtonToolbar>
        </Center>
      )}

      <Center width={"100%"}>
        {pb.authStore.isValid && (
          <VStack>
            <Heading level={3}>My Puzzles</Heading>
            {userPuzzles.length > 0 ? (
              <List bordered width={400} maxHeight={56 * 4 + 5}>
                {userPuzzles.map((puzzle) => (
                  <List.Item key={puzzle.id}>
                    <HStack justifyContent="space-between" spacing={15}>
                      <VStack spacing={0}>
                        <Text>{puzzle.title}</Text>
                        <Text muted>{puzzle.public ? "Public" : "Private"}</Text>
                      </VStack>
                      <ButtonGroup width={"fit-content"}>
                        <IconButton
                          icon={<EyeIcon />}
                          onClick={() => {
                            navigate(`/custom/${puzzle.id}`);
                          }}
                        />
                        <IconButton
                          icon={<PencilIcon />}
                          onClick={() => {
                            navigate(`/custom/${puzzle.id}/edit`);
                          }}
                        />
                        <IconButton
                          icon={<TrashIcon />}
                          onClick={async () => {
                            if (await dialog.confirm(`"${puzzle.title}" will be permanently deleted.`, { title: "Are you sure?" })) {
                              pb.collection("custom_puzzles")
                                .delete(puzzle.id)
                                .then(() => {
                                  location.reload();
                                })
                                .catch((err) => {
                                  console.error(err);
                                });
                            }
                          }}
                        />
                      </ButtonGroup>
                    </HStack>
                  </List.Item>
                ))}
              </List>
            ) : (
              <Text>You haven't created any puzzles yet.</Text>
            )}
          </VStack>
        )}
      </Center>
      <Center width={"100%"}>
        <VStack>
          <Heading level={3}>Public Puzzles</Heading>
          <List bordered width={400} maxHeight={56 * 4 + 5}>
            {puzzles.map((puzzle) => (
              <List.Item key={puzzle.id}>
                <HStack justifyContent="space-between" spacing={15}>
                  <VStack spacing={0}>
                    <Text>{puzzle.title}</Text>
                    <Text muted>{puzzle.expand?.author?.username ?? "Unknown User"}</Text>
                  </VStack>
                  <ButtonGroup width={"fit-content"}>
                    <Link to={`/custom/${puzzle.id}`}>
                      <IconButton icon={<PlayIcon />} />
                    </Link>
                  </ButtonGroup>
                </HStack>
              </List.Item>
            ))}
          </List>
        </VStack>
      </Center>
    </VStack>
  );
}
