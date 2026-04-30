import copy from "copy-to-clipboard";
import { CheckIcon, LinkIcon, PencilIcon, ShareIcon } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Button, Checkbox, CheckboxGroup, Form, Modal, Text, VStack } from "rsuite";

interface DetailsValue {
  title: string;
  options: string[];
}

interface DetailsEditorProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  details: DetailsValue;
  setDetails: Dispatch<SetStateAction<DetailsValue>>;
}

export default function DetailsEditor({ open, setOpen, details, setDetails }: DetailsEditorProps) {
  const shareEnabled = "share" in navigator;
  const [wasCopied, setWasCopied] = useState(false);

  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <Modal.Header>
        <Modal.Title>
          <PencilIcon /> Edit Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form
          fluid
          onChange={(formValue) => {
            setDetails(formValue as SetStateAction<{ title: string; options: string[] }>);
          }}
          formValue={details}
          onSubmit={() => {
            setOpen(false);
          }}
        >
          <VStack spacing={15}>
            <Form.Group width={"100%"}>
              <Form.Label>Puzzle Title</Form.Label>
              <Form.Control name="title" maxLength={35}></Form.Control>
            </Form.Group>
            <Form.Group width={"100%"}>
              <Form.Control name="options" accepter={CheckboxGroup}>
                <Checkbox value={"public"}>Publish Publicly</Checkbox>
                <Form.Text>
                  <Text muted align="left">
                    Your puzzle will be listed publicly on the custom puzzles page. When your puzzle is private, you can still share the
                    link with others.
                  </Text>
                </Form.Text>
              </Form.Control>
            </Form.Group>
            <Button
              margin={1}
              startIcon={shareEnabled ? <ShareIcon /> : wasCopied ? <CheckIcon /> : <LinkIcon />}
              onClick={() => {
                if (!shareEnabled) {
                  if (wasCopied) return;
                  copy(window.location.href.replace("/edit", "")).then(() => {
                    setWasCopied(true);
                    setTimeout(() => {
                      setWasCopied(false);
                    }, 2000);
                  });
                } else {
                  navigator
                    .share({
                      title: details.title,
                      url: window.location.href.replace("/edit", "")
                    })
                    .catch(console.warn);
                }
              }}
            >
              {shareEnabled ? "Share Puzzle" : wasCopied ? "Copied" : "Copy Link"}
            </Button>
          </VStack>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          appearance="primary"
          onClick={() => {
            setOpen(false);
          }}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
