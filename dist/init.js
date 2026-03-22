import { readFile, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SKILL_MARKER = "## Visual Feedback Loop (vibe-eyes)";
export async function runInit() {
    // Read the skill template from the package
    const templatePath = join(__dirname, "..", "skill-template.md");
    let skillContent;
    try {
        skillContent = await readFile(templatePath, "utf-8");
    }
    catch {
        console.error("Error: Could not read skill-template.md. Is the package installed correctly?");
        process.exit(1);
    }
    const claudeMdPath = join(process.cwd(), "CLAUDE.md");
    // Check if CLAUDE.md exists
    let existing = "";
    let fileExists = false;
    try {
        await access(claudeMdPath);
        existing = await readFile(claudeMdPath, "utf-8");
        fileExists = true;
    }
    catch {
        fileExists = false;
    }
    // Check if already initialized
    if (fileExists && existing.includes(SKILL_MARKER)) {
        console.log("✓ CLAUDE.md already contains the vibe-eyes skill block.");
        await configureMcpJson();
        console.log("");
        console.log("✓ Setup complete. Restart Claude Code to activate vibe-eyes.");
        return;
    }
    // Append or create
    if (fileExists) {
        const separator = existing.endsWith("\n") ? "\n" : "\n\n";
        await writeFile(claudeMdPath, existing + separator + skillContent, "utf-8");
    }
    else {
        await writeFile(claudeMdPath, skillContent, "utf-8");
    }
    console.log("✓ Added visual feedback loop skill to CLAUDE.md");
    // Install Playwright Chromium browser
    console.log("Installing Playwright Chromium (this may take a moment on first run)...");
    try {
        execSync("npx playwright install chromium", { stdio: "inherit" });
        console.log("✓ Chromium ready");
    }
    catch {
        console.warn("⚠ Could not auto-install Chromium. Run manually: npx playwright install chromium");
    }
    // Auto-configure .mcp.json
    await configureMcpJson();
    console.log("");
    console.log("✓ Setup complete. Restart Claude Code to activate vibe-eyes.");
}
const MCP_ENTRY = {
    command: "npx",
    args: ["github:om-gulia/vibe-eyes"],
};
async function configureMcpJson() {
    const mcpJsonPath = join(process.cwd(), ".mcp.json");
    let mcpConfig = {};
    try {
        const raw = await readFile(mcpJsonPath, "utf-8");
        mcpConfig = JSON.parse(raw);
    }
    catch {
        // File doesn't exist or is invalid — start fresh
    }
    // Ensure mcpServers object exists
    if (!mcpConfig.mcpServers || typeof mcpConfig.mcpServers !== "object") {
        mcpConfig.mcpServers = {};
    }
    const servers = mcpConfig.mcpServers;
    if (servers["vibe-eyes"]) {
        console.log("✓ .mcp.json already has vibe-eyes configured");
        return;
    }
    servers["vibe-eyes"] = MCP_ENTRY;
    await writeFile(mcpJsonPath, JSON.stringify(mcpConfig, null, 2) + "\n", "utf-8");
    console.log("✓ Added vibe-eyes to .mcp.json");
}
//# sourceMappingURL=init.js.map