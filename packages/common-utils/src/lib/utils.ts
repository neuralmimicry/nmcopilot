import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { Node, Edge } from "reactflow";
import { type Message } from "@/types/type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSystemPrompt() {
  return `
    You are an assistant designed to help users create a diagram using React-Flow. Your task is to generate an "elements" array that contains the necessary node and edge values. This array should be formatted as a TypeScript variable, ready to be directly inserted into a React-Flow function.

    Use the current React-Flow diagram values provided to you as a basis for generating the "elements" array.

    Important:
    - Return only the "elements" array.
    - All values to be written in full, not abridged nor referenced. For example, referencing to other tables is not valid, only the values in those tables are valid output.
    - References to existing elements or current elements values must be replaced with the actual values provided to the assistant.
    - Exclude all non-code content like descriptions, headers, apologies, or footers.
    - Do not include code fences (\`\`\`).

    Code Output:
  `;
}

export const OpenAIStream = async (
  writeableStream: WritableStream,
  messages: Message[],
  model: string,
  key: string,
) => {
  if (writeableStream.locked) {
    console.warn("Stream is already locked!");
    return;
  }
  const apiKey = key || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    console.error("No API key provided. Please set your OpenAI API key.");
    return;
  }

  const writer = writeableStream.getWriter();
  const system = { role: "system", content: createSystemPrompt() };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    method: "POST",
    body: JSON.stringify({
      model,
      messages: [system, ...messages],
      temperature: 0,
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const statusText = res.statusText;
    const result = await res.body?.getReader().read();
    throw new Error(
      `OpenAI API returned an error: ${
        decoder.decode(result?.value) || statusText
      }`,
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = async (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          try {
            const data = event.data;

            if (data === "[DONE]") {
              controller.close();
              await writer.close(); // Close the writer here
              return;
            }

            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            if (typeof text === "undefined") {
              // console.warn("Text is undefined, skipping enqueue.");
              return;
            }
            const queue = encoder.encode(text);

            await writer.write(queue);
          } catch (e) {
            console.error("Error parsing JSON:", e);
            controller.error(e);
            await writer.abort(e); // Abort the writer in case of an error
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
  return stream;
};

function isValidNode(element: any): element is Node {
  return (
    typeof element.id === "string" &&
    typeof element.data === "object" &&
    typeof element.data.label === "string" &&
    typeof element.position === "object" &&
    typeof element.position.x === "number" &&
    typeof element.position.y === "number"
  );
}

function isValidEdge(element: any): element is Edge {
  return (
    typeof element.id === "string" &&
    typeof element.source === "string" &&
    typeof element.target === "string"
  );
}

function filterValidElements(elements: any[]): Element[] {
  return elements.filter(
    (element) => isValidNode(element) || isValidEdge(element),
  );
}

export const parseCodeFromMessage = (message: unknown) => {
  if (typeof message !== "string") {
    console.info("Expected a string but got:", typeof message);
    return [];
  }

  let elements = [];

  try {
    // Remove lines at the beginning until { or ```typescript is detected
    let cleanedMessage = message;
    console.info("Step 1:", cleanedMessage);
    /* eslint-disable quotes */
    if (cleanedMessage.includes("const elements")) {
      cleanedMessage = cleanedMessage.replace(/.*?(?=const elements)/s, "");
      cleanedMessage = cleanedMessage.replace(/return elements.*$/s, "");
      cleanedMessage = cleanedMessage.replace(
        /export default elements.*$/s,
        "",
      );
    } else {
      if (cleanedMessage.includes("```typescript")) {
        cleanedMessage = cleanedMessage.replace(/.*?```typescript\s*/s, "");
        cleanedMessage = cleanedMessage.replace(/(```[\s\S]*?$)/, "");
        console.info("Step 2:", cleanedMessage);
      } else {
        cleanedMessage = cleanedMessage.replace(/^[^{]*(\{)/, "$1");
        console.info("Step 3:", cleanedMessage);
      }
      console.info("Step 4:", cleanedMessage);
      /* eslint-enable quotes */

      // Try to parse as JSON first
      try {
        const parsedJSON = JSON.parse(cleanedMessage);
        if (parsedJSON.elements) {
          console.info("Parsed JSON:", parsedJSON);
          return parsedJSON.elements;
        }
      } catch (jsonError) {
        // Not a JSON, continue with regex parsing
      }
    }

    console.info("Step 5:", cleanedMessage);
    // Regular expression for matching the elements array initialization
    // eslint-disable-next-line quotes
    const initRegex = /const elements = (\[[\s\S]*?\]);/;
    const initMatch = cleanedMessage.match(initRegex);
    if (initMatch) {
      console.info("Matched init:", initMatch);
      elements = eval(initMatch[1]);
      console.info("Elements:", elements);
    }

    // Regular expression for matching the elements.push(...) occurrences
    // eslint-disable-next-line quotes
    const pushRegex = /elements\.push\(([\s\S]*?)\);/g;
    let pushMatch;
    while ((pushMatch = pushRegex.exec(cleanedMessage)) !== null) {
      // Using eval is generally not recommended, but in this case, we are assuming the message is trusted
      // Be VERY careful when using eval, especially with untrusted data
      const newElement = eval(`(${pushMatch[1]})`);
      elements.push(newElement);
    }
  } catch (e) {
    console.error("Error parsing elements:", e);
    return [];
  }

  console.info("Elements:", elements);
  const validElements = filterValidElements(elements);
  console.info("Valid elements:", validElements);
  return validElements;
};
