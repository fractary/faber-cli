"use strict";
/**
 * Codex tool - Centralized knowledge management and distribution
 *
 * Exports the codex command for the unified Fractary CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCodexCommand = createCodexCommand;
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const validate_1 = require("./commands/validate");
const parse_1 = require("./commands/parse");
const config_1 = require("./commands/config");
const route_1 = require("./commands/route");
const list_1 = require("./commands/list");
const check_1 = require("./commands/check");
/**
 * Create and configure the codex command
 */
function createCodexCommand() {
    const codex = new commander_1.Command('codex');
    codex
        .description('Centralized knowledge management and distribution')
        .version('0.1.0');
    // Register commands
    codex.addCommand((0, init_1.initCommand)());
    codex.addCommand((0, validate_1.validateCommand)());
    codex.addCommand((0, parse_1.parseCommand)());
    codex.addCommand((0, config_1.configCommand)());
    codex.addCommand((0, route_1.routeCommand)());
    codex.addCommand((0, list_1.listCommand)());
    codex.addCommand((0, check_1.checkCommand)());
    return codex;
}
//# sourceMappingURL=index.js.map