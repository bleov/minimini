import Nudge from "@/Components/Nudge";
import type { CustomPuzzleData } from "@/lib/types";
import { pb } from "@/main";
import Fuse from "fuse.js";
import {
  ArrowLeftIcon,
  ArrowUpDownIcon,
  CircleXIcon,
  ExternalLinkIcon,
  EyeIcon,
  HistoryIcon,
  Link2Icon,
  LogInIcon,
  PencilIcon,
  PlusIcon,
  ShareIcon,
  SortAscIcon,
  SortDescIcon,
  StarIcon,
  Trash2Icon,
  TrophyIcon,
  UserIcon
} from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Grid,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  Panel,
  Placeholder,
  Row,
  SelectPicker,
  Stack,
  Tab,
  Tabs,
  Text,
  useDialog,
  VStack
} from "rsuite";

const defaultSortValues = {
  Completions: "completions",
  Difficulty: "avg_rating",
  "Date Updated": "updated",
  Title: "title"
};

function CreateCard() {
  const [createLoading, setCreateLoading] = useState(false);
  const navigate = useNavigate();

  function createPuzzle(type: string) {
    if (createLoading) return;
    setCreateLoading(true);
    posthog.capture("create_custom_puzzle");
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
        type,
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
  }

  if (!pb.authStore.isValid) {
    return (
      <Nudge
        body="Sign in to create and share your own puzzles"
        color="#3C6FD3"
        className="custom-puzzle-nudge icon-bg"
        width={"100%"}
        cta={
          <Link to="/#sign-in">
            <Button startIcon={<LogInIcon />} appearance="ghost">
              Sign In
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <Card bordered height={"100%"} className="puzzle-card">
      <ButtonGroup vertical>
        <Button startIcon={<PlusIcon />} textAlign={"left"} onClick={() => createPuzzle("mini")} loading={createLoading}>
          Crossword
        </Button>
        <Button startIcon={<PlusIcon />} textAlign={"left"} onClick={() => createPuzzle("connections")} loading={createLoading}>
          Connections
        </Button>
      </ButtonGroup>
    </Card>
  );
}

function PlaceholderCard() {
  return (
    <Card bordered height={"100%"} className="puzzle-card">
      <Card.Header>
        <Placeholder.Paragraph rows={1} active rowHeight={20} rowSpacing={0} />
      </Card.Header>
      <Card.Body>
        <Placeholder.Paragraph rows={2} active rowHeight={20} rowSpacing={0} />
      </Card.Body>
      <Card.Footer>
        <Placeholder.Paragraph rows={1} active rowHeight={20} rowSpacing={0} />
      </Card.Footer>
    </Card>
  );
}

function EditToolbar({ data }: { data: CustomPuzzleData }) {
  const navigate = useNavigate();
  const dialog = useDialog();

  return (
    <ButtonGroup justified width={"100%"}>
      <IconButton
        icon={<PencilIcon />}
        onClick={() => {
          navigate(`/custom/${data.id}/edit`);
        }}
      />
      <IconButton
        icon={<Trash2Icon />}
        onClick={async () => {
          if (await dialog.confirm(`"${data.title}" will be permanently deleted.`, { title: "Are you sure?" })) {
            posthog.capture("delete_custom_puzzle", { puzzleId: data.id });
            pb.collection("custom_puzzles")
              .delete(data.id)
              .then(() => {
                location.reload();
              })
              .catch((err) => {
                console.error(err);
              });
          }
        }}
      />
      <IconButton
        icon={"share" in navigator ? <ShareIcon /> : <ExternalLinkIcon />}
        onClick={() => {
          const shareData = {
            title: data.title,
            url: `${window.location.origin}/custom/${data.id}`
          };
          if ("share" in navigator && navigator.canShare(shareData)) {
            navigator.share(shareData);
          } else {
            location.href = `/custom/${data.id}`;
          }
        }}
      />
    </ButtonGroup>
  );
}

function PuzzleCard({ data, containerType }: { data: CustomPuzzleData; containerType: string }) {
  const content = (
    <Card bordered height={"100%"} className="puzzle-card">
      <Card.Header>
        <Text>{data.title}</Text>
      </Card.Header>
      <Card.Body>
        {containerType === "user" ? (
          <Text>
            {data.public ? <EyeIcon /> : <Link2Icon />} {data.public ? "Public" : "Unlisted"}
          </Text>
        ) : (
          <Text>by {data.author_name}</Text>
        )}
        <Text>
          <TrophyIcon /> {data.completions} <StarIcon /> {data.avg_rating.toFixed(1)}
        </Text>
      </Card.Body>
      <Card.Footer>
        <VStack spacing={10} width={"100%"}>
          <Text muted>
            <HistoryIcon /> {new Date(data.updated).toLocaleDateString()}
          </Text>
          {containerType === "user" && <EditToolbar data={data} />}
        </VStack>
      </Card.Footer>
    </Card>
  );

  if (containerType === "user") {
    return content;
  }
  return <Link to={`/custom/${data.id}`}>{content}</Link>;
}

function SortOptions({
  setSort,
  sortValues,
  disabled = false
}: {
  setSort: (sort: string) => void;
  sortValues?: Record<string, string>;
  disabled?: boolean;
}) {
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
    <Stack direction="row" spacing={5}>
      <SelectPicker
        searchable={false}
        data={Object.entries(sortValues).map(([label, value]) => ({ label, value }))}
        value={sortValue}
        onChange={(value) => {
          setSortValue(value!);
        }}
        cleanable={false}
        label={<ArrowUpDownIcon />}
        disabled={disabled}
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
        disabled={disabled}
      />
    </Stack>
  );
}

function PuzzleGrid({ type, active }: { type: string; active: boolean }) {
  const [data, setData] = useState<CustomPuzzleData[]>([]);
  const [sort, setSort] = useState(() => {
    if (type === "user") {
      return "-updated";
    }
    return "-completions";
  });
  const [loading, setLoading] = useState(false);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const lastLength = useRef(8);
  if (type === "user") {
    lastLength.current = 7;
  }

  const typeValues: Record<string, string> = {
    crossword: "mini"
  };
  const puzzleData = pb.collection("custom_puzzle_data");

  useEffect(() => {
    (async () => {
      if (!pb.authStore.isValid && type === "user") {
        setLoading(false);
        setData([]);
        return;
      }
      if (active) {
        try {
          setLoading(true);
          let filter = "";
          if (type !== "user") {
            filter += `type="${typeValues[type] ?? type}"`;
            filter += "&&public=true";
          } else {
            filter += `author="${pb.authStore.record?.id}"`;
          }
          const puzzles = await puzzleData.getFullList({
            filter,
            fields: "id,author_name,title,public,type,created,updated,avg_rating,completions",
            sort
          });
          setData(puzzles as unknown as CustomPuzzleData[]);
          lastLength.current = puzzles.length;
        } catch (err) {
          console.error(err);
          setLoadingFailed(true);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [type, active, sort]);

  const fuse = useMemo(() => {
    const fuse = new Fuse(data, {
      keys: [
        { name: "title", weight: 2 },
        { name: "author_name", weight: 1 }
      ],
      threshold: 0.3
    });
    return fuse;
  }, [data]);

  const cardSpan = {
    xs: 24,
    sm: 12,
    md: 8,
    lg: 6,
    xl: 6,
    xxl: 4
  };

  let puzzles = [...data];
  if (searchValue) {
    const results = fuse.search(searchValue);
    puzzles = results.map((result) => result.item);
  }

  let sortValues: Record<string, string> = defaultSortValues;
  if (type === "user") {
    sortValues = {
      "Date Updated": "updated",
      "Date Created": "created",
      Title: "title",
      Completions: "completions"
    };
  }

  if (loadingFailed) {
    return (
      <VStack alignItems={"center"} justifyContent={"center"} marginTop={30}>
        <CircleXIcon fontSize={35} />
        <Text size={"md"}>Something went wrong</Text>
      </VStack>
    );
  }

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "column", md: "row" }}
        width="100%"
        paddingLeft={5}
        paddingRight={15}
        paddingTop={0}
        paddingBottom={10}
        className="custom-puzzle-search-container"
      >
        <Input placeholder="Find puzzles" value={searchValue} onChange={setSearchValue}></Input>
        <SortOptions setSort={setSort} sortValues={sortValues} disabled={searchValue.trim() !== ""} />
      </Stack>
      <Grid fluid>
        <Row gutter={10} width={"100%"}>
          {type === "user" && searchValue.trim() === "" && (
            <Col span={cardSpan}>
              <CreateCard />
            </Col>
          )}
          {loading &&
            new Array(lastLength.current).fill(0).map((_, i) => (
              <Col key={i} span={cardSpan}>
                <PlaceholderCard />
              </Col>
            ))}
          {!loading &&
            puzzles.map((puzzle) => (
              <Col key={puzzle.id} span={cardSpan}>
                <PuzzleCard data={puzzle} containerType={type} />
              </Col>
            ))}
        </Row>
      </Grid>
    </>
  );
}

export default function CustomPage() {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem("custom-active-tab");
    if (savedTab === "user" || savedTab === "crossword" || savedTab === "connections" /*|| savedTab === "wordle"*/) {
      return savedTab;
    }
    return "crossword";
  });

  useEffect(() => {
    sessionStorage.setItem("custom-active-tab", activeTab);
  }, [activeTab]);

  return (
    <>
      <HStack marginBottom={10}>
        <Link to="/">
          <IconButton icon={<ArrowLeftIcon />} appearance="subtle" />
        </Link>
        <Heading level={3} textAlign={"left"} fontWeight={"normal"}>
          Custom Puzzles
        </Heading>
      </HStack>
      <Panel bordered width={"100%"} height={"70vh"} className="custom-puzzles-container">
        <Tabs activeKey={activeTab} onSelect={(e) => setActiveTab(e as string)}>
          <Tab title="My Puzzles" eventKey="user" icon={<UserIcon />}>
            <PuzzleGrid type="user" active={activeTab === "user"} />
          </Tab>
          <Tab
            title="Crosswords"
            eventKey="crossword"
            icon={<Image src="/icons/midi/favicon.svg" width={16} height={16} draggable={false} />}
          >
            <PuzzleGrid type="crossword" active={activeTab === "crossword"} />
          </Tab>
          <Tab
            title="Connections"
            eventKey="connections"
            icon={<Image src="/icons/connections/favicon.svg" width={16} height={16} draggable={false} />}
          >
            <PuzzleGrid type="connections" active={activeTab === "connections"} />
          </Tab>
          {/*<Tab title="Wordle" eventKey="wordle" icon={<Image src="/icons/wordle/favicon.svg" width={16} height={16} draggable={false} />}>
            <PuzzleGrid type="wordle" active={activeTab === "wordle"} />
          </Tab>*/}
        </Tabs>
      </Panel>
    </>
  );
}
