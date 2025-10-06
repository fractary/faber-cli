"use strict";
/**
 * Validation reporting utilities for Codex CLI
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationReporter = void 0;
const chalk_1 = __importDefault(require("chalk"));
class ValidationReporter {
    constructor() {
        this.results = [];
    }
    /**
     * Add validation result
     */
    addResult(result) {
        this.results.push(result);
    }
    /**
     * Get all results
     */
    getResults() {
        return this.results;
    }
    /**
     * Get summary counts
     */
    getSummary() {
        let valid = 0;
        let errors = 0;
        let warnings = 0;
        for (const result of this.results) {
            if (result.valid && result.errors.length === 0) {
                valid++;
            }
            errors += result.errors.length;
            warnings += result.warnings.length;
        }
        return { valid, errors, warnings };
    }
    /**
     * Check if validation passed
     */
    hasErrors() {
        return this.results.some(r => r.errors.length > 0);
    }
    /**
     * Check if there are warnings
     */
    hasWarnings() {
        return this.results.some(r => r.warnings.length > 0);
    }
    /**
     * Print results to console
     */
    print(options = {}) {
        const { showWarnings = true, verbose = false } = options;
        for (const result of this.results) {
            if (result.valid && result.errors.length === 0 && result.warnings.length === 0) {
                // Success
                console.log(chalk_1.default.green('✓'), chalk_1.default.gray(result.filePath));
                if (verbose && result.metadata) {
                    this.printMetadata(result.metadata);
                }
            }
            else if (result.errors.length > 0) {
                // Errors
                console.log(chalk_1.default.red('✗'), chalk_1.default.gray(result.filePath));
                for (const error of result.errors) {
                    console.log(chalk_1.default.red('  - Error:'), error);
                }
            }
            if (showWarnings && result.warnings.length > 0) {
                // Warnings
                if (result.errors.length === 0) {
                    console.log(chalk_1.default.yellow('⚠'), chalk_1.default.gray(result.filePath));
                }
                for (const warning of result.warnings) {
                    console.log(chalk_1.default.yellow('  - Warning:'), warning);
                }
            }
        }
        // Print summary
        const summary = this.getSummary();
        console.log(this.formatSummary(summary));
    }
    /**
     * Print metadata
     */
    printMetadata(metadata) {
        if (metadata.org)
            console.log(chalk_1.default.dim(`    org: ${metadata.org}`));
        if (metadata.system)
            console.log(chalk_1.default.dim(`    system: ${metadata.system}`));
        if (metadata.codex_sync_include) {
            console.log(chalk_1.default.dim(`    includes: ${metadata.codex_sync_include.join(', ')}`));
        }
        if (metadata.codex_sync_exclude) {
            console.log(chalk_1.default.dim(`    excludes: ${metadata.codex_sync_exclude.join(', ')}`));
        }
    }
    /**
     * Format summary
     */
    formatSummary(summary) {
        const parts = [];
        if (summary.valid > 0) {
            parts.push(chalk_1.default.green(`${summary.valid} valid`));
        }
        if (summary.errors > 0) {
            parts.push(chalk_1.default.red(`${summary.errors} error${summary.errors !== 1 ? 's' : ''}`));
        }
        if (summary.warnings > 0) {
            parts.push(chalk_1.default.yellow(`${summary.warnings} warning${summary.warnings !== 1 ? 's' : ''}`));
        }
        return `\nSummary: ${parts.join(', ')}`;
    }
    /**
     * Export results as JSON
     */
    toJSON() {
        return {
            results: this.results,
            summary: this.getSummary()
        };
    }
}
exports.ValidationReporter = ValidationReporter;
//# sourceMappingURL=validation-reporter.js.map