import { chromium, type Browser, type Page } from "playwright";
import sharp from "sharp";

export interface StoredScreenshot {
  id: string;
  base64: string;
  width: number;
  height: number;
  url: string;
  timestamp: number;
}

export interface ScreenshotResult extends StoredScreenshot {}

const MAX_STORED = 10;
const RESIZE_WIDTH = 1072;

let browser: Browser | null = null;
let counter = 0;
const store = new Map<string, StoredScreenshot>();

async function ensureBrowser(): Promise<Browser> {
  if (browser && browser.isConnected()) return browser;

  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err);
    if (
      message.includes("Executable doesn't exist") ||
      message.includes("browserType.launch")
    ) {
      throw new Error(
        "Chromium is not installed. Run: npx playwright install chromium"
      );
    }
    throw err;
  }

  // Clean up on process exit
  const doCleanup = () => {
    cleanup().catch(() => {});
  };
  process.on("exit", doCleanup);
  process.on("SIGINT", () => {
    doCleanup();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    doCleanup();
    process.exit(0);
  });

  return browser;
}

export async function takeScreenshot(
  url: string,
  viewport?: { width?: number; height?: number }
): Promise<ScreenshotResult> {
  const b = await ensureBrowser();
  const page: Page = await b.newPage({
    viewport: {
      width: viewport?.width ?? 1280,
      height: viewport?.height ?? 800,
    },
  });

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });

    // Take full-page screenshot
    const rawBuffer = await page.screenshot({ fullPage: true });

    // Resize to 1072px wide for token efficiency
    const resizedBuffer = await sharp(rawBuffer)
      .resize({ width: RESIZE_WIDTH })
      .png()
      .toBuffer();

    const metadata = await sharp(resizedBuffer).metadata();
    const base64 = resizedBuffer.toString("base64");

    // Generate sequential ID
    counter++;
    const id = `screenshot_${String(counter).padStart(3, "0")}`;

    const screenshot: StoredScreenshot = {
      id,
      base64,
      width: metadata.width ?? RESIZE_WIDTH,
      height: metadata.height ?? 0,
      url,
      timestamp: Date.now(),
    };

    // Store with circular buffer eviction
    store.set(id, screenshot);
    if (store.size > MAX_STORED) {
      const oldestKey = store.keys().next().value;
      if (oldestKey) store.delete(oldestKey);
    }

    return screenshot;
  } finally {
    await page.close();
  }
}

export function getScreenshot(id: string): StoredScreenshot | undefined {
  return store.get(id);
}

export function getAllScreenshotIds(): string[] {
  return Array.from(store.keys());
}

export async function cleanup(): Promise<void> {
  if (browser) {
    try {
      await browser.close();
    } catch {
      // Ignore close errors during shutdown
    }
    browser = null;
  }
}
