import { useEffect, useState } from "react";
import Connections from "./Components/Connections";
import type { ConnectionsGame } from "@/lib/types";
import { Center, Content, Loader, Text } from "rsuite";
import { pb } from "@/main";
import { useParams } from "react-router";
import posthog from "posthog-js";
import ConnectionsArchive from "./Components/ConnectionsArchive";
import { useLocation } from "react-router";

export default function App({ custom = false }: { custom?: boolean }) {
  const [data, setData] = useState<ConnectionsGame | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const isArchive = params.date && params.date === "archive";

  useEffect(() => {
    document.title = "Connections – Glyph";
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/connections/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/connections/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/connections/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/connections.webmanifest`);
  }, []);

  async function fetchData() {
    if (custom) {
      if (params.id) {
        pb.collection("custom_puzzles")
          .getOne(params.id, { expand: "shape" })
          .then((record) => {
            const newData = record.puzzle as ConnectionsGame;
            newData.id = record.id as unknown as number;
            setData(newData);
            posthog.capture("load_custom_connections");
          })
          .catch((err) => {
            console.error(err);
            setError("Failed to load custom puzzle.");
          });
      }
    } else {
      try {
        if (params.date === "today") {
          const todayData = await pb.send("/api/today/connections", {
            method: "GET"
          });
          setData(todayData);
          posthog.capture("load_connections");
        } else if (!isArchive) {
          const archiveData = await pb
            .collection("archive")
            .getFirstListItem(`publication_date="${params.date}"`, { fields: "connections" });
          if (archiveData.connections !== null) {
            setData(archiveData.connections);
            posthog.capture("load_archive_connections");
          } else {
            setError("Failed to load puzzle.");
          }
        }
      } catch (err) {
        console.error(err);
        if (params.date === "today") {
          setError("Failed to load today's puzzle.");
        } else {
          setError("Failed to load puzzle.");
        }
      }
    }
  }

  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, []);

  if (error) {
    return (
      <>
        <Center>
          <Text size={"md"}>{error}</Text>
        </Center>
      </>
    );
  }

  if (isArchive) {
    return (
      <Content className="connections">
        <ConnectionsArchive />
      </Content>
    );
  }

  return <Content className="connections">{data ? <Connections data={data} /> : <Loader center />}</Content>;
}
