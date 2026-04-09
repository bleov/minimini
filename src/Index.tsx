import { ButtonGroup, Card, CardGroup, Heading, HStack, Image, Text, Center, Badge, VStack, useMediaQuery } from "rsuite";
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";

import Account from "@/Components/Account";
import Friends from "@/Components/Friends";
import SignIn from "@/Components/SignIn";
import AccountButtons from "@/Components/AccountButtons";

interface LinkCardProps {
  title: string;
  description: string;
  imageSrc: string;
  link: string;
  disabled?: boolean;
  badgeContent?: string;
  horizontal?: boolean;
}

function LinkCard({ title, description, imageSrc, link, disabled, badgeContent, horizontal }: LinkCardProps) {
  const collapsed = useMediaQuery("(max-width: 680px)")[0];

  if (horizontal && !collapsed) {
    return (
      <Link to={link} aria-disabled={disabled} className={disabled ? "link-card-disabled" : "link-card"}>
        <Card shaded direction="row">
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
            <Card.Body>{description} </Card.Body>
          </VStack>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={link} aria-disabled={disabled} className={disabled ? "link-card-disabled" : "link-card"}>
      <Card shaded>
        <Image src={imageSrc} width={"100%"} height={50} fit="contain" draggable={false}></Image>
        <Card.Header>
          <HStack width={"100%"} justifyContent={"center"}>
            <Text size="lg" weight="bold">
              {title}
            </Text>
            {badgeContent && <Badge content={badgeContent} />}
          </HStack>
        </Card.Header>
        <Card.Body>{description} </Card.Body>
      </Card>
    </Link>
  );
}

export default function Index() {
  const [modalState, setModalState] = useState<"account" | "friends" | "sign-in" | null>(null);
  const location = useLocation();

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
        setModalState("friends");
        break;
      case "#account":
        setModalState("account");
        break;
      case "#sign-in":
        setModalState("sign-in");
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

      <div className="title-container">
        <Heading level={1} className="merriweather-display">
          Glyph
        </Heading>
        <Heading level={3} className="merriweather-bold">
          Daily word games
        </Heading>
        <Center>
          <ButtonGroup className="account-buttons" justified>
            <AccountButtons setModalState={setModalState} appearance="default" />
          </ButtonGroup>
        </Center>
      </div>
      <CardGroup columns={2} className="game-cards" spacing={10}>
        <LinkCard title="The Mini" description="Tiny crossword puzzles" link="/mini" imageSrc="/icons/mini/favicon.svg" />
        <LinkCard title="The Midi" description="Medium crossword puzzles" link="/midi" imageSrc="/icons/midi/favicon.svg" />
        <LinkCard title="The Daily" description="Large crossword puzzles" link="/daily" imageSrc="/icons/daily/favicon.svg" />
        <LinkCard title="Custom Puzzles" description="Create your own crossword" link="/custom" imageSrc="/icons/custom/favicon.svg" />
      </CardGroup>
      <CardGroup columns={1} className="game-cards" spacing={10} marginTop={10}>
        <LinkCard
          title="Connections"
          description="Connect words to make groups"
          link="/connections"
          imageSrc="/icons/connections/favicon.svg"
          badgeContent="New"
          horizontal
        />
      </CardGroup>
    </main>
  );
}
