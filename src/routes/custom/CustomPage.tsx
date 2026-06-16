import Nudge from "@/Components/Nudge";
import type { CustomPuzzleData } from "@/lib/types";
import { pb } from "@/main";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, HistoryIcon, LogInIcon, PlusIcon, StarIcon, TrophyIcon, UserIcon } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Card,
  Center,
  Col,
  Grid,
  Heading,
  HStack,
  IconButton,
  Image,
  Panel,
  Placeholder,
  Row,
  Tab,
  Tabs,
  Text,
  VStack
} from "rsuite";

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

function PuzzleCard({ data, containerType }: { data: CustomPuzzleData; containerType: string }) {
  return (
    <Link to={`/custom/${data.id}${containerType === "user" ? "/edit" : ""}`}>
      <Card bordered height={"100%"} className="puzzle-card">
        <Card.Header>
          <Text>{data.title}</Text>
        </Card.Header>
        <Card.Body>
          {containerType === "user" ? (
            <Text>
              {data.public ? <EyeIcon /> : <EyeOffIcon />} {data.public ? "Public" : "Private"}
            </Text>
          ) : (
            <Text>by {data.author_name}</Text>
          )}
          <Text>
            <TrophyIcon /> {data.completions} <StarIcon /> {data.avg_rating.toFixed(1)}
          </Text>
        </Card.Body>
        <Card.Footer>
          <Text muted>
            <HistoryIcon /> {new Date(data.updated).toLocaleDateString()}
          </Text>
        </Card.Footer>
      </Card>
    </Link>
  );
}

function PuzzleGrid({ type, active }: { type: string; active: boolean }) {
  const [data, setData] = useState<CustomPuzzleData[]>([]);
  const [loading, setLoading] = useState(false);

  const typeValues: Record<string, string> = {
    crossword: "mini"
  };
  const puzzleData = pb.collection("custom_puzzle_data");

  useEffect(() => {
    (async () => {
      if (data.length == 0 && active) {
        setLoading(true);
        let filter = "";
        let sort = "-completions";
        if (type !== "user") {
          filter += `type="${typeValues[type] ?? type}"`;
          filter += "&&public=true";
        } else {
          filter += `author="${pb.authStore.record?.id}"`;
          sort = "-updated";
        }
        const puzzles = await puzzleData.getFullList({
          filter,
          fields: "id,author_name,title,public,type,created,updated,avg_rating,completions",
          sort
        });
        console.log(puzzles);
        setData(puzzles as unknown as CustomPuzzleData[]);
        setLoading(false);
      }
    })();
  }, [type, active]);

  const cardSpan = {
    xs: 24,
    sm: 12,
    md: 8,
    lg: 6,
    xl: 4
  };

  return (
    <Grid fluid>
      <Row gutter={10} width={"100%"}>
        {type === "user" && (
          <Col span={cardSpan}>
            <CreateCard />
          </Col>
        )}
        {loading &&
          new Array(8).fill(0).map((_, i) => (
            <Col key={i} span={cardSpan}>
              <PlaceholderCard />
            </Col>
          ))}
        {!loading &&
          data.map((puzzle) => (
            <Col key={puzzle.id} span={cardSpan}>
              <PuzzleCard data={puzzle} containerType={type} />
            </Col>
          ))}
      </Row>
    </Grid>
  );
}

export default function CustomPage() {
  const [activeTab, setActiveTab] = useState("crossword");
  const navigate = useNavigate();

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
