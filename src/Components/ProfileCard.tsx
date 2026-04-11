import { getDefaultAvatar } from "@/lib/avatars";
import type { UserRecord } from "@/lib/types";
import { useMemo } from "react";
import { Avatar, Heading, Text, VStack, HStack } from "rsuite";

interface ProfileCardProps {
  user: UserRecord;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const defaultAvatar = useMemo(() => getDefaultAvatar(user?.username), [user]);

  return (
    <HStack spacing={10} border={"1px solid var(--rs-border-primary)"} padding={10} borderRadius={"var(--rs-radius-sm)"}>
      <Avatar src={defaultAvatar} />
      <VStack spacing={0}>
        <Heading level={3} textAlign={"left"}>
          {user.username}
        </Heading>
        <Text textAlign={"left"}>Solving since {new Date(user.created).toLocaleDateString("en-US")}</Text>
      </VStack>
    </HStack>
  );
}
