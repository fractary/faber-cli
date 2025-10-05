# Contributing to Faber-CLI

Thank you for your interest in contributing to Faber-CLI! This guide will help you get started with contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Types of Contributions](#types-of-contributions)
- [Development Process](#development-process)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Sharing Concepts](#sharing-concepts)
- [Community](#community)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git
- TypeScript knowledge
- Understanding of AI agent concepts

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   # Fork on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/faber-cli
   cd faber-cli
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Link for Local Testing**
   ```bash
   npm link
   # Now you can use 'faber' command locally
   ```

## Types of Contributions

### 1. Core Framework

#### New Bindings
Create bindings for additional AI frameworks:
```typescript
// src/bindings/your-framework/transformer.ts
export class YourFrameworkTransformer implements BindingTransformer {
  async transform(concept: Concept, config: Config): Promise<DeploymentArtifact> {
    // Your transformation logic
  }
}
```

#### New Concept Types
Extend the concept system:
```typescript
// src/core/concepts/your-concept.ts
export class YourConceptLoader extends BaseConceptLoader<YourConcept> {
  // Implementation
}
```

#### CLI Commands
Add new CLI functionality:
```typescript
// src/cli/commands/your-command.ts
export function createYourCommand(): Command {
  return new Command('your-command')
    .description('Your command description')
    .action(async (options) => {
      // Command logic
    });
}
```

### 2. Community Concepts

#### Share Roles
Contribute reusable role definitions:
```yaml
# roles/your-role/agent.yml
name: your-role
description: What your role does
platforms: [supported-platforms]
```

#### Share Teams
Share team compositions:
```yaml
# teams/your-team/team.yml
name: your-team
members:
  - role: member1
  - role: member2
coordination: collaborative
```

#### Share Workflows
Contribute workflow definitions:
```yaml
# workflows/your-workflow/workflow.yml
name: your-workflow
stages: [stage1, stage2]
teams: [team1, team2]
```

### 3. Context Library

#### Specialist Contexts
Add domain expertise:
```markdown
# contexts/specialists/specialist-your-domain.md
---
category: specialist
name: your-domain
---
# Your Domain Specialist
Domain-specific knowledge and patterns...
```

#### Platform Contexts
Support new platforms:
```markdown
# contexts/platforms/platform-your-platform.md
---
category: platform
platform: your-platform
mcp_server: mcp-server-your-platform
---
# Your Platform Context
Platform integration details...
```

### 4. MCP Servers

Create MCP server integrations:
```typescript
// tools/mcp-server-your-platform/src/index.ts
export class YourPlatformServer implements MCPServer {
  // MCP server implementation
}
```

### 5. Documentation

- Fix typos and clarify existing docs
- Add examples and use cases
- Translate documentation
- Create video tutorials
- Write blog posts

## Development Process

### Branch Strategy

```
main
  ├── feature/your-feature
  ├── fix/bug-description
  ├── docs/documentation-update
  └── concept/new-concept
```

### Workflow

1. **Create Issue**
   - Describe the problem or feature
   - Discuss approach with maintainers

2. **Create Branch**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

4. **Test Locally**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

6. **Push and PR**
   ```bash
   git push origin feature/your-feature
   # Create Pull Request on GitHub
   ```

## Code Standards

### TypeScript

```typescript
// Use explicit types
interface RoleConfig {
  name: string;
  platforms: string[];
}

// Use async/await over promises
async function loadRole(path: string): Promise<Role> {
  // Implementation
}

// Handle errors properly
try {
  await operation();
} catch (error) {
  logger.error('Operation failed:', error);
  throw new OperationError('Details', { cause: error });
}
```

### File Structure

```
src/
├── core/           # Core functionality
├── bindings/       # Framework bindings
├── cli/            # CLI commands
├── utils/          # Utilities
└── types/          # Type definitions
```

### Naming Conventions

- **Files**: kebab-case (`context-loader.ts`)
- **Classes**: PascalCase (`ContextLoader`)
- **Functions**: camelCase (`loadContext`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces**: PascalCase with I prefix optional (`IContext` or `Context`)

### Documentation

```typescript
/**
 * Loads a context file and parses its content.
 *
 * @param filePath - Path to the context file
 * @param category - Context category
 * @returns Parsed context object
 * @throws {ContextLoadError} If file cannot be loaded
 *
 * @example
 * ```typescript
 * const context = await loader.loadContext('path.md', 'specialist');
 * ```
 */
```

## Testing

### Unit Tests

```typescript
// src/core/contexts/__tests__/loader.test.ts
describe('ContextLoader', () => {
  it('should load markdown context', async () => {
    const loader = new ContextLoader();
    const context = await loader.loadContext('test.md', 'specialist');
    expect(context.content).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// tests/integration/build.test.ts
describe('Build Command', () => {
  it('should build Claude Code deployment', async () => {
    const result = await runCLI(['build', 'claude', 'role', 'test-role']);
    expect(result.exitCode).toBe(0);
    expect(fs.existsSync('deployments/claude')).toBe(true);
  });
});
```

### Test Coverage

Aim for:
- Unit tests: 80%+ coverage
- Integration tests: Key workflows
- E2E tests: Critical user paths

## Submitting Changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] New concept/context

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Changelog updated
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new binding for LangChain
fix: resolve context loading issue
docs: update overlay documentation
chore: update dependencies
refactor: simplify overlay resolver
test: add tests for role loader
```

### Code Review Process

1. **Automated Checks**
   - Linting passes
   - Tests pass
   - Build succeeds

2. **Peer Review**
   - Code quality
   - Architecture consistency
   - Documentation completeness

3. **Maintainer Review**
   - Final approval
   - Merge to main

## Sharing Concepts

### Publishing to Registry

```bash
# Package your concept
faber package role your-role

# Publish to registry (future feature)
faber publish role your-role
```

### Concept Quality Guidelines

#### Roles
- Clear, focused purpose
- Platform-agnostic tasks
- Well-organized contexts
- Comprehensive documentation
- Example usage

#### Teams
- Logical member composition
- Clear coordination model
- Documented workflows
- Tested interactions

#### Workflows
- Complete stage definitions
- Clear handoffs
- Error handling
- Success criteria

### Licensing

By contributing concepts, you agree to license them under MIT license.

## Community

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat (coming soon)
- **Twitter** - Updates and announcements

### Code of Conduct

We follow the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

### Getting Help

#### For Contributors
- Read existing documentation
- Search closed issues
- Ask in discussions
- Join Discord community

#### For Maintainers
- Regular office hours
- Mentorship program
- Clear roadmap
- Quick response times

## Recognition

### Contributors
All contributors are recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project website

### Concept Authors
Concept contributions include attribution:
```yaml
# In agent.yml
author: your-github-username
contributors:
  - contributor1
  - contributor2
```

## Development Tips

### Local Testing

```bash
# Test CLI commands
npm run dev -- create role test-role

# Test with different configs
FABER_CONFIG=test-config.yml npm run dev -- build claude role test-role

# Debug mode
DEBUG=faber:* npm run dev -- validate role test-role
```

### Debugging

```typescript
// Use debug module
import createDebug from 'debug';
const debug = createDebug('faber:context-loader');

debug('Loading context from %s', filePath);
```

### Performance

- Lazy load contexts
- Cache compiled templates
- Minimize file I/O
- Use streams for large files

## Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

### Release Checklist
1. Update version in package.json
2. Update CHANGELOG.md
3. Run full test suite
4. Build and verify
5. Tag release
6. Publish to npm
7. Update documentation
8. Announce release

## Future Contributions

### Roadmap Items
- Additional bindings (LangGraph, CrewAI, AutoGen)
- Concept registry and marketplace
- Web UI for concept creation
- Cloud deployment options
- Performance optimizations
- Advanced testing framework

### Research Areas
- Multi-modal agent support
- Inter-agent communication protocols
- Distributed team coordination
- Automatic concept generation
- Performance benchmarking

## Thank You!

Your contributions make Faber-CLI better for everyone. Whether you're fixing a typo, adding a feature, or sharing a concept, every contribution matters.

Happy contributing! 🚀