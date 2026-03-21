import { readFile } from "node:fs/promises";
import { createConnection } from "node:net";
import { join } from "node:path";
let cachedUrl = null;
const FRAMEWORK_PORTS = {
    vite: 5173,
    next: 3000,
    "react-scripts": 3000,
    "@sveltejs/kit": 5173,
    nuxt: 3000,
    "@angular/cli": 4200,
};
function parsePortFromScript(script) {
    // Match --port 3001, --port=3001, -p 3001, -p=3001
    const flagMatch = script.match(/(?:--port|--PORT|-p)[=\s]+(\d+)/);
    if (flagMatch)
        return parseInt(flagMatch[1], 10);
    // Match PORT=3001
    const envMatch = script.match(/PORT=(\d+)/);
    if (envMatch)
        return parseInt(envMatch[1], 10);
    return null;
}
async function readProjectPackageJson() {
    try {
        const content = await readFile(join(process.cwd(), "package.json"), "utf-8");
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
async function parsePackageJsonPort() {
    const pkg = await readProjectPackageJson();
    if (!pkg?.scripts)
        return null;
    // Check dev, start, serve scripts in priority order
    for (const key of ["dev", "start", "serve"]) {
        const script = pkg.scripts[key];
        if (script) {
            const port = parsePortFromScript(script);
            if (port)
                return port;
        }
    }
    return null;
}
async function detectFrameworkDefault() {
    const pkg = await readProjectPackageJson();
    if (!pkg)
        return null;
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [framework, port] of Object.entries(FRAMEWORK_PORTS)) {
        if (framework in allDeps)
            return port;
    }
    return null;
}
function checkPort(port, timeoutMs = 200) {
    return new Promise((resolve) => {
        const socket = createConnection({ port, host: "127.0.0.1" }, () => {
            socket.destroy();
            resolve(true);
        });
        socket.setTimeout(timeoutMs);
        socket.on("timeout", () => {
            socket.destroy();
            resolve(false);
        });
        socket.on("error", () => {
            socket.destroy();
            resolve(false);
        });
    });
}
async function scanOpenPorts() {
    for (let port = 3000; port <= 9000; port++) {
        const open = await checkPort(port);
        if (open)
            return port;
    }
    return null;
}
export async function detectDevServerUrl() {
    if (cachedUrl)
        return cachedUrl;
    // Step 1: Parse package.json scripts for port flags
    const scriptPort = await parsePackageJsonPort();
    if (scriptPort) {
        cachedUrl = `http://localhost:${scriptPort}`;
        return cachedUrl;
    }
    // Step 2: Check framework defaults
    const frameworkPort = await detectFrameworkDefault();
    if (frameworkPort) {
        cachedUrl = `http://localhost:${frameworkPort}`;
        return cachedUrl;
    }
    // Step 3: TCP scan
    const openPort = await scanOpenPorts();
    if (openPort) {
        cachedUrl = `http://localhost:${openPort}`;
        return cachedUrl;
    }
    throw new Error("No dev server detected. Start your dev server and try again.");
}
export async function detectFrameworkName() {
    const pkg = await readProjectPackageJson();
    if (!pkg)
        return undefined;
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const framework of Object.keys(FRAMEWORK_PORTS)) {
        if (framework in allDeps)
            return framework;
    }
    return undefined;
}
//# sourceMappingURL=detect.js.map