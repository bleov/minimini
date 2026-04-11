import { pb } from "@/main";
import { lazy, useEffect, useState } from "react";
import { useParams } from "react-router";

const CrosswordCreator = lazy(() => import("./crossword/Create"));
const ConnectionsCreator = lazy(() => import("./connections/Create"));

export default function CreateRouter() {
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
    return <ConnectionsCreator />;
  }
  if (type === "crossword") {
    return <CrosswordCreator />;
  }
}
