import { useContext, type RefObject } from "react";
import posthog from "posthog-js";
import {
  ArchiveIcon,
  ExpandIcon,
  LayoutGridIcon,
  MenuIcon,
  PrinterIcon,
  RotateCcwIcon,
  StarIcon,
  StarOffIcon,
  TrophyIcon,
  XIcon
} from "lucide-react";

import type { MiniCrossword } from "@/lib/types";
import { Menu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import { CrosswordAppState } from "@/routes/crossword/state";
import { pb } from "@/main";
import { GlobalState } from "@/lib/GlobalState";
import { useDialog } from "rsuite";
import { useNavigate } from "react-router";

export default function PuzzleMenu({
  data,
  clearLocalPuzzleData,
  stateDocId,
  setPuzzleModalState,
  onExit
}: {
  data: MiniCrossword;
  clearLocalPuzzleData: () => Promise<void>;
  stateDocId: RefObject<string>;
  setPuzzleModalState: (state: any) => void;
  onExit: (destination: string) => void;
}) {
  const { user } = useContext(GlobalState);
  const { type, options, complete, setOptions } = useContext(CrosswordAppState);
  const dialog = useDialog();
  const navigate = useNavigate();

  const hardcore = options.includes("hardcore");

  return (
    <Menu portal transition align="end" menuButton={<MenuIcon />}>
      <MenuItem
        onClick={() => {
          setPuzzleModalState("leaderboard");
        }}
        disabled={!complete}
      >
        <TrophyIcon />
        Leaderboard
      </MenuItem>
      <MenuItem
        onClick={() => {
          setPuzzleModalState("victory");
        }}
        disabled={!complete}
      >
        <StarIcon />
        Rate
      </MenuItem>
      <MenuDivider />
      <MenuItem
        onClick={() => {
          onExit("welcome");
        }}
        disabled={hardcore && !complete}
      >
        <XIcon />
        Quit
      </MenuItem>
      <MenuItem
        onClick={() => {
          onExit("archive");
        }}
        disabled={(hardcore && !complete) || type === "custom"}
      >
        <ArchiveIcon />
        Archive
      </MenuItem>
      <MenuItem
        onClick={() => {
          navigate("/");
        }}
        disabled={hardcore && !complete}
      >
        <LayoutGridIcon />
        More Games
      </MenuItem>
      <MenuDivider />
      <MenuItem
        onClick={async () => {
          if (user) {
            try {
              await pb.collection("leaderboard").getFirstListItem(`puzzle_id="${data.id}" && user="${user.id}"`);
            } catch (err) {
              dialog.alert("You must complete this puzzle at least once before resetting your progress.", { title: "Error" });
              return;
            }
            if (
              !(await dialog.confirm("Resetting your progress will not clear or change your leaderboard entry.", {
                title: "Are you sure?"
              }))
            ) {
              return;
            }
          }
          clearLocalPuzzleData().then(() => {
            if (user) {
              pb.collection("puzzle_state")
                .delete(stateDocId.current)
                .finally(() => {
                  posthog.capture("reset_puzzle", { puzzle: data.id, puzzleDate: data.publicationDate });
                  location.reload();
                });
            } else {
              posthog.capture("reset_puzzle", { puzzle: data.id, puzzleDate: data.publicationDate });
              location.reload();
            }
          });
        }}
        disabled={hardcore && !complete}
      >
        <RotateCcwIcon />
        Reset Puzzle
      </MenuItem>
      {hardcore && !complete && (
        <>
          <MenuItem
            onClick={() => {
              setOptions((prev: string[]) => prev.filter((opt) => opt !== "hardcore"));
            }}
          >
            <StarOffIcon /> Forfeit Hardcore
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else if (document.fullscreenEnabled) {
                document.documentElement.requestFullscreen();
              }
            }}
          >
            <ExpandIcon /> Fullscreen
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
