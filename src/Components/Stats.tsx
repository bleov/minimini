import { formatDuration } from "@/lib/formatting";
import type { UserRecord } from "@/lib/types";
import { pb } from "@/main";
import { ChartNoAxesColumnIcon, ClockIcon, HashIcon, RabbitIcon, TurtleIcon } from "lucide-react";
import type { RecordModel } from "pocketbase";
import { useEffect, useState } from "react";
import { HStack, Image, Loader, Modal, ProgressCircle, Stat, StatGroup, Tabs, useBreakpointValue, VStack } from "rsuite";

interface StatsRecord extends RecordModel {
  id: string;
  lowest_time: number;
  lowest_time_id: number;
  highest_time: number;
  highest_time_id: number;
  num_completed: number;
  average_time: number;
  num_cheated: number;
  num_desktop: number;
}

const emptyStats: StatsRecord = {
  id: "",
  lowest_time: 0,
  lowest_time_id: 0,
  highest_time: 0,
  highest_time_id: 0,
  num_completed: 0,
  average_time: 0,
  num_cheated: 0,
  num_desktop: 0,
  collectionId: "",
  collectionName: ""
};

function formatPublicationDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(undefined, { timeZone: "UTC" });
}

function CrosswordStats({
  type,
  user,
  open,
  setOpen
}: {
  type: "mini" | "daily" | "midi";
  user?: UserRecord;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [data, setData] = useState<StatsRecord>(emptyStats);
  const [loaded, setLoaded] = useState(false);
  const [fastestTimeDate, setFastestTimeDate] = useState<string | null>(null);
  const [slowestTimeDate, setSlowestTimeDate] = useState<string | null>(null);

  const columns = useBreakpointValue({
    xs: 1,
    sm: 2
  });

  data.lowest_time ??= 0;

  const totalDesktop = data.num_desktop;
  const totalMobile = data.num_completed - data.num_desktop;

  let platformPercent = 0;
  if (totalDesktop > totalMobile) {
    platformPercent = Math.floor((data.num_desktop / Math.max(data.num_completed, 1)) * 100);
  } else {
    platformPercent = Math.floor((totalMobile / Math.max(data.num_completed, 1)) * 100);
  }

  const cheatedPercent = Math.floor((data.num_cheated / Math.max(data.num_completed, 1)) * 100);

  useEffect(() => {
    if (!loaded && open) {
      async function fetchData() {
        if (!pb.authStore?.record) {
          setData(emptyStats);
          setOpen(false);
          return;
        }
        let response: StatsRecord;
        try {
          response = (await pb.collection(`user_${type}_stats`).getOne(user?.id ?? pb.authStore.record.id)) as StatsRecord;
        } catch (err) {
          console.error(err);
          setData(emptyStats);
          setLoaded(true);
          return;
        }
        try {
          const slowestTimeDoc = await pb
            .collection("archive")
            .getFirstListItem(`${type}_id=${response.highest_time_id}`, { fields: "publication_date" });
          const fastestTimeDoc = await pb
            .collection("archive")
            .getFirstListItem(`${type}_id=${response.lowest_time_id}`, { fields: "publication_date" });
          setFastestTimeDate(formatPublicationDate(fastestTimeDoc.publication_date));
          setSlowestTimeDate(formatPublicationDate(slowestTimeDoc.publication_date));
        } catch (err) {
          console.error("Error fetching puzzle dates:", err);
        }
        setData(response);
        setLoaded(true);
      }
      fetchData();
    }
  }, [open, loaded]);

  return (
    <>
      <StatGroup columns={columns}>
        <Stat bordered>
          <Stat.Label>
            <HashIcon /> Completed
          </Stat.Label>
          <Stat.Value>{data.num_completed}</Stat.Value>
        </Stat>
        <Stat bordered>
          <Stat.Label>
            <ClockIcon /> Average Time
          </Stat.Label>
          <Stat.Value>{formatDuration(Math.round(data.average_time))}</Stat.Value>
        </Stat>
        <Stat bordered>
          <Stat.Label>
            <RabbitIcon /> Fastest Time
          </Stat.Label>
          <Stat.Value>{formatDuration(Math.round(data.lowest_time))}</Stat.Value>
          {fastestTimeDate && <Stat.HelpText>{fastestTimeDate}</Stat.HelpText>}
        </Stat>
        <Stat bordered>
          <Stat.Label>
            <TurtleIcon /> Slowest Time
          </Stat.Label>
          <Stat.Value>{formatDuration(Math.round(data.highest_time))}</Stat.Value>
          {slowestTimeDate && <Stat.HelpText>{slowestTimeDate}</Stat.HelpText>}
        </Stat>
        <Stat bordered>
          <HStack spacing={16}>
            <ProgressCircle percent={cheatedPercent} w={50} strokeWidth={10} trailWidth={10} />
            <VStack>
              <Stat.Label>Cheated Puzzles</Stat.Label>
              <Stat.Value>{data.num_cheated}</Stat.Value>
            </VStack>
          </HStack>
        </Stat>
        <Stat bordered>
          <HStack spacing={16}>
            <ProgressCircle percent={platformPercent} w={50} strokeWidth={10} trailWidth={10} />
            <VStack>
              <Stat.Label>Most Used Platform</Stat.Label>
              <Stat.Value>{totalDesktop == totalMobile ? "Equal" : totalDesktop > totalMobile ? `Desktop` : `Mobile`}</Stat.Value>
            </VStack>
          </HStack>
        </Stat>
      </StatGroup>
      {!loaded && <Loader center backdrop />}
    </>
  );
}

export function Stats({
  open,
  setOpen,
  type,
  user
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  type: "mini" | "daily" | "midi";
  user?: UserRecord;
}) {
  return (
    <Modal open={open} onClose={() => setOpen(false)} centered size={"sm"}>
      <Modal.Header closeButton>
        <Modal.Title>
          <ChartNoAxesColumnIcon /> Stats
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "400px" }}>
        <Tabs defaultActiveKey={type}>
          <Tabs.Tab eventKey="mini" title="Mini" icon={<Image src="/icons/mini/favicon.svg" width={16} height={16} />}>
            <CrosswordStats type="mini" user={user} open={open} setOpen={setOpen} />
          </Tabs.Tab>
          <Tabs.Tab eventKey="midi" title="Midi" icon={<Image src="/icons/midi/favicon.svg" width={16} height={16} />}>
            <CrosswordStats type="midi" user={user} open={open} setOpen={setOpen} />
          </Tabs.Tab>
          <Tabs.Tab eventKey="daily" title="Daily" icon={<Image src="/icons/daily/favicon.svg" width={16} height={16} />}>
            <CrosswordStats type="daily" user={user} open={open} setOpen={setOpen} />
          </Tabs.Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
}
