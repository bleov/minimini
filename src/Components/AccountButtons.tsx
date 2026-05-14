import { BellIcon, CircleUserRoundIcon, LogInIcon, UsersIcon } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { Badge, Button, ButtonGroup } from "rsuite";
import { GlobalState } from "../lib/GlobalState";
import posthog from "posthog-js";
import { pb } from "@/main";

export default function AccountButtons({
  modalState,
  setModalState,
  appearance
}: {
  modalState: string | null;
  setModalState: any;
  appearance: "default" | "primary" | "subtle" | "ghost" | "link";
}) {
  const { user } = useContext(GlobalState);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastModalState = useRef<string | null>(null);

  function fetchUnreadCount() {
    pb.send("/api/notifications/unread", { method: "GET" })
      .then((count) => {
        setUnreadCount(count);
      })
      .catch(() => {
        setUnreadCount(0);
      });
  }

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (modalState === null && lastModalState.current === "notifications") {
      // notifications window just closed
      fetchUnreadCount();
    }
    lastModalState.current = modalState;
  });

  return (
    <>
      {user ? (
        <>
          <Button
            appearance={appearance}
            onClick={() => {
              posthog.capture("open_account");
              setModalState("account");
            }}
            style={{
              flexGrow: 1
            }}
            startIcon={<CircleUserRoundIcon />}
          >
            Account
          </Button>
          <Button
            appearance={appearance}
            onClick={() => {
              posthog.capture("open_friends");
              setModalState("friends");
            }}
            style={{ flexGrow: 1 }}
            startIcon={<UsersIcon />}
          >
            Friends
          </Button>
          <Badge invisible={unreadCount < 1} content={unreadCount <= 9 ? unreadCount : "9+"}>
            <Button
              appearance={appearance}
              startIcon={<BellIcon />}
              onClick={() => {
                setModalState("notifications");
              }}
              className="btn-right-end"
            >
              Notifications
            </Button>
          </Badge>
        </>
      ) : (
        <Button
          appearance={appearance}
          onClick={() => {
            setModalState("sign-in");
          }}
          startIcon={<LogInIcon />}
        >
          Sign in
        </Button>
      )}
    </>
  );
}
