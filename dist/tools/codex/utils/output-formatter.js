"use strict";
/**
 * Output formatting utilities for Codex CLI
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMetadata = formatMetadata;
exports.formatValidationError = formatValidationError;
exports.formatValidationSuccess = formatValidationSuccess;
exports.formatValidationWarning = formatValidationWarning;
exports.formatSummary = formatSummary;
exports.formatRoutingDecision = formatRoutingDecision;
exports.formatJSON = formatJSON;
exports.formatContentPreview = formatContentPreview;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Format metadata for display
 */
function formatMetadata(metadata, indent = 2) {
    const indentStr = ' '.repeat(indent);
    const lines = [];
    // Core fields
    if (metadata.org)
        lines.push(`${indentStr}org: ${chalk_1.default.cyan(metadata.org)}`);
    if (metadata.system)
        lines.push(`${indentStr}system: ${chalk_1.default.cyan(metadata.system)}`);
    if (metadata.title)
        lines.push(`${indentStr}title: ${metadata.title}`);
    if (metadata.description)
        lines.push(`${indentStr}description: ${metadata.description}`);
    // Sync rules
    if (metadata.codex_sync_include && metadata.codex_sync_include.length > 0) {
        lines.push(`${indentStr}includes: ${chalk_1.default.green(metadata.codex_sync_include.join(', '))}`);
    }
    if (metadata.codex_sync_exclude && metadata.codex_sync_exclude.length > 0) {
        lines.push(`${indentStr}excludes: ${chalk_1.default.yellow(metadata.codex_sync_exclude.join(', '))}`);
    }
    // Visibility
    if (metadata.visibility) {
        lines.push(`${indentStr}visibility: ${chalk_1.default.blue(metadata.visibility)}`);
    }
    // Tags
    if (metadata.tags && metadata.tags.length > 0) {
        lines.push(`${indentStr}tags: ${metadata.tags.join(', ')}`);
    }
    // Dates
    if (metadata.created)
        lines.push(`${indentStr}created: ${metadata.created}`);
    if (metadata.updated)
        lines.push(`${indentStr}updated: ${metadata.updated}`);
    return lines.join('\n');
}
/**
 * Format validation error
 */
function formatValidationError(filePath, error) {
    return `${chalk_1.default.red('✗')} ${chalk_1.default.gray(filePath)}\n  ${chalk_1.default.red('-')} ${error}`;
}
/**
 * Format validation success
 */
function formatValidationSuccess(filePath, metadata) {
    let output = `${chalk_1.default.green('✓')} ${chalk_1.default.gray(filePath)}`;
    if (metadata) {
        const details = [];
        if (metadata.org)
            details.push(`org: ${metadata.org}`);
        if (metadata.system)
            details.push(`system: ${metadata.system}`);
        if (metadata.codex_sync_include) {
            details.push(`includes: ${metadata.codex_sync_include.join(', ')}`);
        }
        if (metadata.codex_sync_exclude) {
            details.push(`excludes: ${metadata.codex_sync_exclude.join(', ')}`);
        }
        if (details.length > 0) {
            output += '\n  ' + chalk_1.default.dim(details.join('\n  '));
        }
    }
    return output;
}
/**
 * Format validation warning
 */
function formatValidationWarning(filePath, warning) {
    return `${chalk_1.default.yellow('⚠')} ${chalk_1.default.gray(filePath)}\n  ${chalk_1.default.yellow('-')} ${warning}`;
}
/**
 * Format summary
 */
function formatSummary(valid, errors, warnings) {
    const parts = [];
    if (valid > 0)
        parts.push(chalk_1.default.green(`${valid} valid`));
    if (errors > 0)
        parts.push(chalk_1.default.red(`${errors} error${errors !== 1 ? 's' : ''}`));
    if (warnings > 0)
        parts.push(chalk_1.default.yellow(`${warnings} warning${warnings !== 1 ? 's' : ''}`));
    return `\nSummary: ${parts.join(', ')}`;
}
/**
 * Format routing decision
 */
function formatRoutingDecision(repo, willSync, reason) {
    const symbol = willSync ? chalk_1.default.green('✓') : chalk_1.default.red('✗');
    return `${symbol} ${chalk_1.default.bold(repo)}\n  ${chalk_1.default.dim('Reason:')} ${reason}`;
}
/**
 * Format JSON output
 */
function formatJSON(data) {
    return JSON.stringify(data, null, 2);
}
/**
 * Format content preview
 */
function formatContentPreview(content, maxLines = 5) {
    const lines = content.split('\n');
    const preview = lines.slice(0, maxLines);
    let output = preview.join('\n');
    if (lines.length > maxLines) {
        output += `\n${chalk_1.default.dim(`... (${lines.length - maxLines} more lines)`)}`;
    }
    return output;
}
//# sourceMappingURL=output-formatter.js.map