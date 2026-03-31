import { Button, Heading, Modal, VStack } from "rsuite";

interface IncorrectModalProps {
  open: boolean;
  onClose: () => void;
}

export default function IncorrectModal({ open, onClose }: IncorrectModalProps) {
  return (
    <Modal open={open} onClose={onClose} centered size="fit-content" overflow={false}>
      <VStack spacing={10}>
        <Heading level={2}>Not Quite...</Heading>
        <Heading level={3}>One or more squares are filled incorrectly.</Heading>
        <Button onClick={onClose} appearance="primary" className="auto-center">
          Keep Trying
        </Button>
      </VStack>
    </Modal>
  );
}
