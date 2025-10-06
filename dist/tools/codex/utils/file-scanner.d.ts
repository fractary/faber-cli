/**
 * File scanning utilities for Codex CLI
 */
export interface ScanOptions {
    pattern?: string;
    cwd?: string;
    ignore?: string[];
}
/**
 * Scan for files matching a pattern
 */
export declare function scanFiles(options?: ScanOptions): Promise<string[]>;
/**
 * Check if a file exists
 */
export declare function fileExists(filePath: string): Promise<boolean>;
/**
 * Read file content
 */
export declare function readFileContent(filePath: string): Promise<string>;
/**
 * Write file content
 */
export declare function writeFileContent(filePath: string, content: string): Promise<void>;
/**
 * Ensure directory exists
 */
export declare function ensureDirectory(dirPath: string): Promise<void>;
//# sourceMappingURL=file-scanner.d.ts.map