import {
  ButtonGroup,
  Card,
  CardGroup,
  Heading,
  HStack,
  Image,
  Text,
  Center,
  Badge,
  VStack,
  IconButton,
  Whisper,
  Tooltip,
  useBreakpointValue
} from "rsuite";
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";

import Account from "@/Components/Account";
import Friends from "@/Components/Friends";
import SignIn from "@/Components/SignIn";
import AccountButtons from "@/Components/AccountButtons";
import { pb } from "./main";
import { ArchiveIcon } from "lucide-react";
import { useNavigate } from "react-router";
import Notifications from "./Components/Notifications";

interface LinkCardProps {
  title: string;
  description: string;
  imageSrc: string;
  link: string;
  disabled?: boolean;
  badgeContent?: string;
  small?: boolean;
  children?: React.ReactNode;
}

function LinkCard({ title, description, imageSrc, link, disabled, badgeContent, small, children }: LinkCardProps) {
  const classList = ["link-card"];

  if (disabled) {
    classList.push("link-card-disabled");
  }
  if (small) {
    classList.push("link-card-small");
  }

  return (
    <Link to={link} aria-disabled={disabled} className={classList.join(" ")}>
      <Card shaded direction={"row"} alignItems={small ? "center" : "unset"}>
        <Image src={imageSrc} width={"100%"} height={50} fit="contain" draggable={false} alignSelf={"center"}></Image>
        <VStack spacing={0}>
          <Card.Header>
            <HStack width={"100%"} justifyContent={"center"}>
              <Text size="lg" weight="bold">
                {title}
              </Text>
              {badgeContent && <Badge content={badgeContent} />}
            </HStack>
          </Card.Header>
          {!small && <Card.Body>{description}</Card.Body>}
        </VStack>
        {children}
      </Card>
    </Link>
  );
}

export default function Index() {
  const [modalState, setModalState] = useState<"account" | "friends" | "sign-in" | "notifications" | null>(null);
  const location = useLocation();
  const columns = useBreakpointValue({ xs: 1, sm: 1, md: 2 });

  useEffect(() => {
    document.title = "Glyph – Daily word games";
    document.getElementById("favicon-ico")?.setAttribute("href", `/icons/mini/favicon.ico`);
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/mini/favicon.svg`);
    document.getElementById("apple-touch-icon")?.setAttribute("href", `/icons/mini/apple-touch-icon.png`);
    document.getElementById("site-manifest")?.setAttribute("href", `/pwa/index.webmanifest`);
  }, []);

  useEffect(() => {
    switch (location.hash) {
      case "#friends":
        if (pb.authStore.isValid) {
          setModalState("friends");
        }
        break;
      case "#account":
        if (pb.authStore.isValid) {
          setModalState("account");
        }
        break;
      case "#sign-in":
        if (!pb.authStore.isValid) {
          setModalState("sign-in");
        }
        break;
      default:
        break;
    }
  }, [location]);

  return (
    <main className="index">
      <Account open={modalState === "account"} setOpen={() => setModalState(null)} />
      <Friends open={modalState === "friends"} setOpen={() => setModalState(null)} />
      <SignIn open={modalState === "sign-in"} setOpen={() => setModalState(null)} />
      <Notifications open={modalState === "notifications"} setOpen={() => setModalState(null)} />

      <div className="title-container">
        <Heading level={1} className="merriweather-display">
          Glyph
        </Heading>
        <Heading level={3} className="merriweather-bold">
          Daily word games
        </Heading>
        <Center>
          <ButtonGroup className="account-buttons">
            <AccountButtons modalState={modalState} setModalState={setModalState} appearance="default" />
          </ButtonGroup>
        </Center>
      </div>
      <CardGroup columns={columns} className={`game-cards${columns === 1 ? " vertical" : ""}`} spacing={10}>
        <LinkCard title="The Mini" description="Tiny crossword puzzles" link="/mini" imageSrc="/icons/mini/pwa-192x192.png" />
        <LinkCard title="The Midi" description="Medium crossword puzzles" link="/midi" imageSrc="/icons/midi/pwa-192x192.png" />
        <LinkCard title="The Daily" description="Large crossword puzzles" link="/daily" imageSrc="/icons/daily/pwa-192x192.png" />
        <LinkCard
          title="Connections"
          description="Create groups of four"
          link="/connections/today"
          imageSrc="/icons/connections/pwa-192x192.png"
        >
          <Center paddingRight={17}>
            <Whisper placement="top" speaker={<Tooltip>Archive</Tooltip>}>
              <Link to={"/connections/archive"}>
                <IconButton icon={<ArchiveIcon />} />
              </Link>
            </Whisper>
          </Center>
        </LinkCard>
        <LinkCard
          title="Wordle"
          description="Guess the 5-letter word"
          link="/wordle/today"
          imageSrc="/icons/wordle/pwa-192x192.png"
          badgeContent="New"
        />

        {columns === 1 ? (
          <>
            <LinkCard
              title="Custom Crosswords"
              description="Create your own crosswords"
              link="/custom/crosswords"
              imageSrc="/icons/custom_crossword/pwa-192x192.png"
            />
            <LinkCard
              title="Custom Connections"
              description="Create your own connections"
              link="/custom/connections"
              imageSrc="/icons/custom_connections/pwa-192x192.png"
            />
          </>
        ) : (
          <CardGroup columns={columns} spacing={5} className="game-cards">
            <LinkCard
              title="Custom Crosswords"
              description=""
              link="/custom/crosswords"
              imageSrc="/icons/custom_crossword/pwa-192x192.png"
              small
            />
            <LinkCard
              title="Custom Connections"
              description=""
              link="/custom/connections"
              imageSrc="/icons/custom_connections/pwa-192x192.png"
              small
            />
          </CardGroup>
        )}
      </CardGroup>
    </main>
  );
}
