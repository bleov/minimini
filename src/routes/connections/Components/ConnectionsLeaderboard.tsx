import { LogInIcon, TrophyIcon, UsersIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button, Center, Loader, Modal } from "rsuite";
import { Table } from "rsuite/Table";
import { GlobalState } from "@/lib/GlobalState";
import type { ConnectionsGame, ConnectionsLeaderboardRecord, LeaderboardRecord, StateRecord } from "@/lib/types";
import { pb } from "@/main";
import Nudge from "@/Components/Nudge";
import { FriendsNudge, LeaderboardNudge } from "@/Components/Leaderboard";

const categoryEmojis = ["🟨", "🟩", "🟦", "🟪"];

interface RankedLeaderboardRecord extends ConnectionsLeaderboardRecord {
  points: number;
}

export default function ConnectionsLeaderboard({
  open,
  onClose,
  puzzleData
}: {
  open: boolean;
  onClose: () => void;
  puzzleData: ConnectionsGame;
}) {
  const [loading, setLoading] = useState(true);
  // Safari and Chromium seem to have issues with rendering the Table component while the modal is animating, especially on high dpi displays.
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<RankedLeaderboardRecord[]>([]);

  const { user } = useContext(GlobalState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (!open || !ready) return;
    if (data && data.length > 0) return;
    let cancelled = false;
    async function fetchData() {
      try {
        const leaderboard = pb.collection("connections_leaderboard");
        const filter = `puzzle_id = "${puzzleData.id}"`;
        const leaderboardData = (await leaderboard.getList(1, 50, {
          sort: "+mistakes",
          filter,
          expand: "user"
        })) as unknown as { items: ConnectionsLeaderboardRecord[] };

        const pointData = leaderboardData.items.map((item, i) => {
          const purplePosition = item.order.findIndex((index) => index === 3);
          let orderPoints = 0;
          if (!item.order.includes(-1)) {
            // reward based on the position of the first purple category, but only if all categories were found
            orderPoints = -(purplePosition - 3);
          }
          item.order.forEach((categoryId, idx) => {
            if (categoryId === -1) {
              orderPoints -= 4 - idx; // penalize revealed categories
            }
          });
          return { ...item, points: orderPoints };
        });

        const groupedByMistakes: { [key: number]: RankedLeaderboardRecord[] } = {};
        pointData.forEach((item) => {
          if (!groupedByMistakes[item.mistakes]) {
            groupedByMistakes[item.mistakes] = [];
          }
          groupedByMistakes[item.mistakes].push(item);
        });

        const sortedData = Object.values(groupedByMistakes)
          .map((group) => group.sort((a, b) => b.points - a.points))
          .flat()
          .map((item, index) => ({ ...item, rank: index + 1 }));

        if (!cancelled) {
          setData(sortedData);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Leaderboard fetch error:", err);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [open, puzzleData.id, ready]);

  function ModalHeader() {
    return (
      <Modal.Header closeButton>
        <Modal.Title>
          <TrophyIcon /> Leaderboard
        </Modal.Title>
      </Modal.Header>
    );
  }

  if (!user) {
    return (
      <Modal centered open={open} onClose={onClose} size="fit-content" overflow={false}>
        <ModalHeader />
        <Modal.Body>
          <LeaderboardNudge />
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal
      centered
      open={open}
      size="fit-content"
      overflow={false}
      onClose={onClose}
      onEntered={() => {
        setReady(true);
      }}
      onExited={() => {
        setReady(false);
        setLoading(true);
        setData([]);
      }}
    >
      <ModalHeader />
      <Modal.Body>
        <div className="leaderboard-container" style={{ minWidth: "340px" }}>
          {data && !loading && (
            <>
              <Table data={data} bordered autoHeight maxHeight={408}>
                <Table.Column width={40} align="center" verticalAlign="center">
                  <Table.HeaderCell>#</Table.HeaderCell>
                  <Table.Cell dataKey="rank" />
                </Table.Column>
                <Table.Column flexGrow={2} align="left" verticalAlign="center">
                  <Table.HeaderCell>Username</Table.HeaderCell>
                  <Table.Cell dataKey="expand.user.username" className="leaderboard-username" />
                </Table.Column>
                <Table.Column flexGrow={1} align="right" verticalAlign="center">
                  <Table.HeaderCell>Mistakes</Table.HeaderCell>
                  <Table.Cell dataKey="mistakes" />
                </Table.Column>
                <Table.Column flexGrow={1.5} align="center" verticalAlign="center">
                  <Table.HeaderCell>Order</Table.HeaderCell>
                  <Table.Cell
                    dataKey="order"
                    renderCell={(order: number[]) => {
                      return order.map((index) => categoryEmojis[index] ?? "❌").join(" ");
                    }}
                  />
                </Table.Column>
              </Table>
              {user.friends.length === 0 && (
                <Center marginTop={10}>
                  <FriendsNudge />
                </Center>
              )}
            </>
          )}
        </div>

        {loading && <Loader center backdrop />}
      </Modal.Body>
    </Modal>
  );
}
