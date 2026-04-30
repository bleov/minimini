import { LinkIcon, PencilIcon } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
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
            <Button margin={1} startIcon={<LinkIcon />}>
              Copy Share Link
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
