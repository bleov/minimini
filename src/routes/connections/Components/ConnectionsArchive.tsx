import { useEffect, useRef, useState } from "react";
import { Badge, Box, Button, Calendar, Center, Heading, HStack, IconButton, Loader, Text, VStack } from "rsuite";
import type { ArchiveRecord, ArchiveStateRecord, BasicArchiveRecord, ConnectionsGame } from "@/lib/types";
import { pb } from "@/main";
import { getButtonText, getMonthFilter } from "@/lib/formatting";
import { ArchiveIcon, ArrowLeftIcon, CircleCheckIcon, CircleIcon, HourglassIcon } from "lucide-react";
import { Link } from "react-router";

export default function ConnectionsArchive() {
  const [data, setData] = useState<BasicArchiveRecord[] | null>(null);
  const [puzzleStates, setPuzzleStates] = useState<ArchiveStateRecord[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split("T")[0];
  });
  const [selectedPuzzleState, setSelectedPuzzleState] = useState<string>("unset");
  const dataCache = useRef<{ [month: string]: BasicArchiveRecord[] }>({});
  const puzzleStateCache = useRef<{ [month: string]: ArchiveStateRecord[] }>({});

  const archive = pb.collection("archive");
  const connectionsState = pb.collection("connections_state");

  useEffect(() => {
    if (!data) {
      async function fetchData() {
        const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
        const monthFilter = getMonthFilter(selectedDateObj);
        if (dataCache.current[monthFilter]) {
          setData(dataCache.current[monthFilter]);
          setPuzzleStates(puzzleStateCache.current[monthFilter]);
          return;
        }
        const list = (await archive.getFullList({
          fields: "connections_id,publication_date,id",
          filter: `connections_id!=0 && ${monthFilter}`
        })) as BasicArchiveRecord[];

        let stateFilter = `user="${pb.authStore?.record?.id}" && ${monthFilter.replace("publication", "puzzle")}`;

        let completed: ArchiveStateRecord[] = [];

        if (list.length > 0) {
          completed = (await connectionsState.getFullList({
            fields: "puzzle_id,complete",
            filter: stateFilter
          })) as ArchiveStateRecord[];
        }

        setData(list);
        setPuzzleStates(completed ?? []);
        dataCache.current[getMonthFilter(new Date(selectedDate))] = list;
        puzzleStateCache.current[getMonthFilter(new Date(selectedDate))] = completed ?? [];
      }
      fetchData();
    }
  }, [data]);

  function onSelectionChange() {
    if (selectedDate && data) {
      const puzzle = data.find((r) => r.publication_date === selectedDate);
      if (!puzzle) {
        setSelectedPuzzleState("not-found");
        return;
      }
      const puzzleState = puzzleStates?.find((ps) => ps.puzzle_id === puzzle.connections_id);
      if (puzzleState) {
        if (puzzleState.complete) {
          setSelectedPuzzleState("completed");
        } else {
          setSelectedPuzzleState("incomplete");
        }
      } else {
        setSelectedPuzzleState("not-started");
      }
    }
  }

  useEffect(onSelectionChange, [selectedDate]);
  useEffect(onSelectionChange, [data, puzzleStates]);

  function onMonthChange(newMonth: Date) {
    if (dataCache.current[getMonthFilter(newMonth)] === undefined) {
      setData(null);
      setPuzzleStates(null);
    } else {
      const monthKey = getMonthFilter(newMonth);
      setData(dataCache.current[monthKey] || null);
      setPuzzleStates(puzzleStateCache.current[monthKey] || null);
    }
  }

  return (
    <VStack>
      <HStack paddingLeft={10}>
        <Link to="/">
          <IconButton icon={<ArrowLeftIcon />} appearance="subtle" />
        </Link>
        <Heading level={3} textAlign={"left"} fontWeight={"normal"}>
          Connections Archive
        </Heading>
      </HStack>
      <Calendar
        bordered
        compact
        maxWidth={520}
        width={"95vw"}
        onChange={(date) => {
          const adjustedDate = new Date(date);
          adjustedDate.setHours(0, 0, 0, 0);
          const day = adjustedDate.toISOString().split("T")[0];
          setSelectedDate(day);
        }}
        renderCell={(date) => {
          const day = date.toISOString().split("T")[0];
          const puzzle = data?.find((r) => r.publication_date === day);
          if (!puzzle) {
            return <CircleIcon visibility={"hidden"} className="archive-badge-icon" />;
          }
          const puzzleState = puzzleStates?.find((ps) => ps.puzzle_id === puzzle.connections_id);
          if (puzzleState?.complete) {
            return <CircleCheckIcon className="archive-badge-icon archive-badge-icon-completed" />;
          }
          if (puzzleState) {
            return <HourglassIcon className="archive-badge-icon archive-badge-icon-incomplete" />;
          }
          return <Badge className="archive-badge" />;
        }}
        defaultValue={
          selectedDate ? new Date(new Date(selectedDate).getTime() + new Date(selectedDate).getTimezoneOffset() * 60000) : undefined
        }
        weekStart={0}
        onMonthChange={onMonthChange}
      />
      <Center width={"100%"}>
        <Button
          className="archive-action-button"
          disabled={selectedPuzzleState === "not-found"}
          appearance="primary"
          onClick={() => {
            if (!data || !selectedDate) return;
            location.href = `/connections/${selectedDate}`;
          }}
        >
          {getButtonText(selectedPuzzleState)}
        </Button>
      </Center>
      {(!data || !puzzleStates) && <Loader center backdrop />}
    </VStack>
  );
}
