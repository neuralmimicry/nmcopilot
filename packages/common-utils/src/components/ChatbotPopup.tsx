import React, { useRef, useEffect } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Icons } from "./Icons";
import { Send } from "lucide-react";
import { FC, KeyboardEvent } from "react";

interface Props {
  messageContent: string;
  onChange: (messageContent: string) => void;
  onSubmit: () => void;
}

export const ChatbotPopup: FC<Props> = ({
  messageContent,
  onChange,
  onSubmit,
}) => {
  const chatbotRef = useRef<HTMLDivElement>(null);
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key == "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  useEffect(() => {
    const chatbot = chatbotRef.current;
    if (!chatbot) return; // return early if chatbot is null or undefined

    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    const dragMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    };

    const elementDrag = (e: MouseEvent) => {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      chatbot.style.top = chatbot.offsetTop - pos2 + "px";
      chatbot.style.left = chatbot.offsetLeft - pos1 + "px";
    };

    const closeDragElement = () => {
      document.onmouseup = null;
      document.onmousemove = null;
    };

    const headerElement = chatbot.querySelector(
      ".chatbot-header",
    ) as HTMLElement | null;
    if (headerElement) {
      headerElement.addEventListener(
        "mousedown",
        dragMouseDown as EventListener,
      );
    }

    return () => {
      if (headerElement) {
        headerElement.removeEventListener(
          "mousedown",
          dragMouseDown as EventListener,
        );
      }
    };
  }, []);

  return (
    <div ref={chatbotRef} className="chatbot">
      <div className="chatbot-header flex items-center">
        <Icons.logo className="mr-2 h-4 w-4" />
        <span className="font-bold">nmcopilot</span>
      </div>
      <div className="chatbot-body">
        <div className="chatbot-messages"></div>
        <Textarea
          placeholder="Type your message..."
          value={messageContent}
          onChange={(e) => {
            if (typeof onChange === "function") {
              onChange(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={() => {
            if (typeof onSubmit === "function") {
              onSubmit();
            }
          }}
          variant="ghost"
          className="custom-button"
        >
          <Send className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
