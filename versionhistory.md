# Version History

## [2026-03-21] - Initial Project Setup
**Changes:**
- Created project scaffolding with TypeScript, MCP SDK, Playwright, and Sharp
- Defined file structure: index.ts (MCP server + CLI), browser.ts (Playwright), detect.ts (port detection), init.ts (CLI init)
- Created skill-template.md with the visual feedback loop instructions for CLAUDE.md

**Architecture Notes:**
- MCP server using stdio transport via @modelcontextprotocol/sdk
- Three tools: preview_screenshot, preview_diff, preview_status
- Lazy singleton Playwright browser lifecycle
- In-memory circular buffer for screenshot storage (max 10)
- Sharp for resizing screenshots to 1072px wide

**Reason:**
- Initial build of the vibe-eyes MCP server to give Claude Code a visual feedback loop for frontend development
