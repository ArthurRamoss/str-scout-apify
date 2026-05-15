import type { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { buildMcpServer } from "./server.js";

export async function mcpHandler(req: Request, res: Response): Promise<void> {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = buildMcpServer();
  res.on("close", () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err: any) {
    console.error(`[mcp] handler error: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: `Internal error: ${err.message}` },
        id: null,
      });
    }
  }
}
