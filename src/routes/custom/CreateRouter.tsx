import { pb } from "@/main";
import { lazy, useEffect, useState } from "react";
import { useParams } from "react-router";

const CrosswordCreator = lazy(() => import("./crossword/Create"));
const ConnectionsCreator = lazy(() => import("./connections/Create"));
const WordleCreator = lazy(() => import("./wordle/Create"));

export default function CreateRouter() {
  const params = useParams();
  const [type, setType] = useState<"crossword" | "connections" | "wordle" | null>(null);

  useEffect(() => {
    if (params.id) {
      pb.collection("custom_puzzles")
        .getOne(params.id, { fields: "type" })
        .then((res) => {
          if (res.type === "connections") {
            setType("connections");
          } else if (res.type === "wordle") {
            setType("wordle");
          } else {
            setType("crossword");
          }
        });
    }
  }, []);

  if (type === "connections") {
    return <ConnectionsCreator />;
  }
  if (type === "crossword") {
    return <CrosswordCreator />;
  }
  if (type === "wordle") {
    return <WordleCreator />;
  }
}
