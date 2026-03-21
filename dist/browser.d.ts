export interface StoredScreenshot {
    id: string;
    base64: string;
    width: number;
    height: number;
    url: string;
    timestamp: number;
}
export interface ScreenshotResult extends StoredScreenshot {
}
export declare function takeScreenshot(url: string, viewport?: {
    width?: number;
    height?: number;
}): Promise<ScreenshotResult>;
export declare function getScreenshot(id: string): StoredScreenshot | undefined;
export declare function getAllScreenshotIds(): string[];
export declare function cleanup(): Promise<void>;
