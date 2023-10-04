import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { FC, KeyboardEvent } from "react";

interface Props {
  messageContent: string;
  onChange: (messageContent: string) => void;
  onSubmit: () => void;
}

export const ChatInput: FC<Props> = ({
  messageContent,
  onChange,
  onSubmit,
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key == "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };
  return (
    <div className="textarea-container">
      <Textarea
        placeholder="Describe the diagram in natural language."
        value={messageContent}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button onClick={onSubmit} variant="ghost" className="custom-button">
        <Send className="mr-2 h-4 w-4" />
      </Button>
    </div>
  );
};
