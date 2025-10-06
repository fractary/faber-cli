/**
 * Output formatting utilities for Codex CLI
 */
import type { Metadata } from '@fractary/codex';
/**
 * Format metadata for display
 */
export declare function formatMetadata(metadata: Metadata, indent?: number): string;
/**
 * Format validation error
 */
export declare function formatValidationError(filePath: string, error: string): string;
/**
 * Format validation success
 */
export declare function formatValidationSuccess(filePath: string, metadata?: Metadata): string;
/**
 * Format validation warning
 */
export declare function formatValidationWarning(filePath: string, warning: string): string;
/**
 * Format summary
 */
export declare function formatSummary(valid: number, errors: number, warnings: number): string;
/**
 * Format routing decision
 */
export declare function formatRoutingDecision(repo: string, willSync: boolean, reason: string): string;
/**
 * Format JSON output
 */
export declare function formatJSON(data: any): string;
/**
 * Format content preview
 */
export declare function formatContentPreview(content: string, maxLines?: number): string;
//# sourceMappingURL=output-formatter.d.ts.map