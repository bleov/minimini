import { useEffect, useState } from "react";
import Wordle from "./Components/Wordle";
import type { WordleGame } from "@/lib/types";
import { Center, Content, Loader, Text } from "rsuite";
import { pb } from "@/main";
import { useParams } from "react-router";
import posthog from "posthog-js";
import WordleArchive from "./Components/WordleArchive";
// import WordleArchive from "./Components/WordleArchive";

export default function App({ custom = false }: { custom?: boolean }) {
  const [data, setData] = useState<WordleGame | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const isArchive = params.date && params.date === "archive";

  useEffect(() => {
    document.title = "Wordle – Glyph";
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/wordle/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/wordle/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/wordle/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/wordle.webmanifest`);
  }, []);

  async function fetchData() {
    if (custom) {
      if (params.id) {
        pb.collection("custom_puzzles")
          .getOne(params.id, { expand: "shape" })
          .then((record) => {
            const newData = record.puzzle as WordleGame;
            newData.id = record.id as unknown as number;
            setData(newData);
            posthog.capture("load_custom_wordle");
          })
          .catch((err) => {
            console.error(err);
            setError("Failed to load custom puzzle.");
          });
      }
    } else {
      try {
        if (params.date === "today") {
          const todayData = await pb.send("/api/today/wordle", {
            method: "GET"
          });
          setData(todayData);
          posthog.capture("load_wordle");
        } else if (!isArchive) {
          const archiveData = await pb.collection("archive").getFirstListItem(`publication_date="${params.date}"`, { fields: "wordle" });
          if (archiveData.wordle !== null) {
            setData(archiveData.wordle);
            posthog.capture("load_archive_wordle");
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
    return <Content className="connections">{<WordleArchive />}</Content>;
  }

  return <Content className="wordle">{data ? <Wordle data={data} /> : <Loader center />}</Content>;
}
