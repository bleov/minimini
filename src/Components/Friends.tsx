import { useEffect, useMemo, useState } from "react";
import { ButtonGroup, Modal, useDialog } from "rsuite";
import { Button, Form, HStack, VStack, List, Text, PinInput, Avatar } from "rsuite";
import { pb } from "../main";
import type { UserRecord } from "../lib/types";

import "../css/Friends.css";
import { getDefaultAvatar } from "../lib/avatars";
import { ArrowLeftIcon, ChartNoAxesColumnIcon, HashIcon, MenuIcon, UserPlus2, UserSearchIcon, UsersIcon, UserXIcon } from "lucide-react";
import { Menu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import { Stats } from "@/routes/crossword/Components/Stats";
import Nudge from "./Nudge";

const pages = ["main", "list", "code", "mutual"] as const;

function FriendListEntry({
  friend,
  setFriends,
  setFriendsLoading
}: {
  friend: UserRecord;
  setFriends: (friends: UserRecord[]) => void;
  setFriendsLoading: (loading: boolean) => void;
}) {
  const defaultAvatar = useMemo(() => getDefaultAvatar(friend.username), []);
  const dialog = useDialog();

  const [miniStatsOpen, setMiniStatsOpen] = useState(false);
  const [midiStatsOpen, setMidiStatsOpen] = useState(false);
  const [dailyStatsOpen, setDailyStatsOpen] = useState(false);

  async function remove() {
    if (!pb.authStore.isValid || !pb.authStore.record) return;
    if (
      !(await dialog.confirm(
        `Are you sure you want to remove ${friend.username} from your friends? You'll need their friend code again to add them back.`,
        { title: "Confirm" }
      ))
    ) {
      return;
    }
    await pb.collection("users").update(pb.authStore.record.id, {
      "friends-": [friend.id]
    });
    await fetchFriends(setFriends, setFriendsLoading);
  }

  return (
    <>
      <List.Item key={friend.id}>
        <HStack justifyContent="space-between" spacing={10}>
          <Avatar src={defaultAvatar} minWidth={25} width={25} height={25} />
          <Text className="friend-list-name" title={friend.username}>
            {friend.username}
          </Text>
          <Text className="friend-list-code" muted>
            {friend.friend_code}
          </Text>
          <Menu
            transition
            menuButton={
              <Button className="friend-list-remove" size="xs">
                <MenuIcon />
              </Button>
            }
          >
            <MenuItem onClick={remove}>
              <UserXIcon /> Remove Friend
            </MenuItem>
            <MenuDivider />
            <MenuItem
              onClick={() => {
                setMiniStatsOpen(true);
              }}
            >
              <ChartNoAxesColumnIcon /> Mini Stats
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMidiStatsOpen(true);
              }}
            >
              <ChartNoAxesColumnIcon /> Midi Stats
            </MenuItem>
            <MenuItem
              onClick={() => {
                setDailyStatsOpen(true);
              }}
            >
              <ChartNoAxesColumnIcon /> Daily Stats
            </MenuItem>
          </Menu>
        </HStack>
      </List.Item>
      <Stats open={miniStatsOpen} setOpen={setMiniStatsOpen} type="mini" user={friend} />
      <Stats open={midiStatsOpen} setOpen={setMidiStatsOpen} type="midi" user={friend} />
      <Stats open={dailyStatsOpen} setOpen={setDailyStatsOpen} type="daily" user={friend} />
    </>
  );
}

async function fetchFriends(setFriends: (friends: UserRecord[]) => void, setFriendsLoading: (loading: boolean) => void) {
  if (!pb.authStore.isValid || !pb.authStore.record?.id) return;
  try {
    const friends: UserRecord[] = await pb.collection("users").getFullList({
      fields: "id,username,friend_code,avatar",
      sort: "username:lower",
      filter: `id != "${pb.authStore.record.id}"`
    });
    setFriends(friends);
    setFriendsLoading(false);
  } catch (err) {
    console.error(err);
  }
}

function FriendsList() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [friends, setFriends] = useState<UserRecord[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  useEffect(() => {
    fetchFriends(setFriends, setFriendsLoading);
  }, []);

  return (
    <VStack spacing={10} alignItems={"center"}>
      {friends.length > 0 && (
        <List bordered={friends.length > 0} className="friends-list" hover>
          {friends.map((friend) => {
            return <FriendListEntry key={friend.id} friend={friend} setFriends={setFriends} setFriendsLoading={setFriendsLoading} />;
          })}
        </List>
      )}
      {friends.length === 0 && !friendsLoading && (
        <Nudge
          title="Add Friends to Compete"
          body="You haven't added any friends yet. You'll need to exchange friend codes to add your first friend."
          width={"100%"}
          color="var(--rs-violet-500)"
          className="icon-bg friends-nudge"
        />
      )}
    </VStack>
  );
}

function FriendCode() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <Form
      className="add-friend-form"
      onSubmit={async (e) => {
        if (!e || !e.code || e.code.length < 6) return;
        setLoading(true);
        try {
          if (!pb.authStore.isValid || !pb.authStore.record?.id) return;
          const response = await pb.send("/api/friends/from_code/" + e.code, {
            method: "GET"
          });
          if (response.id) {
            if (response.id === pb.authStore.record?.id) {
              setResult("You can't add yourself as a friend");
              return;
            }
            await pb.collection("users").update(pb.authStore.record.id, {
              "friends+": [response.id]
            });
            setResult(`Added ${response.username} as a friend`);
          } else {
            setResult("Invalid friend code");
          }
        } catch (err) {
          setResult("An unexpected error occurred");
        } finally {
          setLoading(false);
        }
      }}
    >
      <VStack spacing={10} alignItems={"center"}>
        <VStack spacing={10} alignItems={"center"}>
          <Text>
            Your friend code: <Text weight="bold">{pb.authStore.record?.friend_code}</Text>
          </Text>
          <Form.Group controlId="code">
            <Form.Control className="friend-code-input" name="code" accepter={PinInput} length={6} size="sm" justifyContent={"center"} />
            {result && (
              <Text className="block centered" style={{ marginTop: 5 }}>
                {result}
              </Text>
            )}
          </Form.Group>
          <Button appearance="primary" type="submit" loading={loading}>
            Add Friend
          </Button>
        </VStack>
      </VStack>
    </Form>
  );
}

function MutualPage() {
  return <VStack spacing={10} alignItems={"center"}></VStack>;
}

function MainPage({ setPage }: { setPage: (page: (typeof pages)[number]) => void }) {
  return (
    <VStack spacing={10} alignItems={"center"}>
      <Nudge
        title="About Friends"
        body="When you add a friend, you'll be able to see their scores on the leaderboard. Added friends will need to add you back if you want them to see your scores."
        width={"100%"}
        color={"var(--rs-violet-500)"}
        className="icon-bg friends-nudge"
      />
      <ButtonGroup vertical block>
        <Button startIcon={<UsersIcon />} onClick={() => setPage("list")}>
          Friends List
        </Button>
      </ButtonGroup>
      <ButtonGroup vertical block>
        <Button startIcon={<UserSearchIcon />} onClick={() => setPage("mutual")}>
          Friends of Friends
        </Button>
        <Button startIcon={<HashIcon />} onClick={() => setPage("code")}>
          Add by Friend Code
        </Button>
      </ButtonGroup>
    </VStack>
  );
}

export default function Friends({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [page, setPage] = useState<(typeof pages)[number]>("main");

  return (
    <Modal
      centered
      size="xs"
      overflow={false}
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <VStack spacing={10}>
        <Modal.Header closeButton>
          <Modal.Title>
            <UsersIcon /> Friends
          </Modal.Title>
        </Modal.Header>
        <Modal.Body width={"100%"}>
          {page === "main" && <MainPage setPage={setPage} />}
          {page === "list" && <FriendsList />}
          {page === "code" && <FriendCode />}
          {page === "mutual" && <MutualPage />}
        </Modal.Body>
        {page !== "main" && (
          <Modal.Footer width={"100%"} style={{ justifyContent: "center" }}>
            <Button startIcon={<ArrowLeftIcon />} onClick={() => setPage("main")}>
              Back
            </Button>
          </Modal.Footer>
        )}
      </VStack>
    </Modal>
  );
}
