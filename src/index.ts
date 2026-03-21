#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];

if (command === "init") {
  const { runInit } = await import("./init.js");
  await runInit();
} else if (command === "screenshot") {
  const url = process.argv[3];
  const { writeFile } = await import("node:fs/promises");
  const { detectDevServerUrl } = await import("./detect.js");
  const { takeScreenshot, cleanup } = await import("./browser.js");

  try {
    const targetUrl = url || (await detectDevServerUrl());
    console.log(`Taking screenshot of ${targetUrl}...`);
    const result = await takeScreenshot(targetUrl);
    const buffer = Buffer.from(result.base64, "base64");
    const outPath = "vibe-eyes-screenshot.png";
    await writeFile(outPath, buffer);
    console.log(`Screenshot saved to ${outPath} (${result.width}x${result.height})`);
  } finally {
    await cleanup();
  }
} else if (command === "config") {
  const config = {
    mcpServers: {
      "vibe-eyes": {
        command: "npx",
        args: ["vibe-eyes"],
      },
    },
  };
  console.log("Add this to your .mcp.json:\n");
  console.log(JSON.stringify(config, null, 2));
} else {
  // Default: start MCP server
  await startServer();
}

async function startServer(): Promise<void> {
  const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");
  const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
  const { z } = await import("zod");
  const { detectDevServerUrl, detectFrameworkName } = await import("./detect.js");
  const { takeScreenshot, getScreenshot, getAllScreenshotIds, cleanup } = await import("./browser.js");

  const server = new McpServer({
    name: "vibe-eyes",
    version: "0.1.0",
  });

  // preview_screenshot
  server.registerTool(
    "preview_screenshot",
    {
      title: "Preview Screenshot",
      description:
        "Takes a screenshot of the running dev server. Returns a base64 PNG image and a screenshot ID for use with preview_diff.",
      inputSchema: {
        url: z.string().optional().describe("URL to screenshot. Defaults to auto-detected dev server."),
        viewport_width: z.number().optional().describe("Viewport width in pixels. Default: 1280"),
        viewport_height: z.number().optional().describe("Viewport height in pixels. Default: 800"),
      },
    },
    async ({ url, viewport_width, viewport_height }) => {
      try {
        const targetUrl = url || (await detectDevServerUrl());
        const viewport =
          viewport_width || viewport_height
            ? { width: viewport_width, height: viewport_height }
            : undefined;

        const result = await takeScreenshot(targetUrl, viewport);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                screenshot_id: result.id,
                width: result.width,
                height: result.height,
                url: result.url,
                timestamp: result.timestamp,
              }),
            },
            {
              type: "image" as const,
              data: result.base64,
              mimeType: "image/png",
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // preview_diff
  server.registerTool(
    "preview_diff",
    {
      title: "Preview Diff",
      description:
        "Returns two stored screenshots side by side for visual comparison. Use screenshot IDs from preview_screenshot results.",
      inputSchema: {
        before_id: z.string().describe("Screenshot ID for the 'before' image"),
        after_id: z.string().describe("Screenshot ID for the 'after' image"),
        context: z.string().optional().describe("Description of what changed between the screenshots"),
      },
    },
    async ({ before_id, after_id, context }) => {
      const before = getScreenshot(before_id);
      const after = getScreenshot(after_id);

      if (!before) {
        const available = getAllScreenshotIds().join(", ") || "none";
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: Screenshot "${before_id}" not found. Available: ${available}`,
            },
          ],
          isError: true,
        };
      }

      if (!after) {
        const available = getAllScreenshotIds().join(", ") || "none";
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: Screenshot "${after_id}" not found. Available: ${available}`,
            },
          ],
          isError: true,
        };
      }

      const contextLabel = context ? `Context: ${context}\n` : "";

      return {
        content: [
          {
            type: "text" as const,
            text: `${contextLabel}Before: ${before_id} (${before.width}x${before.height}, ${before.url})\nAfter: ${after_id} (${after.width}x${after.height}, ${after.url})`,
          },
          {
            type: "image" as const,
            data: before.base64,
            mimeType: "image/png",
          },
          {
            type: "image" as const,
            data: after.base64,
            mimeType: "image/png",
          },
        ],
      };
    }
  );

  // preview_status
  server.registerTool(
    "preview_status",
    {
      title: "Preview Status",
      description:
        "Checks if the dev server is reachable and returns the detected URL. Call this before starting visual work to confirm the server is up.",
      inputSchema: {},
    },
    async () => {
      try {
        const url = await detectDevServerUrl();
        const framework = await detectFrameworkName();

        // Try to reach the server
        let available = false;
        try {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(5000),
          });
          available = response.ok || response.status < 500;
        } catch {
          available = false;
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ available, url, framework: framework || "unknown" }),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                available: false,
                url: null,
                error: err instanceof Error ? err.message : String(err),
              }),
            },
          ],
        };
      }
    }
  );

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    await cleanup();
    await server.close();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await cleanup();
    await server.close();
    process.exit(0);
  });

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
