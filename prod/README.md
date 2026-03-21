# vibe-eyes

[![npm version](https://img.shields.io/npm/v/vibe-eyes)](https://www.npmjs.com/package/vibe-eyes)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

A visual feedback loop for Claude Code. Claude takes a screenshot of your running dev server, evaluates what it sees, and autonomously iterates until the UI looks correct — without asking you to look at anything.

Works in every environment Claude Code runs in: terminal, VS Code extension, Cursor, Windsurf.

---

## Setup (2 steps)

**Step 1** — Run once in your project root:

```bash
npx vibe-eyes init
```

Appends the visual feedback skill to `CLAUDE.md`, installs Chromium, and prints your config.

**Step 2** — Add to `.mcp.json`:

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

## The Three Tools

| Tool | Description |
|---|---|
| `preview_screenshot(url?, viewport?)` | Screenshot your dev server. Auto-detects port. Returns base64 PNG + `screenshot_id`. Resized to 1072px wide. |
| `preview_diff(before_id, after_id, context?)` | Returns both screenshots to Claude with labels. Claude's vision does the comparison. No external API calls. |
| `preview_status()` | Checks if the dev server is reachable. Returns detected URL. |

---

## CLI Commands

```bash
npx vibe-eyes init              # First-time setup
npx vibe-eyes screenshot [url]  # Manual screenshot → saved to disk
npx vibe-eyes config            # Print MCP config block
```

---

## Requirements

- Node.js 18+
- Claude Code (terminal, VS Code extension, Cursor, or Windsurf)
- A running dev server

---

## How Port Detection Works

1. Reads `package.json` scripts for `--port`, `-p`, `PORT=` flags
2. Checks framework defaults (Vite: 5173, Next.js: 3000, SvelteKit: 5173, etc.)
3. TCP scans ports 3000–9000

No config file needed.

---

MIT License
