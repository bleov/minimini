import { useContext, useState } from "react";
import { Form, Modal } from "rsuite";
import { pb } from "../main";
import { Button, ButtonGroup, useDialog, VStack } from "rsuite";
import { GlobalState } from "../lib/GlobalState";
import type { RecordAuthResponse } from "pocketbase";
import posthog from "posthog-js";
import { CircleUserRoundIcon, LogOutIcon, MailIcon, PencilIcon, TrashIcon } from "lucide-react";
import localforage from "localforage";
import ProfileCard from "./ProfileCard";

const EditUsernameDialog = ({ payload, onClose }: { payload: string; onClose: (newUser: RecordAuthResponse | null) => void }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [newUsername, setNewUsername] = useState(payload || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usernamePattern = /^[a-zA-Z0-9\-_.]{3,16}$/;

  function handleClose(returnValue: RecordAuthResponse | null) {
    setIsOpen(false);
    setTimeout(() => {
      onClose(returnValue);
    }, 300);
  }

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        handleClose(null);
      }}
      size="xs"
    >
      <Modal.Title>Change Username</Modal.Title>
      <Form
        onSubmit={() => {
          if (loading) return;
          if (!pb.authStore.record) return;
          if (!usernamePattern.test(newUsername)) {
            setError("Username can only contain letters, numbers, hyphens, underscores, and periods");
            return;
          } else {
            setError(null);
            const record = new FormData();
            record.set("username", newUsername);
            pb.collection("users")
              .update(pb.authStore.record.id, record)
              .then(() => {
                pb.collection("users")
                  .authRefresh()
                  .then((newUser) => {
                    setLoading(false);
                    handleClose(newUser);
                  })
                  .catch((err) => {
                    setLoading(false);
                    setError(err.message);
                  });
              })
              .catch((err) => {
                setLoading(false);
                if (err.message.includes("Failed to update record.")) {
                  setError("Username already taken.");
                } else {
                  setError(err.message);
                }
              });
            setLoading(true);
          }
        }}
      >
        <Modal.Body>
          <Form.Group controlId="username">
            <Form.Label>New Username</Form.Label>
            <Form.Control
              name="username"
              value={newUsername}
              onChange={(value) => {
                setNewUsername(value);
              }}
              placeholder="Enter new username"
              maxLength={16}
              required
            />
            {error && <Form.Text>{error}</Form.Text>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              handleClose(null);
            }}
          >
            Cancel
          </Button>
          <Button appearance="primary" type="submit" loading={loading}>
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const ChangeEmailDialog = ({ payload, onClose }: { payload: string; onClose: (result: any) => void }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [newEmail, setNewEmail] = useState(payload ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleClose(response?: any) {
    setIsOpen(false);
    setTimeout(() => {
      onClose(response ?? null);
    }, 300);
  }

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        handleClose();
      }}
      size="xs"
    >
      <Modal.Title>Change Email</Modal.Title>
      <Form
        onSubmit={() => {
          if (loading) return;
          if (!pb.authStore.record) return;
          setLoading(true);
          setError(null);
          pb.collection("users")
            .requestEmailChange(newEmail)
            .then(() => {
              setLoading(false);
              handleClose(newEmail);
            })
            .catch((err) => {
              setLoading(false);
              if (err.message.includes("Failed to update record.")) {
                setError("Email already in use.");
              } else if (err.message.includes("error occurred while validating")) {
                setError("Email is either invalid or already in use.");
              } else {
                setError(err.message);
              }
            });
        }}
      >
        <Modal.Body>
          <Form.Group controlId="email">
            <Form.Label>New Email</Form.Label>
            <Form.Control
              name="email"
              value={newEmail}
              onChange={(value) => {
                setNewEmail(value);
              }}
              placeholder="Enter email"
              maxLength={255}
              required
            />
            <Form.Text textAlign={"left"}>A confirmation link will be sent to your new email</Form.Text>
            {error && <Form.Text color={"var(--rs-red-400)"}>{error}</Form.Text>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              handleClose();
            }}
          >
            Cancel
          </Button>
          <Button appearance="primary" type="submit" loading={loading}>
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default function Account({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const dialog = useDialog();

  const { user, setUser } = useContext(GlobalState);
  const hasEmail = user?.email ? true : false;

  if (user) {
    return (
      <Modal
        centered
        size="fit-content"
        overflow={false}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <CircleUserRoundIcon /> Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <VStack spacing={10}>
            <ProfileCard username={user.username} secondaryText={`Solving since ${new Date(user.created).toLocaleDateString("en-US")}`} />
            <ButtonGroup vertical block>
              <Button
                startIcon={<MailIcon />}
                onClick={async () => {
                  const result = await dialog.open(ChangeEmailDialog, user.email ?? "");
                  if (typeof result === "string") {
                    posthog.capture("change_email", { user_id: user.id, username: user.username });
                    dialog.alert(
                      `A confirmation email was sent to ${result}. Please check your inbox and spam folder. Upon confirming your new email, you will be signed out of all devices.`
                    );
                  }
                }}
              >
                {hasEmail ? "Change" : "Add"} Email
              </Button>
              <Button
                startIcon={<PencilIcon />}
                onClick={async () => {
                  const newUser: RecordAuthResponse | null = await dialog.open(EditUsernameDialog, user.username);
                  if (newUser) {
                    posthog.capture("change_username", {
                      user_id: user.id,
                      old_username: user.username,
                      new_username: newUser.record.username
                    });
                    setUser(newUser.record);
                  }
                }}
              >
                Change Username
              </Button>
              <Button
                startIcon={<TrashIcon />}
                onClick={async () => {
                  const response = await dialog.prompt(
                    'All account data including custom puzzles will be permanently erased immediately. Please type "permanently delete" to confirm.',
                    {
                      title: "Delete Account",
                      okText: "Delete Account"
                    }
                  );
                  if (response === "permanently delete") {
                    posthog.capture("delete_account", { user_id: user.id, username: user.username });
                    await pb.collection("users").delete(user.id);
                    pb.authStore.clear();
                    setUser(null);
                    setOpen(false);
                  }
                }}
              >
                Delete Account
              </Button>
            </ButtonGroup>
            <Button
              block
              startIcon={<LogOutIcon />}
              onClick={async () => {
                pb.authStore.clear();
                await localforage.clear();
                setUser(null);
                setOpen(false);
              }}
            >
              Sign Out
            </Button>
          </VStack>
        </Modal.Body>
      </Modal>
    );
  } else {
    return <></>;
  }
}
