import Nudge from "@/Components/Nudge";
import type { CustomPuzzleData } from "@/lib/types";
import { pb } from "@/main";
import {
  ArrowLeftIcon,
  ArrowUpDownIcon,
  ExternalLinkIcon,
  FilterIcon,
  LogInIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  ShareIcon,
  SortAscIcon,
  SortDescIcon,
  StarIcon,
  TrashIcon,
  TrophyIcon
} from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";
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
  SelectPicker,
  Stack,
  Text,
  useDialog,
  VStack
} from "rsuite";

const defaultSortValues = {
  Completions: "completions",
  Difficulty: "avg_rating",
  "Date Created": "created",
  "Date Updated": "updated",
  Title: "title"
};

function SortOptions({ setSort, sortValues }: { setSort: (sort: string) => void; sortValues?: Record<string, string> }) {
  const [sortValue, setSortValue] = useState<string>(Object.values(sortValues ?? defaultSortValues)[0] || "completions");
  const [sortOrder, setSortOrder] = useState<string>("-");

  if (!sortValues) {
    sortValues = defaultSortValues;
  }

  const sortOrders = {
    Descending: "-",
    Ascending: "+"
  };

  useEffect(() => {
    setSort(`${sortOrder}${sortValue}`);
  }, [sortValue, sortOrder]);

  return (
    <HStack spacing={5}>
      <SelectPicker
        searchable={false}
        data={Object.entries(sortValues).map(([label, value]) => ({ label, value }))}
        value={sortValue}
        onChange={(value) => {
          setSortValue(value!);
        }}
        cleanable={false}
        label={<ArrowUpDownIcon />}
      />
      <SelectPicker
        searchable={false}
        data={Object.entries(sortOrders).map(([label, value]) => ({ label, value }))}
        value={sortOrder}
        onChange={(value) => {
          setSortOrder(value!);
        }}
        cleanable={false}
        label={sortOrder === "-" ? <SortDescIcon /> : <SortAscIcon />}
      />
    </HStack>
  );
}

function UserPuzzles({ userPuzzles }: { userPuzzles: CustomPuzzleData[] }) {
  const [userSort, setUserSort] = useState<string>("-updated");
  const navigate = useNavigate();
  const dialog = useDialog();

  const puzzles = useMemo(() => {
    return userPuzzles.sort((a, b) => {
      const sortKey = userSort.replace(/^-|\+/, "");
      const sortOrder = userSort.startsWith("-") ? -1 : 1;
      if (sortKey === "title") {
        return a.title.localeCompare(b.title) * sortOrder;
      }
      if (sortKey === "created" || sortKey === "updated") {
        return (new Date(a[sortKey]).getTime() - new Date(b[sortKey]).getTime()) * sortOrder;
      }
      return ((a as any)[sortKey] - (b as any)[sortKey]) * sortOrder;
    });
  }, [userPuzzles, userSort]);

  return (
    <VStack width={400} spacing={10}>
      <Heading level={3}>My Puzzles</Heading>
      {puzzles.length > 0 ? (
        <VStack spacing={5}>
          <SortOptions
            setSort={setUserSort}
            sortValues={{
              "Dated Updated": "updated",
              "Date Created": "created",
              Title: "title"
            }}
          />
          <List bordered width={400} maxHeight={56 * 4 + 5}>
            {puzzles.map((puzzle) => (
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
                          posthog.capture("delete_custom_puzzle", { puzzleId: puzzle.id });
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
        </VStack>
      ) : (
        <Text align="center" width={"100%"}>
          You haven't created any puzzles yet.
        </Text>
      )}
    </VStack>
  );
}

function PublicPuzzles({ puzzles, sort, setSort }: { puzzles: CustomPuzzleData[]; sort: string; setSort: (sort: string) => void }) {
  return (
    <VStack width={400} spacing={10}>
      <Heading level={3}>Public Puzzles</Heading>
      <VStack spacing={5}>
        <SortOptions setSort={setSort} />
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
    </VStack>
  );
}

interface CustomPageProps {
  type: "crossword" | "connections";
}

export default function CustomPage({ type }: CustomPageProps) {
  const [userPuzzles, setUserPuzzles] = useState<CustomPuzzleData[]>([]);
  const [puzzles, setPuzzles] = useState<CustomPuzzleData[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [sort, setSort] = useState("-completions");

  const navigate = useNavigate();
  let typeFilter = "";
  let defaultType = "";

  if (type === "connections") {
    typeFilter = `type="connections"`;
    defaultType = "connections";
  } else {
    typeFilter = `type!="connections"`;
    defaultType = "mini";
  }

  useEffect(() => {
    pb.collection("custom_puzzle_data")
      .getFullList({
        fields: "id, author, author_name, title, public, type, created, updated, avg_rating, completions",
        sort,
        filter: typeFilter
      })
      .then((puzzles) => {
        if (pb.authStore.isValid && pb.authStore.record) {
          const userPuzzles = puzzles.filter((puzzle) => puzzle.author === pb.authStore.record?.id);
          setUserPuzzles(userPuzzles as CustomPuzzleData[]);
          puzzles = puzzles.filter((puzzle) => puzzle.public === true);
        }
        setPuzzles(puzzles as CustomPuzzleData[]);
      });
  }, [sort]);

  useEffect(() => {
    document.title = "Custom Puzzles - Glyph";
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/custom_${type}/favicon.svg`);
  }, []);

  return (
    <VStack spacing={15}>
      <VStack spacing={3} width={"100%"}>
        <Center width={"100%"}>
          <Image src={`/icons/custom_${type}/pwa-192x192.png`} width={48} />
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
                posthog.capture("create_custom_puzzle", { type });
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
                    type: defaultType,
                    shape: null
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
          <VStack spacing={15}>
            <ButtonToolbar width={"100%"} justify={"center"}>
              <Button
                startIcon={<ArrowLeftIcon />}
                onClick={() => {
                  navigate("/");
                }}
              >
                Back
              </Button>
            </ButtonToolbar>
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
          </VStack>
        )}
      </Center>

      <Center width={"100%"}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={15}>
          {pb.authStore.isValid && <UserPuzzles userPuzzles={userPuzzles} />}
          <PublicPuzzles puzzles={puzzles} sort={sort} setSort={setSort} />
        </Stack>
      </Center>
    </VStack>
  );
}
