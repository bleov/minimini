import { CircleUserRoundIcon, LogInIcon, UsersIcon } from "lucide-react";
import { useContext } from "react";
import { Button, ButtonGroup } from "rsuite";
import { GlobalState } from "../lib/GlobalState";
import posthog from "posthog-js";

export default function AccountButtons({
  setModalState,
  appearance
}: {
  setModalState: any;
  appearance: "default" | "primary" | "subtle" | "ghost" | "link";
}) {
  const { user } = useContext(GlobalState);

  return (
    <>
      {user ? (
        <>
          {" "}
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
