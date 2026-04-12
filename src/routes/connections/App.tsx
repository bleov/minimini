import { useEffect, useState } from "react";
import Connections from "./Components/Connections";
import type { ConnectionsGame } from "@/lib/types";
import { Center, Content, Loader, Text } from "rsuite";
import { pb } from "@/main";
import { useParams } from "react-router";

export default function App({ custom = false }: { custom?: boolean }) {
  const [data, setData] = useState<ConnectionsGame | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();

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
          })
          .catch((err) => {
            console.error(err);
            setError("Failed to load custom puzzle.");
          });
      }
    } else {
      try {
        const todayData = await pb.send("/api/today/connections", {
          method: "GET"
        });
        setData(todayData);
      } catch (err) {
        console.error(err);
        setError("Failed to load today's puzzle.");
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

  return <Content className="connections">{data ? <Connections data={data} /> : <Loader center />}</Content>;
}
