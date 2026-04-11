import { getDefaultAvatar } from "@/lib/avatars";
import { useMemo, type JSX } from "react";
import { Avatar, Heading, Text, VStack, HStack, Box } from "rsuite";

interface ProfileCardProps {
  username: string;
  secondaryText?: string | JSX.Element;
  actions?: JSX.Element;
  [key: string]: any;
}

export default function ProfileCard({ username, secondaryText, actions, ...rest }: ProfileCardProps) {
  const defaultAvatar = useMemo(() => getDefaultAvatar(username), [username]);

  return (
    <HStack
      spacing={10}
      border={"1px solid var(--rs-border-primary)"}
      padding={10}
      borderRadius={"var(--rs-radius-sm)"}
      justify={"space-between"}
      {...rest}
    >
      <Avatar src={defaultAvatar} width={40} height={40} />
      <VStack spacing={0} flexGrow={2}>
        <Heading level={3} textAlign={"left"}>
          {username}
        </Heading>
        {secondaryText && (
          <Text muted textAlign={"left"} height={20} overflow={"hidden"} textOverflow={"ellipsis"} whiteSpace={"nowrap"} maxWidth={202}>
            {secondaryText}
          </Text>
        )}
      </VStack>
      {actions && <Box>{actions}</Box>}
    </HStack>
  );
}
