import Nudge from "@/Components/Nudge";
import type { CustomPuzzle, CustomPuzzleData } from "@/lib/types";
import { pb } from "@/main";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  LogInIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
  TrophyIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Center,
  Heading,
  HStack,
  IconButton,
  Image,
  List,
  Placeholder,
  Stack,
  Text,
  useDialog,
  VStack
} from "rsuite";

function UserPuzzles({ userPuzzles }: { userPuzzles: CustomPuzzleData[] }) {
  const navigate = useNavigate();
  const dialog = useDialog();

  return (
    <VStack width={400}>
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
                    icon={"share" in navigator ? <ShareIcon /> : <ExternalLinkIcon />}
                    onClick={() => {
                      const shareData = {
                        title: puzzle.title,
                        url: `${window.location.origin}/custom/${puzzle.id}`
                      };
                      if ("share" in navigator && navigator.canShare(shareData)) {
                        navigator.share(shareData);
                      } else {
                        location.href = `/custom/${puzzle.id}`;
                      }
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
        <Text align="center" width={"100%"}>
          You haven't created any puzzles yet.
        </Text>
      )}
    </VStack>
  );
}

function PublicPuzzles({ puzzles }: { puzzles: CustomPuzzleData[] }) {
  return (
    <VStack width={400}>
      <Heading level={3}>Public Puzzles</Heading>
      <List bordered width={400} maxHeight={56 * 4 + 5}>
        {puzzles.map((puzzle) => (
          <List.Item key={puzzle.id}>
            <HStack justifyContent="space-between" spacing={15}>
              <VStack spacing={0}>
                <Text>{puzzle.title}</Text>
                <Text muted>
                  <TrophyIcon /> {puzzle.completions} <StarIcon /> {puzzle.avg_rating.toFixed(1)} {puzzle.author_name}
                </Text>
              </VStack>
              <ButtonGroup width={"fit-content"}>
                <Link to={`/custom/${puzzle.id}`}>
                  <IconButton icon={<PlayIcon />} />
                </Link>
              </ButtonGroup>
            </HStack>
          </List.Item>
        ))}
        {puzzles.length === 0 &&
          new Array(4).fill(0).map((_, i) => (
            <List.Item key={i}>
              <Placeholder.Paragraph rows={2} active />
            </List.Item>
          ))}
      </List>
    </VStack>
  );
}

export default function Custom() {
  const [userPuzzles, setUserPuzzles] = useState<CustomPuzzleData[]>([]);
  const [puzzles, setPuzzles] = useState<CustomPuzzleData[]>([]);
  const [createLoading, setCreateLoading] = useState(false);

  const navigate = useNavigate();
  const dialog = useDialog();

  useEffect(() => {
    pb.collection("custom_puzzle_data")
      .getFullList({
        fields: "id, author, author_name, title, public, type, created, updated, avg_rating, completions",
        sort: "-completions"
      })
      .then((puzzles) => {
        if (pb.authStore.isValid && pb.authStore.record) {
          const userPuzzles = puzzles.filter((puzzle) => puzzle.author === pb.authStore.record?.id);
          setUserPuzzles(userPuzzles as CustomPuzzleData[]);
          puzzles = puzzles.filter((puzzle) => puzzle.public === true);
        }
        setPuzzles(puzzles as CustomPuzzleData[]);
      });
  }, []);

  useEffect(() => {
    document.title = "Custom Puzzles - Glyph";
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/custom/favicon.svg`);
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
      <Center width={"100%"}>
        {pb.authStore.isValid ? (
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
                let idDigits = new Array(15)
                  .fill(0)
                  .map(() => Math.floor(Math.random() * 9))
                  .join("");
                if (idDigits.startsWith("0")) {
                  idDigits = "1" + idDigits.slice(1);
                }
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
        ) : (
          <Nudge
            title="Sign in to create puzzles"
            body="With an account, you can create and share custom crossword puzzles"
            color="#3C6FD3"
            className="custom-puzzle-nudge icon-bg"
            cta={
              <Link to="/#sign-in">
                <Button startIcon={<LogInIcon />} appearance="ghost">
                  Sign In
                </Button>
              </Link>
            }
          />
        )}
      </Center>

      <Center width={"100%"}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={15}>
          {pb.authStore.isValid && <UserPuzzles userPuzzles={userPuzzles} />}
          <PublicPuzzles puzzles={puzzles} />
        </Stack>
      </Center>
    </VStack>
  );
}
