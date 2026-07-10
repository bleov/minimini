import type { StrandsGame } from "@/lib/types";
import { pb } from "@/main";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { Center, Content, Loader, Text } from "rsuite";
import Strands from "./Components/Strands";
import { useParams } from "react-router";
import ArchivePage from "@/Components/ArchivePage";

export default function App() {
  const [data, setData] = useState<StrandsGame | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const isArchive = params.date && params.date === "archive";

  useEffect(() => {
    document.title = "Strands – Glyph";
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/strands/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/strands/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/strands/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/strands.webmanifest`);
  }, []);

  async function fetchData() {
    try {
      if (params.date === "today") {
        const todayData = await pb.send("/api/today/strands", {
          method: "GET"
        });
        setData(todayData);
        posthog.capture("load_strands");
      } else if (!isArchive) {
        const archiveData = await pb.collection("archive").getFirstListItem(`publication_date="${params.date}"`, { fields: "strands" });
        if (archiveData.connections !== null) {
          setData(archiveData.strands as StrandsGame);
          posthog.capture("load_archive_strands");
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
        <ArchivePage type="strands" />
      </Content>
    );
  }

  return <Content className="strands">{data ? <Strands data={data} /> : <Loader center />}</Content>;
}
