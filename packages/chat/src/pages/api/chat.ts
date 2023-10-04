import WebSocket from "ws";
const { Server } = WebSocket;
import { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import { OpenAIStream } from "common-utils";
import { Buffer } from "buffer";

// Initialize a WebSocket server instance
const wss = new Server({ noServer: true });

export const config = {
  api: {
    bodyParser: false, // Disabling body parser
  },
};

wss.on("connection", function connection(ws) {
  ws.on("message", async function incoming(message) {
    try {
      const parsedMessage = JSON.parse(message.toString());

      // Extract relevant info
      const { messages, model, apiKey } = parsedMessage;

      if (!messages || !model || !apiKey) {
        ws.send(JSON.stringify({ error: "Missing required fields" }));
        return;
      }

      const writableStream = new WritableStream({
        async write(chunk) {
          if (ws.readyState === ws.OPEN) {
            ws.send(chunk);
          }
        },
        close() {
          ws.close();
        },
        abort(reason) {
          console.error("Stream aborted:", reason);
          ws.close();
        },
      });

      await OpenAIStream(writableStream, messages, model, apiKey);
    } catch (error) {
      console.error(error);
      ws.send(JSON.stringify({ error: "Internal Server Error" }));
    }
  });
});

export async function chat(req: NextApiRequest, res: NextApiResponse) {
  if (!req.socket) {
    return res
      .status(500)
      .json({ error: "The request must be a WebSocket request" });
  }
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), function done(ws) {
    wss.emit("connection", ws, req);
  });
}
