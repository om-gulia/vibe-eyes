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
        console.log("Already initialized — CLAUDE.md already contains the vibe-eyes skill block.");
        printConfig();
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
    console.log("");
    printConfig();
}
function printConfig() {
    console.log("Add this to your .mcp.json:");
    console.log("");
    const config = {
        mcpServers: {
            "vibe-eyes": {
                command: "npx",
                args: ["vibe-eyes"],
            },
        },
    };
    console.log(JSON.stringify(config, null, 2));
}
//# sourceMappingURL=init.js.map