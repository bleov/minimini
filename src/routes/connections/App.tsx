import { useEffect, useState } from "react";
import Connections from "./Components/Connections";
import type { ConnectionsGame } from "@/lib/types";
import { Center, Content, Loader, Text } from "rsuite";
import { pb_url } from "@/main";

export default function App() {
  const [data, setData] = useState<ConnectionsGame | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Connections – Glyph";
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/connections/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/connections/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/connections/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/connections.webmanifest`);
  }, []);

  async function fetchData() {
    try {
      const todayResponse = await fetch(`${pb_url}/api/today/connections`);
      if (!todayResponse.ok) {
        setError("Failed to fetch today's puzzle.");
        return;
      }
      const todayData = await todayResponse.json();
      setData(todayData);
    } catch (err) {
      setError("Failed to load today's puzzle.");
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
