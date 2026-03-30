import type { CrosswordShape } from "@/lib/types";
import { Box } from "rsuite";

interface ShapePreviewProps {
  shape: CrosswordShape;
  onSelect: (shape: CrosswordShape) => void;
}

export default function ShapePreview({ shape, onSelect }: ShapePreviewProps) {
  return (
    <Box width={"100%"} userSelect={"none"} cursor={"pointer"} onClick={() => onSelect(shape)}>
      <div dangerouslySetInnerHTML={{ __html: shape.data.body[0].board ?? "" }}></div>
    </Box>
  );
}
