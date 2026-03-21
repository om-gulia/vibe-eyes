# vibe-eyes

[![npm version](https://img.shields.io/npm/v/vibe-eyes)](https://www.npmjs.com/package/vibe-eyes)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

**A visual feedback loop for Claude Code.** Claude takes a screenshot of your running dev server, evaluates what it sees, and iterates until the UI looks correct — without ever asking you to look at the screen.

Works in every environment Claude Code runs in: terminal, VS Code extension, Cursor, Windsurf.

---

## The Problem

Every screenshot MCP on the market is a dumb camera. You ask Claude to fix a layout bug, it makes a change, and then asks _you_ to check if it looks right. That's not a feedback loop — that's Claude handing the wheel back to you at the worst possible moment.

Claude Code Desktop has a smart preview built in. But it only works in one app.

**vibe-eyes is the smart preview that works everywhere.**

---

## Setup

Two steps. That's it.

**Step 1** — Run this once in your project root:

```bash
npx vibe-eyes init
```

This does three things:
- Appends the visual feedback skill to your `CLAUDE.md`
- Installs the Playwright Chromium browser (first run only, ~150MB)
- Prints the config block to add

**Step 2** — Add the printed config to your `.mcp.json`:

```json
{
  "mcpServers": {
    "vibe-eyes": {
      "command": "npx",
      "args": ["vibe-eyes"]
    }
  }
}
```

Restart Claude Code. Done.

---

## How It Works

### The autonomous loop

Once installed, Claude runs this loop automatically on any UI task — no prompting required:

1. `preview_status()` — confirm the dev server is running
2. `preview_screenshot()` — capture the UI before changes, store as `before`
3. Make the code change
4. Wait 1500ms for hot-reload
5. `preview_screenshot()` — capture the UI after, store as `after`
6. `preview_diff(before_id, after_id, context="what changed")` — compare both
7. Look at both images. Identify layout issues, broken spacing, regressions
8. If it looks correct → done
9. If issues exist → fix and repeat from step 3
10. Never asks you to look at the screen

### The skill layer

The real moat is the `CLAUDE.md` skill block that `init` injects. It teaches Claude _when_ to use the tools (layout, components, styles — not logic-only changes) and how to evaluate what it sees. Without this, the MCP is just another camera.

---

## The Three Tools

| Tool | What it does |
|---|---|
| `preview_screenshot(url?, viewport?)` | Takes a screenshot of your dev server. Auto-detects the port. Returns base64 PNG + a `screenshot_id`. Images are resized to 1072px wide for token efficiency. |
| `preview_diff(before_id, after_id, context?)` | Returns both screenshots to Claude with context labels. Claude's own vision does the comparison — no external API calls, no extra cost. |
| `preview_status()` | Checks if the dev server is reachable and returns the detected URL. Claude calls this before starting any visual task. |

**Zero AI in the server.** All visual evaluation happens inside Claude Code when it receives the images as tool results. The server is purely browser automation.

---

## Port Auto-Detection

vibe-eyes finds your dev server automatically. No config needed.

Detection runs in this order:

1. **Parse `package.json` scripts** — looks for `--port`, `-p`, or `PORT=` flags
2. **Framework defaults** — Vite: 5173, Next.js: 3000, SvelteKit: 5173, Nuxt: 3000, Angular: 4200
3. **TCP scan** — scans ports 3000–9000 for an open connection

---

## CLI Reference

```bash
# First-time project setup
npx vibe-eyes init

# Take a manual screenshot and save to disk
npx vibe-eyes screenshot [url]

# Print the MCP config block
npx vibe-eyes config
```

---

## Requirements

- Node.js 18+
- Claude Code (terminal, VS Code extension, Cursor, or Windsurf)
- A running dev server

---

## Repository Structure

```
vibe-eyes/
├── prod/            # The npm package — everything that gets published
│   ├── src/         # TypeScript source
│   ├── dist/        # Compiled output (gitignored, built on publish)
│   ├── package.json
│   └── skill-template.md
├── examples/
│   └── vite-react/  # Demo project for testing vibe-eyes locally
└── README.md
```

To publish: `cd prod && npm publish`

To run the example: `cd examples/vite-react && npm install && npm run dev`

---

## Why Not Just Use Another Screenshot MCP?

| Tool | What it does | Why it falls short |
|---|---|---|
| screenshot-mcp | Takes a screenshot | Passive camera. No loop. |
| Chrome DevTools MCP | Full DevTools access | Requires `--remote-debugging-port`. Complex setup. |
| Claude Code Desktop | Smart preview, autonomous loop | **Locked to the Desktop app only** |
| **vibe-eyes** | Smart loop, works everywhere | ✓ |

---

## License

MIT
