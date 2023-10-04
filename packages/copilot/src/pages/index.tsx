// Import necessary types and libraries
import type { NextPage } from "next";

// Import components and styles
import { Node, Edge } from "reactflow";
import {
  isLoadingAtom,
  apiKeyAtom,
  modelAtom,
  FlowWithProvider,
  ChatInput,
  ChatbotPopup,
  ChatMessage,
  parseCodeFromMessage
} from "common-utils";
import styles from "common-utils/dist/styles/Home.module.css";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAtom } from "jotai";

// Import custom atoms, components, utilities, and types
import type { Message, RequestBody, OpenAIModel } from "common-utils";

// Utility function to fetch and update API key and model from local storage
const useInitializeSettings = (setApiKey: Function, setModel: Function) => {
  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    const storedModel = localStorage.getItem("model");
    if (storedApiKey) setApiKey(storedApiKey);
    if (storedModel) setModel(storedModel as OpenAIModel);
  }, [setApiKey, setModel]); // Added setApiKey and setModel to dependency array
};

export function createContextPrompt(outputCode: Array<Node | Edge>) {
  const elements = { elements: outputCode };
  const outputCodeString = JSON.stringify(elements, null, 2); // Pretty-printed JSON
  return `
    Current node, node type, node label, node position and edge values: 
    ${outputCodeString}
    Code (no \`\`\`):
  `;
}

// Utility function to handle the API call
const useChatApi = (
  apiKey: string,
  draftMessage: string,
  messages: Message[],
  model: OpenAIModel,
  outputCode: Array<Node | Edge>,
  setMessages: Function,
  setDraftMessage: Function,
  setDraftOutputCode: Function,
  setOutputCode: Function,
  setIsUpdateFromAPI: Function,
) => {
  const [, setIsLoading] = useAtom(isLoadingAtom);

  // Initialize WebSocket
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(
      process.env.NEXT_PUBLIC_WEBSOCKET_ENDPOINT || "ws://fallback-url",
    );
    ws.current.onopen = () => {
      console.log("Connected to the WebSocket");
    };
    ws.current.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData && parsedData.code) {
        setIsUpdateFromAPI(true);
        let collectedUpdate = parseCodeFromMessage(parsedData.code);
        if (Array.isArray(collectedUpdate) && collectedUpdate.length > 0) {
          setOutputCode(collectedUpdate);
        }
      }
    };
    ws.current.onerror = (error) => {
      console.error(`WebSocket Error: ${error}`);
    };
    ws.current.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    return () => {
      ws.current?.close();
    };
  }, [setIsUpdateFromAPI, setOutputCode]);

  const handleSubmit = useCallback(async () => {
    if (!apiKey || !draftMessage) {
      alert("Please enter both an API key and a message.");
      return;
    }
    const newMessage: Message = {
      role: "user",
      content: draftMessage,
    };
    const newCode: Message = {
      role: "assistant",
      content: createContextPrompt(outputCode),
    };
    // Remove messages with role "system"
    const filteredMessages = messages.filter(
      (message) => message.role == "user",
    );

    // Append newCode and newMessage
    // The next line is commented out to avoid keep providing history to the chat api
    //const updatedMessages = [...filteredMessages, newCode, newMessage];
    const updatedMessages = [newCode, newMessage];
    setMessages(updatedMessages);
    // Clear draft fields
    setDraftMessage("");
    setDraftOutputCode("");

    // Prepare request body
    const body: RequestBody = {
      messages: updatedMessages,
      model: model || "defaultModel",
      apiKey,
    };
    setIsLoading(true);

    if (ws.current) {
      ws.current.send(JSON.stringify(body));
    } else {
      console.error("WebSocket is not available");
    }
  }, [
    apiKey,
    draftMessage,
    messages,
    model,
    outputCode,
    setDraftMessage,
    setDraftOutputCode,
    setIsLoading,
    setMessages,
  ]);

  return handleSubmit;
};

const Home: NextPage = () => {
  const [isLoading] = useAtom(isLoadingAtom);
  const [apiKey, setApiKey] = useAtom(apiKeyAtom);
  const [model, setModel] = useAtom(modelAtom);
  const [draftMessage, setDraftMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draftOutputCode, setDraftOutputCode] = useState<string>("");
  const [isUpdateFromAPI, setIsUpdateFromAPI] = useState<boolean>(false);
  const [outputCode, setOutputCode] = useState<Array<Node | Edge>>([]);

  const handleUpdateOutputCode = useCallback(
    (newOutputCode: Array<Node | Edge>) => {
      setOutputCode(newOutputCode);
    },
    [],
  );

  useInitializeSettings(setApiKey, setModel);
  const handleSubmit = useChatApi(
    apiKey,
    draftMessage,
    messages,
    model,
    outputCode,
    setMessages,
    setDraftMessage,
    setDraftOutputCode,
    setOutputCode,
    setIsUpdateFromAPI,
  );

  const isUpdateFromAPIRef = useRef(isUpdateFromAPI);

  useEffect(() => {
    isUpdateFromAPIRef.current = isUpdateFromAPI;
  }, [isUpdateFromAPI]);

  useEffect(() => {
    if (isUpdateFromAPIRef.current) {
      setIsUpdateFromAPI(false); // Reset the flag
    }
  }, [outputCode]);

  return (
    <div className={styles.container}>
      <title>nmcopilot</title>
      <meta name="description" content="Amalgamation of code" />
      <link rel="icon" href="favicon.ico" type="image/x-icon" />
      <ChatbotPopup
        messageContent={draftMessage}
        onChange={setDraftMessage}
        onSubmit={handleSubmit}
      />
      <main className={styles["main-container"]}>
        <div className={styles["left-pane"]}>
          <div className={styles["messages-container"]}>
            {messages
              .filter((message) => message.role === "user")
              .map((message, index) => (
                <ChatMessage key={index} message={message.content} />
              ))}
          </div>
          <div className={styles["chat-input-container"]}>
            <ChatInput
              messageContent={draftMessage}
              onChange={setDraftMessage}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
        <div className={styles["right-pane"]}>
          <FlowWithProvider
            outputCode={outputCode}
            isUpdateFromAPI={isUpdateFromAPI}
            onUpdateOutputCode={handleUpdateOutputCode}
          />
        </div>
      </main>
      {isLoading ? <div className="status-bar">Loading...</div> : null}
    </div>
  );
};

export default Home;
