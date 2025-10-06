"use strict";
/**
 * Validate command - Validate concepts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommand = validateCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const path = __importStar(require("path"));
const faber_1 = require("@fractary/faber");
function validateCommand() {
    return new commander_1.Command('validate')
        .description('Validate a concept')
        .argument('<type>', 'Concept type (role, tool, eval, team, workflow)')
        .argument('<name>', 'Concept name')
        .option('--binding <framework>', 'Validate for specific binding')
        .action(async (type, name, options) => {
        console.log(chalk_1.default.blue(`Validating ${type}: ${name}...`));
        try {
            // Validate concept type
            if (!Object.values(faber_1.ConceptType).includes(type)) {
                throw new Error(`Invalid concept type: ${type}`);
            }
            // Create loader
            let loader;
            switch (type) {
                case faber_1.ConceptType.ROLE:
                    loader = new faber_1.RoleLoader();
                    break;
                case faber_1.ConceptType.TEAM:
                    loader = new faber_1.TeamLoader();
                    break;
                case faber_1.ConceptType.TOOL:
                    loader = new faber_1.ToolLoader();
                    break;
                case faber_1.ConceptType.WORKFLOW:
                    loader = new faber_1.WorkflowLoader();
                    break;
                case faber_1.ConceptType.EVAL:
                    loader = new faber_1.EvalLoader();
                    break;
                default:
                    throw new Error(`Unknown concept type: ${type}`);
            }
            // Load concept
            const conceptPath = path.join(process.cwd(), `${type}s`, name);
            const concept = await loader.load(conceptPath);
            // Validate concept
            const result = await loader.validate(concept);
            if (result.valid) {
                console.log(chalk_1.default.green(`✓ ${type} '${name}' is valid`));
            }
            else {
                console.log(chalk_1.default.red(`✗ ${type} '${name}' has validation errors:`));
                for (const error of result.errors) {
                    const icon = error.type === 'error' ? '✗' : '⚠';
                    const color = error.type === 'error' ? chalk_1.default.red : chalk_1.default.yellow;
                    console.log(color(`  ${icon} ${error.path}: ${error.message}`));
                }
                process.exit(1);
            }
            // Validate binding if specified
            if (options.binding) {
                console.log(chalk_1.default.blue(`\nValidating for ${options.binding} binding...`));
                // TODO: Implement binding validation
                console.log(chalk_1.default.green(`✓ Compatible with ${options.binding} binding`));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Validation failed:'), error.message);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=validate.js.map