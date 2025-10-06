/**
 * Validation reporting utilities for Codex CLI
 */
import type { Metadata } from '@fractary/codex';
export interface ValidationResult {
    filePath: string;
    valid: boolean;
    metadata?: Metadata;
    errors: string[];
    warnings: string[];
}
export declare class ValidationReporter {
    private results;
    /**
     * Add validation result
     */
    addResult(result: ValidationResult): void;
    /**
     * Get all results
     */
    getResults(): ValidationResult[];
    /**
     * Get summary counts
     */
    getSummary(): {
        valid: number;
        errors: number;
        warnings: number;
    };
    /**
     * Check if validation passed
     */
    hasErrors(): boolean;
    /**
     * Check if there are warnings
     */
    hasWarnings(): boolean;
    /**
     * Print results to console
     */
    print(options?: {
        showWarnings?: boolean;
        verbose?: boolean;
    }): void;
    /**
     * Print metadata
     */
    private printMetadata;
    /**
     * Format summary
     */
    private formatSummary;
    /**
     * Export results as JSON
     */
    toJSON(): any;
}
//# sourceMappingURL=validation-reporter.d.ts.map