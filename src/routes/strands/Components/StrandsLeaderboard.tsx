import { TrophyIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Col, Grid, Loader, Modal, Row, Text, VStack } from "rsuite";
import { GlobalState } from "@/lib/GlobalState";
import type { StrandsGame, StrandsState } from "@/lib/types";
import { pb } from "@/main";
import posthog from "posthog-js";
import { FriendsNudge, LeaderboardNudge } from "@/Components/Leaderboard";
import type { UsersRecord, StrandsLeaderboardRecord, StrandsLeaderboardResponse } from "@/lib/pb-types";

type ExpandedStrandsLeaderboardRecord = StrandsLeaderboardResponse<
  StrandsState,
  {
    user: UsersRecord;
  }
>;

export default function StrandsLeaderboard({
  open,
  setOpen,
  puzzleData
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  puzzleData: StrandsGame;
}) {
  const [loading, setLoading] = useState(true);
  // Safari and Chromium seem to have issues with rendering the Table component while the modal is animating, especially on high dpi displays.
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<ExpandedStrandsLeaderboardRecord[]>([]);

  const { user } = useContext(GlobalState);

  useEffect(() => {
    if (!user) return;
    if (!open || !ready) return;
    if (data && data.length > 0) return;
    let cancelled = false;
    async function fetchData() {
      try {
        const leaderboard = pb.collection("strands_leaderboard");
        const filter = `puzzle_id = "${puzzleData.id}"`;
        const leaderboardData = await leaderboard.getList<ExpandedStrandsLeaderboardRecord>(1, 50, {
          sort: "+hints_used",
          filter,
          expand: "user"
        });

        if (!cancelled) {
          setData(leaderboardData.items);
          posthog.capture("view_strands_leaderboard", { puzzleId: puzzleData.id });
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
      <Modal
        centered
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        size="fit-content"
        overflow={false}
      >
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
      size={"fit-content"}
      overflow={false}
      onClose={() => {
        setOpen(false);
      }}
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
      <Modal.Body height={300} overflowY={"auto"} overflowX={"hidden"}>
        <div className="leaderboard-container" style={{ minWidth: "330px" }}>
          {data && !loading && (
            <>
              <Grid width={"330px"} fluid>
                <Row gutter={10} width={"100%"}>
                  {data.map((entry) => (
                    <Col key={entry.expand.user.id} span={12}>
                      <VStack className="strands-leaderboard-card" width={"100%"} alignItems="center">
                        <Text size="lg" wordBreak={"break-all"}>
                          {entry.state?.gameHistory}
                        </Text>
                        <Text>{entry.expand.user.username}</Text>
                      </VStack>
                    </Col>
                  ))}
                  {user.friends.length === 0 && (
                    <Col span={24}>
                      <FriendsNudge />
                    </Col>
                  )}
                </Row>
              </Grid>
            </>
          )}
        </div>

        {loading && <Loader center backdrop />}
      </Modal.Body>
    </Modal>
  );
}
