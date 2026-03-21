# vibe-eyes

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

**An MCP server that gives Claude Code a visual feedback loop.** Claude screenshots your running dev server, evaluates what it sees using its own vision, and iterates until the UI looks correct — without ever asking you to check the screen.

---

## What This Is (and Isn't)

vibe-eyes is **not** a Chrome extension. It's **not** limited to any framework or technology.

It is a background server that Claude Code communicates with. It uses a headless Chromium browser (via Playwright) to take full-page screenshots of **any website running on localhost** — exactly as it would appear in a real browser.

**Works with everything:**
- Static HTML / CSS
- React, Vue, Svelte, Angular
- Next.js, Nuxt, SvelteKit, Astro
- Tailwind, Bootstrap, vanilla CSS
- Canvas, SVG, WebGL — anything visible on screen

If you can see it in a browser, vibe-eyes can screenshot it.

---

## Prerequisites

Before setting up vibe-eyes, make sure you have:

1. **Node.js 18 or higher** — check with `node --version`
2. **Claude Code** — the VS Code extension, Cursor, Windsurf, or the terminal CLI

That's all. No other global installs needed.

---

## Setup (Full Walkthrough)

### Step 1: Open your project

Open the frontend project you want to use vibe-eyes with in your editor (VS Code, Cursor, or Windsurf).

### Step 2: Run the init command

Open a terminal **in your project root** and run:

```bash
npx github:om-gulia/vibe-eyes init
```

> If vibe-eyes is published to npm, you can also use `npx vibe-eyes init`

This command does three things:
1. Downloads vibe-eyes (first time only)
2. Installs the Playwright Chromium browser (~150MB, first time only)
3. Appends a skill block to your `CLAUDE.md` that teaches Claude the visual feedback loop
4. Prints the MCP config you need for the next step

### Step 3: Add the MCP config

Create a file called `.mcp.json` in your project root (or add to it if it exists):

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

### Step 4: Restart Claude Code

- **VS Code / Cursor / Windsurf:** Reload the editor window (Ctrl+Shift+P → "Reload Window")
- **Terminal CLI:** Just restart the session

### Step 5: Start your dev server

```bash
npm run dev
```

Or whatever command starts your project (`next dev`, `vite`, `ng serve`, etc.).

### Step 6: Ask Claude to make a UI change

That's it. Claude will automatically:
1. Check that the dev server is running
2. Screenshot the page before making changes
3. Make the code change
4. Screenshot again after hot-reload
5. Compare both screenshots and evaluate the result
6. If something looks off, fix it and repeat
7. Never ask you to look at the screen

---

## How the Autonomous Loop Works

vibe-eyes exposes three MCP tools. Claude uses them automatically — you don't need to mention them:

| Tool | What it does |
|---|---|
| `preview_status()` | Checks if the dev server is reachable. Returns detected URL. |
| `preview_screenshot(url?, viewport?)` | Takes a full-page screenshot. Auto-detects port. Resizes to 1072px wide for token efficiency. Returns image + screenshot ID. |
| `preview_diff(before_id, after_id, context?)` | Returns both screenshots to Claude with labels. Claude's own vision evaluates the difference. |

**There is zero AI inside the server.** The MCP server is purely browser automation. All visual evaluation is done by Claude Code itself when it receives the images as tool results. No external API calls, no extra cost.

### The skill layer

The `init` command writes a skill block to your `CLAUDE.md` that teaches Claude:
- **When** to use the visual loop (layout, styling, components — not logic-only changes)
- **How** to evaluate what it sees (broken layout, clipped content, spacing issues)
- **When to stop** (4+ attempts with no improvement → ask the human)

Without this skill, any screenshot MCP is just a camera. The skill is what makes it autonomous.

---

## Port Auto-Detection

vibe-eyes finds your dev server automatically. No config needed.

1. **Reads `package.json` scripts** — looks for `--port`, `-p`, or `PORT=` flags
2. **Framework defaults** — Vite: 5173, Next.js: 3000, SvelteKit: 5173, Nuxt: 3000, Angular: 4200
3. **TCP scan** — scans ports 3000–9000 for an open connection

---

## CLI Reference

```bash
npx github:om-gulia/vibe-eyes init              # First-time project setup
npx github:om-gulia/vibe-eyes screenshot [url]   # Manual screenshot → saved to disk
npx github:om-gulia/vibe-eyes config             # Print MCP config block
```

---

## Repository Structure

```
vibe-eyes/
├── src/              # TypeScript source (4 files)
│   ├── index.ts      # MCP server + CLI entry point
│   ├── browser.ts    # Playwright screenshots, Sharp resize, storage
│   ├── detect.ts     # Port auto-detection
│   └── init.ts       # CLI init command
├── dist/             # Compiled output (gitignored)
├── skill-template.md # CLAUDE.md skill block (source of truth)
├── examples/
│   └── vite-react/   # Demo project for testing locally
├── package.json
└── README.md
```

---

## Comparison

| Tool | What it does | Limitation |
|---|---|---|
| screenshot-mcp | Takes a screenshot | Passive camera. No evaluation, no loop. |
| Chrome DevTools MCP | Full DevTools access | Requires `--remote-debugging-port`. Complex. |
| Claude Code Desktop preview | Smart preview with auto-loop | **Only works in the Desktop app** |
| **vibe-eyes** | Smart loop with autonomous evaluation | Works everywhere Claude Code runs |

---

## License

MIT
