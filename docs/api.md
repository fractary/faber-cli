# API Reference

Programmatic API for Faber-CLI, enabling integration into your applications and tools.

## Installation

```typescript
npm install @fractary/faber
```

## Basic Usage

```typescript
import { FaberAPI, ConceptType } from '@fractary/faber';

const faber = new FaberAPI({
  projectPath: './my-project',
  configPath: './.faber/config.yml'
});

// Load and build a concept
const role = await faber.loadConcept(ConceptType.ROLE, 'issue-manager');
const artifact = await faber.build('claude', role);
```

## Core Classes

### FaberAPI

Main API entry point for all operations.

```typescript
class FaberAPI {
  constructor(options?: FaberOptions);

  // Project management
  async init(template?: string): Promise<void>;
  async getConfig(): Promise<Config>;
  async setConfig(key: string, value: any): Promise<void>;

  // Concept operations
  async createConcept(type: ConceptType, name: string, options?: CreateOptions): Promise<void>;
  async loadConcept<T extends Concept>(type: ConceptType, name: string): Promise<T>;
  async listConcepts(type?: ConceptType): Promise<ConceptInfo[]>;
  async validateConcept(type: ConceptType, name: string): Promise<ValidationResult>;

  // Build operations
  async build(framework: string, concept: Concept, options?: BuildOptions): Promise<DeploymentArtifact>;
  async deploy(artifact: DeploymentArtifact, target: string): Promise<void>;

  // Overlay operations
  async resolveOverlays(type: string, name: string, platform?: string): Promise<Overlays>;
  async applyOverlays(concept: Concept, overlays: Overlays): Promise<Concept>;
}
```

### ConceptLoader

Base class for loading concepts.

```typescript
abstract class BaseConceptLoader<T extends Concept> {
  abstract load(conceptPath: string): Promise<T>;
  abstract validate(concept: T): Promise<ValidationResult>;
  abstract getSchema(): ZodSchema;
}

class RoleLoader extends BaseConceptLoader<Role> {
  async load(conceptPath: string): Promise<Role>;
  async validate(role: Role): Promise<ValidationResult>;
}

class TeamLoader extends BaseConceptLoader<Team> {
  async load(conceptPath: string): Promise<Team>;
  async validate(team: Team): Promise<ValidationResult>;
}

class WorkflowLoader extends BaseConceptLoader<Workflow> {
  async load(conceptPath: string): Promise<Workflow>;
  async validate(workflow: Workflow): Promise<ValidationResult>;
}
```

### ContextLoader

Manages context loading and resolution.

```typescript
class ContextLoader {
  constructor(basePath?: string);

  async loadContext(filePath: string, category: ContextCategory): Promise<Context>;
  async loadContexts(pattern: string): Promise<Context[]>;
  async resolveContextReferences(contexts: Context[]): Promise<Context[]>;

  // Category-specific loaders
  async loadSpecialist(name: string): Promise<SpecialistContext>;
  async loadPlatform(name: string): Promise<PlatformContext>;
  async loadStandard(name: string): Promise<StandardContext>;
  async loadPattern(name: string): Promise<PatternContext>;
  async loadPlaybook(name: string): Promise<PlaybookContext>;
  async loadReference(name: string): Promise<ReferenceContext>;
  async loadTroubleshooting(name: string): Promise<TroubleshootingContext>;
}
```

### OverlayResolver

Handles overlay resolution and merging.

```typescript
class OverlayResolver {
  constructor(projectPath: string);

  async resolveOverlays(conceptType: string, conceptName: string, platform?: string): Promise<Overlays>;
  async loadOverlay(overlayPath: string): Promise<Overlay>;
  async mergeOverlays(base: Overlays, ...overlays: Overlay[]): Promise<Overlays>;

  // Merge strategies
  deepMerge(target: any, source: any): any;
  arrayAppend<T>(target: T[], source: T[]): T[];
  override(target: any, source: any): any;
}
```

### BindingTransformer

Interface for framework bindings.

```typescript
interface BindingTransformer {
  transform(concept: Concept, config: Config, overlays?: Overlays): Promise<DeploymentArtifact>;
  validate(concept: Concept): Promise<ValidationResult>;
  getRequirements(): BindingRequirements;
}

class ClaudeCodeTransformer implements BindingTransformer {
  async transform(concept: Concept, config: Config, overlays?: Overlays): Promise<DeploymentArtifact>;
  async validate(concept: Concept): Promise<ValidationResult>;
  getRequirements(): BindingRequirements;
}
```

## Types and Interfaces

### Core Types

```typescript
enum ConceptType {
  ROLE = 'role',
  TOOL = 'tool',
  EVAL = 'eval',
  TEAM = 'team',
  WORKFLOW = 'workflow'
}

enum ContextCategory {
  SPECIALIST = 'specialist',
  PLATFORM = 'platform',
  STANDARD = 'standard',
  PATTERN = 'pattern',
  PLAYBOOK = 'playbook',
  REFERENCE = 'reference',
  TROUBLESHOOTING = 'troubleshooting'
}

interface Config {
  platforms?: Record<string, string>;
  mcp_servers?: Record<string, MCPServerConfig>;
  overlays?: OverlayConfig;
  bindings?: Record<string, BindingConfig>;
}

interface FaberOptions {
  projectPath?: string;
  configPath?: string;
  verbose?: boolean;
  quiet?: boolean;
}
```

### Concept Types

```typescript
interface Concept {
  name: string;
  type: ConceptType;
  description?: string;
  metadata: Record<string, any>;
}

interface Role extends Concept {
  type: ConceptType.ROLE;
  prompt: string;
  tasks?: Task[];
  flows?: Flow[];
  contexts?: Context[];
  platforms?: string[];
  mcp_servers?: string[];
}

interface Team extends Concept {
  type: ConceptType.TEAM;
  members: TeamMember[];
  coordination?: CoordinationType;
  workflows?: Workflow[];
  leader?: string;
}

interface Workflow extends Concept {
  type: ConceptType.WORKFLOW;
  stages: Stage[];
  teams: string[];
  triggers?: Trigger[];
  conditions?: Condition[];
}

interface Tool extends Concept {
  type: ConceptType.TOOL;
  tool_type: ToolType;
  mcp_server?: boolean;
  protocols?: string[];
}

interface Eval extends Concept {
  type: ConceptType.EVAL;
  targets: string[];
  scenarios: Scenario[];
  metrics?: Metric[];
  success_threshold?: number;
}
```

### Context Types

```typescript
interface Context {
  category: ContextCategory;
  name: string;
  content: string;
  frontmatter?: ContextFrontmatter;
  filePath?: string;
}

interface ContextFrontmatter {
  category?: ContextCategory;
  name?: string;
  description?: string;
  platform?: string;
  mcp_server?: string;
  required_tools?: string[];
  fallback?: string;
  related?: string[];
  tags?: string[];
}

interface PlatformContext extends Context {
  category: ContextCategory.PLATFORM;
  platform: string;
  mcp_server?: string;
  required_tools?: string[];
}

interface SpecialistContext extends Context {
  category: ContextCategory.SPECIALIST;
  domain: string;
  expertise: string[];
}
```

### Build Types

```typescript
interface BuildOptions {
  output?: string;
  noOverlays?: boolean;
  platform?: string;
  dryRun?: boolean;
  verbose?: boolean;
}

interface DeploymentArtifact {
  framework: string;
  concept: string;
  conceptType: ConceptType;
  files: FileArtifact[];
  metadata: DeploymentMetadata;
}

interface FileArtifact {
  path: string;
  content: string;
  encoding?: string;
  permissions?: string;
}

interface DeploymentMetadata {
  version: string;
  timestamp: string;
  config: Config;
  overlays?: Overlays;
  platform?: string;
}
```

### Validation Types

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  info?: ValidationInfo[];
}

interface ValidationError {
  path: string;
  message: string;
  code: string;
}

interface ValidationWarning {
  path: string;
  message: string;
  code: string;
  suggestion?: string;
}
```

## Usage Examples

### Project Initialization

```typescript
import { FaberAPI } from '@fractary/faber';

async function initProject() {
  const faber = new FaberAPI();

  // Initialize with default template
  await faber.init();

  // Or use specific template
  await faber.init('enterprise');

  // Configure project
  await faber.setConfig('platforms.issue-manager', 'linear');
  await faber.setConfig('mcp_servers.github', {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: { GITHUB_TOKEN: '${GITHUB_TOKEN}' }
  });
}
```

### Creating Concepts

```typescript
async function createConcepts() {
  const faber = new FaberAPI();

  // Create a role
  await faber.createConcept(ConceptType.ROLE, 'security-scanner', {
    platforms: ['github', 'gitlab'],
    description: 'Scans repositories for security vulnerabilities'
  });

  // Create a team
  await faber.createConcept(ConceptType.TEAM, 'security-team', {
    members: ['security-scanner', 'vulnerability-researcher'],
    coordination: 'collaborative'
  });

  // Create a workflow
  await faber.createConcept(ConceptType.WORKFLOW, 'security-audit', {
    stages: ['scan', 'research', 'report'],
    teams: ['security-team']
  });
}
```

### Loading and Validating

```typescript
async function loadAndValidate() {
  const faber = new FaberAPI();

  // Load a role
  const role = await faber.loadConcept<Role>(ConceptType.ROLE, 'issue-manager');
  console.log(`Loaded role: ${role.name}`);
  console.log(`Platforms: ${role.platforms?.join(', ')}`);

  // Validate the role
  const validation = await faber.validateConcept(ConceptType.ROLE, 'issue-manager');
  if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
  }

  // List all concepts
  const concepts = await faber.listConcepts();
  concepts.forEach(c => {
    console.log(`${c.type}: ${c.name} - ${c.description}`);
  });
}
```

### Building Deployments

```typescript
async function buildDeployments() {
  const faber = new FaberAPI();

  // Load role
  const role = await faber.loadConcept<Role>(ConceptType.ROLE, 'issue-manager');

  // Build for Claude Code
  const artifact = await faber.build('claude', role, {
    output: './deployments',
    platform: 'linear'
  });

  console.log(`Built ${artifact.files.length} files`);
  artifact.files.forEach(f => {
    console.log(`  - ${f.path}`);
  });

  // Deploy to target directory
  await faber.deploy(artifact, '/path/to/project');
}
```

### Working with Contexts

```typescript
import { ContextLoader, ContextCategory } from '@fractary/faber';

async function workWithContexts() {
  const loader = new ContextLoader('./contexts');

  // Load specific context
  const security = await loader.loadSpecialist('security');
  console.log(security.content);

  // Load all contexts matching pattern
  const standards = await loader.loadContexts('standards/*.md');
  standards.forEach(s => {
    console.log(`Standard: ${s.name}`);
  });

  // Load platform context
  const github = await loader.loadPlatform('github');
  console.log(`MCP Server: ${github.mcp_server}`);
  console.log(`Required tools: ${github.required_tools?.join(', ')}`);
}
```

### Managing Overlays

```typescript
import { OverlayResolver } from '@fractary/faber';

async function manageOverlays() {
  const resolver = new OverlayResolver('./my-project');

  // Resolve overlays for a role
  const overlays = await resolver.resolveOverlays('role', 'issue-manager', 'linear');

  console.log('Organization overlays:', overlays.organization);
  console.log('Platform overlays:', overlays.platform);
  console.log('Role overlays:', overlays.role);

  // Apply overlays to concept
  const faber = new FaberAPI();
  const role = await faber.loadConcept<Role>(ConceptType.ROLE, 'issue-manager');
  const customized = await faber.applyOverlays(role, overlays);

  console.log('Customized role:', customized);
}
```

### Custom Bindings

```typescript
import { BindingTransformer, DeploymentArtifact } from '@fractary/faber';

class CustomBinding implements BindingTransformer {
  async transform(
    concept: Concept,
    config: Config,
    overlays?: Overlays
  ): Promise<DeploymentArtifact> {
    // Transform concept to your framework format
    const files: FileArtifact[] = [];

    // Generate main file
    files.push({
      path: `agents/${concept.name}.custom`,
      content: this.generateAgent(concept)
    });

    return {
      framework: 'custom',
      concept: concept.name,
      conceptType: concept.type,
      files,
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        config,
        overlays
      }
    };
  }

  async validate(concept: Concept): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validation logic
    if (!concept.name) {
      errors.push({
        path: 'name',
        message: 'Name is required',
        code: 'MISSING_NAME'
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  getRequirements(): BindingRequirements {
    return {
      minVersion: '1.0.0',
      requiredFeatures: [],
      supportedConcepts: [ConceptType.ROLE, ConceptType.TEAM]
    };
  }

  private generateAgent(concept: Concept): string {
    // Your generation logic
    return `// Agent: ${concept.name}\n// Generated by custom binding`;
  }
}

// Register binding
import { registerBinding } from '@fractary/faber';
registerBinding('custom', CustomBinding);
```

### Event Handling

```typescript
import { FaberAPI, FaberEvents } from '@fractary/faber';

async function handleEvents() {
  const faber = new FaberAPI();

  // Listen to events
  faber.on(FaberEvents.BUILD_START, (data) => {
    console.log(`Building ${data.concept} for ${data.framework}`);
  });

  faber.on(FaberEvents.BUILD_COMPLETE, (data) => {
    console.log(`Build complete: ${data.files.length} files generated`);
  });

  faber.on(FaberEvents.VALIDATION_ERROR, (error) => {
    console.error(`Validation error: ${error.message}`);
  });

  // Build with event handling
  const role = await faber.loadConcept<Role>(ConceptType.ROLE, 'test');
  await faber.build('claude', role);
}
```

### Testing Support

```typescript
import { FaberTestUtils } from '@fractary/faber/testing';

describe('My Agent Tests', () => {
  const utils = new FaberTestUtils();

  beforeEach(() => {
    utils.setupTestProject();
  });

  afterEach(() => {
    utils.cleanupTestProject();
  });

  it('should create valid role', async () => {
    const role = utils.createTestRole('test-role', {
      platforms: ['github'],
      tasks: [utils.createTestTask('test-task')]
    });

    const validation = await utils.validate(role);
    expect(validation.valid).toBe(true);
  });

  it('should build deployment', async () => {
    const role = utils.createTestRole('test-role');
    const artifact = await utils.build('claude', role);

    expect(artifact.files).toHaveLength(2);
    expect(artifact.framework).toBe('claude');
  });
});
```

## Plugin System

### Creating Plugins

```typescript
import { FaberPlugin } from '@fractary/faber';

export class MyPlugin implements FaberPlugin {
  name = 'my-plugin';
  version = '1.0.0';

  async initialize(api: FaberAPI): Promise<void> {
    // Register custom commands
    api.registerCommand('my-command', this.myCommand);

    // Register hooks
    api.hooks.beforeBuild(this.beforeBuild);
    api.hooks.afterBuild(this.afterBuild);

    // Register binding
    api.registerBinding('my-framework', MyBinding);
  }

  async myCommand(options: any): Promise<void> {
    console.log('Running my command');
  }

  async beforeBuild(data: any): Promise<void> {
    console.log('Before build hook');
  }

  async afterBuild(data: any): Promise<void> {
    console.log('After build hook');
  }
}
```

### Using Plugins

```typescript
import { FaberAPI } from '@fractary/faber';
import { MyPlugin } from './my-plugin';

async function usePlugin() {
  const faber = new FaberAPI();

  // Register plugin
  await faber.use(new MyPlugin());

  // Use plugin features
  await faber.runCommand('my-command', {});
}
```

## Advanced Features

### Caching

```typescript
import { FaberAPI, CacheOptions } from '@fractary/faber';

const faber = new FaberAPI({
  cache: {
    enabled: true,
    ttl: 3600,  // 1 hour
    path: './.faber-cache'
  } as CacheOptions
});

// Cache is used automatically
const role = await faber.loadConcept(ConceptType.ROLE, 'cached-role');
```

### Parallel Processing

```typescript
async function buildMultiple() {
  const faber = new FaberAPI();

  const roles = ['role1', 'role2', 'role3'];

  // Build in parallel
  const artifacts = await Promise.all(
    roles.map(name =>
      faber.loadConcept<Role>(ConceptType.ROLE, name)
        .then(role => faber.build('claude', role))
    )
  );

  console.log(`Built ${artifacts.length} deployments`);
}
```

### Streaming Operations

```typescript
import { FaberAPI } from '@fractary/faber';
import { Readable } from 'stream';

async function streamBuild() {
  const faber = new FaberAPI();

  // Stream build output
  const stream = await faber.buildStream('claude', role);

  stream.on('data', (chunk) => {
    console.log('Build progress:', chunk.toString());
  });

  stream.on('end', () => {
    console.log('Build complete');
  });
}
```

### Middleware

```typescript
const faber = new FaberAPI();

// Add middleware
faber.use(async (ctx, next) => {
  console.log(`Starting: ${ctx.action}`);
  const start = Date.now();

  await next();

  const duration = Date.now() - start;
  console.log(`Completed in ${duration}ms`);
});
```

## Error Handling

### Error Types

```typescript
import {
  FaberError,
  ConceptNotFoundError,
  ValidationError,
  BuildError,
  ConfigError
} from '@fractary/faber/errors';

try {
  await faber.loadConcept(ConceptType.ROLE, 'missing');
} catch (error) {
  if (error instanceof ConceptNotFoundError) {
    console.error('Concept not found:', error.concept);
  } else if (error instanceof ValidationError) {
    console.error('Validation failed:', error.errors);
  } else if (error instanceof FaberError) {
    console.error('Faber error:', error.message);
  }
}
```

### Error Recovery

```typescript
async function buildWithRecovery() {
  const faber = new FaberAPI();

  try {
    return await faber.build('claude', role);
  } catch (error) {
    if (error instanceof BuildError && error.recoverable) {
      // Try with different options
      return await faber.build('claude', role, {
        noOverlays: true
      });
    }
    throw error;
  }
}
```

## Performance

### Benchmarking

```typescript
import { FaberBenchmark } from '@fractary/faber/benchmark';

const benchmark = new FaberBenchmark();

// Benchmark concept loading
const loadResults = await benchmark.measureLoad(ConceptType.ROLE, 'test-role');
console.log(`Load time: ${loadResults.duration}ms`);

// Benchmark build
const buildResults = await benchmark.measureBuild('claude', role);
console.log(`Build time: ${buildResults.duration}ms`);
console.log(`Files generated: ${buildResults.fileCount}`);
```

### Optimization

```typescript
const faber = new FaberAPI({
  optimization: {
    lazyContextLoading: true,
    parallelBuilds: true,
    cacheTemplates: true,
    minifyOutput: false
  }
});
```

## Migration

### From CLI to API

```typescript
// CLI command:
// faber build claude role issue-manager --output ./deploy

// Equivalent API usage:
const faber = new FaberAPI();
const role = await faber.loadConcept<Role>(ConceptType.ROLE, 'issue-manager');
const artifact = await faber.build('claude', role, {
  output: './deploy'
});
```

### Version Migration

```typescript
import { migrate } from '@fractary/faber/migration';

// Migrate from v1 to v2
await migrate({
  from: '1.x',
  to: '2.x',
  projectPath: './my-project',
  backup: true
});
```

## Debugging

### Debug Mode

```typescript
import { FaberAPI } from '@fractary/faber';
import debug from 'debug';

// Enable debug output
debug.enable('faber:*');

const faber = new FaberAPI({
  verbose: true,
  debug: true
});
```

### Inspection

```typescript
// Inspect internal state
const state = faber.inspect();
console.log('Loaded concepts:', state.concepts);
console.log('Registered bindings:', state.bindings);
console.log('Active overlays:', state.overlays);
```

## Reference Links

- [GitHub Repository](https://github.com/fractary/faber-cli)
- [NPM Package](https://www.npmjs.com/package/@fractary/faber)
- [TypeDoc Documentation](https://fractary.github.io/faber-cli/)
- [Examples Repository](https://github.com/fractary/faber-examples)