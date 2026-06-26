import type { StrandsGame } from "@/lib/types";
import { pb } from "@/main";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { Center, Content, Loader, Text } from "rsuite";
import Strands from "./Components/Strands";

export default function App() {
  const [data, setData] = useState<StrandsGame | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Strands – Glyph";
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/strands/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/strands/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/strands/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/strands.webmanifest`);
  }, []);

  async function fetchData() {
    try {
      const todayData = await pb.send("/api/today/strands", {
        method: "GET"
      });

      setData(todayData);
      posthog.capture("load_strands");
    } catch (err) {
      console.error(err);
      setError("Failed to load puzzle.");
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

  return <Content className="strands">{data ? <Strands data={data} /> : <Loader center />}</Content>;
}
