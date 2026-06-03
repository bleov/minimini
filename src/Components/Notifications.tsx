import { pb } from "@/main";
import { BellIcon, MegaphoneIcon, XIcon } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { HStack, IconButton, List, Modal, Text } from "rsuite";
import Nudge from "./Nudge";

interface NotificationsProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  created: Date;
  global: boolean;
}

function getAgeString(then: Date) {
  const now = new Date();

  const units: Record<string, number> = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: (24 * 60 * 60 * 1000 * 365) / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
  };

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  var elapsed = then.getTime() - now.getTime();

  for (var u in units) {
    if (Math.abs(elapsed) > units[u] || u == "second") {
      return rtf.format(Math.round(elapsed / units[u]), u as Intl.RelativeTimeFormatUnitSingular);
    }
  }
}

function Notification({
  notification,
  setData
}: {
  notification: NotificationRecord;
  setData: Dispatch<SetStateAction<NotificationRecord[]>>;
}) {
  const created = new Date(notification.created);
  const [loading, setLoading] = useState(false);

  return (
    <List.Item className="notification">
      <HStack>
        {notification.global && <MegaphoneIcon />}
        <Text weight="bold" width="100%" className="notification-title" title={notification.title}>
          {notification.title}
        </Text>
        <IconButton
          size="xs"
          appearance="subtle"
          icon={<XIcon />}
          loading={loading}
          onClick={() => {
            setLoading(true);
            pb.send(`/api/notifications/${notification.id}/read`, { method: "POST" })
              .then(() => {
                setData((data) => {
                  return [...data].filter((n) => n.id !== notification.id);
                });
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        />
      </HStack>
      <Text>{notification.body}</Text>
      <Text muted>{getAgeString(created)}</Text>
    </List.Item>
  );
}

export default function Notifications({ open, setOpen }: NotificationsProps) {
  const [data, setData] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      pb.send("/api/notifications/list", { method: "GET" })
        .then((list) => {
          setData(list);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  return (
    <Modal open={open} onClose={() => setOpen(false)} centered size="xs">
      <Modal.Header>
        <Modal.Title>
          <BellIcon /> Notifications
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "400px" }}>
        {data.length > 0 && (
          <List bordered>
            {data.map((notification) => (
              <Notification key={notification.id} notification={notification} setData={setData} />
            ))}
          </List>
        )}
        {data.length === 0 && !loading && (
          <Nudge
            title="No notifications"
            body="You'll receive a notification when friends complete your custom puzzles."
            color="var(--rs-orange-500)"
            width={"100%"}
            className="icon-bg notifications-nudge"
          />
        )}
      </Modal.Body>
    </Modal>
  );
}
