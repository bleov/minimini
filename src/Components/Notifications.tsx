import { pb } from "@/main";
import { BellIcon } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Box, List, Modal, Placeholder, Text } from "rsuite";

interface NotificationsProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  created: Date;
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

function Notification({ notification }: { notification: NotificationRecord }) {
  const created = new Date(notification.created);

  return (
    <List.Item>
      <Text weight="bold">{notification.title}</Text>
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
        <List bordered>
          {data.map((notification) => (
            <Notification key={notification.id} notification={notification} />
          ))}
        </List>
      </Modal.Body>
    </Modal>
  );
}
