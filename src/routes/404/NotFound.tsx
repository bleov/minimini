import { HouseIcon } from "lucide-react";
import { Button, VStack, Heading } from "rsuite";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <>
      <Heading fontSize={100}>404</Heading>
      <VStack spacing={20} alignItems={"center"} width={"100%"}>
        <Heading>"What?" –Joe Biden</Heading>
        <Link to="/">
          <Button startIcon={<HouseIcon />}>Home</Button>
        </Link>
      </VStack>
    </>
  );
}
