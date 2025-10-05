#!/usr/bin/env node
"use strict";
/**
 * Faber-CLI main entry point
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const init_1 = require("./commands/init");
const validate_1 = require("./commands/validate");
const build_1 = require("./commands/build");
const list_1 = require("./commands/list");
const create_1 = require("./commands/create");
// Package information
const packageJson = require('../../package.json');
// Configure program
commander_1.program
    .name('faber')
    .description('Universal AI agent orchestration platform')
    .version(packageJson.version);
// Register commands
commander_1.program.addCommand((0, init_1.initCommand)());
commander_1.program.addCommand((0, create_1.createCommand)());
commander_1.program.addCommand((0, list_1.listCommand)());
commander_1.program.addCommand((0, validate_1.validateCommand)());
commander_1.program.addCommand((0, build_1.buildCommand)());
// Error handling
commander_1.program.exitOverride();
async function main() {
    try {
        await commander_1.program.parseAsync(process.argv);
    }
    catch (error) {
        if (error.code === 'commander.help') {
            process.exit(0);
        }
        console.error(chalk_1.default.red('Error:'), error.message);
        process.exit(1);
    }
}
// Run CLI
main().catch(error => {
    console.error(chalk_1.default.red('Fatal error:'), error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map