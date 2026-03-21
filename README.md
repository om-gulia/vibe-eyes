# vibe-eyes

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

**A visual feedback loop for Claude Code.** Claude takes a screenshot of your running dev server, evaluates what it sees, and iterates until the UI looks correct — without ever asking you to look at the screen.

Works everywhere Claude Code runs: VS Code, Cursor, Windsurf, terminal CLI.

---

## The Problem

Every screenshot MCP on the market is a dumb camera. You ask Claude to fix a layout bug, it makes a change, and then asks _you_ to check if it looks right. That's not a feedback loop — that's Claude handing the wheel back to you at the worst possible moment.

Claude Code Desktop has a smart preview built in. But it only works in one app.

**vibe-eyes is the smart preview that works everywhere.**

---

## Works With Everything

vibe-eyes screenshots the full rendered page using a headless Chromium browser. If you can see it in a browser, vibe-eyes can screenshot it.

- Static HTML / CSS
- React, Vue, Svelte, Angular
- Next.js, Nuxt, SvelteKit, Astro
- Tailwind, Bootstrap, vanilla CSS
- Canvas, SVG, WebGL

No framework restrictions. No technology limitations.

---

## Setup

**Step 1** — Run this in your project root:

```bash
npx github:om-gulia/vibe-eyes init
```

This does three things:
- Installs the Playwright Chromium browser (~150MB, first run only)
- Appends the visual feedback skill to your `CLAUDE.md`
- Prints the MCP config block to add

**Step 2** — Add the printed config to your `.mcp.json`:

```json
{
  "mcpServers": {
    "vibe-eyes": {
      "command": "npx",
      "args": ["github:om-gulia/vibe-eyes"]
    }
  }
}
```

**Step 3** — Restart Claude Code and start your dev server.

Done. Claude will use the visual feedback loop automatically on any UI task.

---

## How It Works

### The autonomous loop

Once installed, Claude runs this loop automatically on any UI task — no prompting required:

1. `preview_status()` — confirm the dev server is running
2. `preview_screenshot()` — capture the UI before changes
3. Make the code change
4. Wait for hot-reload
5. `preview_screenshot()` — capture the UI after
6. `preview_diff(before, after)` — compare both screenshots
7. If it looks correct → done
8. If issues exist → fix and repeat
9. Never asks you to look at the screen

### The skill layer

The `CLAUDE.md` skill block that `init` injects is the real differentiator. It teaches Claude _when_ to use the tools (layout, components, styles — not logic-only changes) and _how_ to evaluate what it sees. Without this, the MCP is just another camera.

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

1. **Parse `package.json` scripts** — looks for `--port`, `-p`, or `PORT=` flags
2. **Framework defaults** — Vite: 5173, Next.js: 3000, SvelteKit: 5173, Nuxt: 3000, Angular: 4200
3. **TCP scan** — scans ports 3000–9000 for an open connection

---

## CLI Reference

```bash
# First-time project setup
npx github:om-gulia/vibe-eyes init

# Take a manual screenshot and save to disk
npx github:om-gulia/vibe-eyes screenshot [url]

# Print the MCP config block
npx github:om-gulia/vibe-eyes config
```

---

## Requirements

- Node.js 18+
- Claude Code (VS Code extension, Cursor, Windsurf, or terminal CLI)
- A running dev server

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
