"use strict";
/**
 * Faber tool - Universal AI agent orchestration
 *
 * Exports the faber command for the unified Fractary CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFaberCommand = createFaberCommand;
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const validate_1 = require("./commands/validate");
const build_1 = require("./commands/build");
const list_1 = require("./commands/list");
const create_1 = require("./commands/create");
/**
 * Create and configure the faber command
 */
function createFaberCommand() {
    const faber = new commander_1.Command('faber');
    faber
        .description('Universal AI agent orchestration (write-once, deploy-everywhere)')
        .version('0.1.0');
    // Register commands
    faber.addCommand((0, init_1.initCommand)());
    faber.addCommand((0, create_1.createCommand)());
    faber.addCommand((0, list_1.listCommand)());
    faber.addCommand((0, validate_1.validateCommand)());
    faber.addCommand((0, build_1.buildCommand)());
    return faber;
}
//# sourceMappingURL=index.js.map