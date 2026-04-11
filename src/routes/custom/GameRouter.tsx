import { pb } from "@/main";
import { lazy, useEffect, useState } from "react";
import { useParams } from "react-router";
import type { ConnectionsGame } from "@/lib/types";

const ConnectionsApp = lazy(() => import("../connections/App"));
const CrosswordApp = lazy(() => import("../crossword/App"));

export default function GameRouter() {
  const params = useParams();
  const [type, setType] = useState<"crossword" | "connections" | null>(null);

  useEffect(() => {
    if (params.id) {
      pb.collection("custom_puzzles")
        .getOne(params.id, { fields: "type" })
        .then((res) => {
          if (res.type === "connections") {
            setType("connections");
          } else {
            setType("crossword");
          }
        });
    }
  }, []);

  if (type === "connections") {
    return <ConnectionsApp custom={true} />;
  }
  if (type === "crossword") {
    return <CrosswordApp type="custom" />;
  }
}
