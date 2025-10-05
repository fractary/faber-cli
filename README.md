# Faber-CLI

> Universal AI Agent Orchestration Platform - Write Once, Deploy Everywhere

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](package.json)
[![TypeScript](https://img.shields.io/badge/typescript-5.3.3-blue)](https://www.typescriptlang.org/)

## 🚀 Overview

Faber-CLI is a revolutionary AI agent orchestration platform that enables you to define AI agents, tools, teams, and workflows in a universal format that can be deployed across multiple AI frameworks and adapted to different platforms and organizational contexts.

### Key Innovation: Three-Dimensional Abstraction

1. **Framework Abstraction** - Deploy to any AI framework (Claude Code, LangGraph, CrewAI)
2. **Platform Abstraction** - Work with any platform (GitHub, GitLab, Linear, Jira, AWS, GCP)
3. **Organization Abstraction** - Customize for your company without forking

## ✨ Features

- **🎯 Universal Agent Definitions** - Define once, deploy anywhere
- **🔌 Pluggable Bindings** - Transform to any AI framework
- **🌍 Platform Contexts** - Adapt to any platform via MCP
- **📝 Overlay System** - Customize without modifying source
- **🧩 Composable Architecture** - Mix and match contexts, roles, teams
- **📦 Minimal Deployments** - Intelligence lives in dynamically loaded contexts
- **🔧 TypeScript First** - Full type safety and modern tooling

## 📚 Documentation

- [Getting Started](docs/getting-started.md) - Quick start guide
- [Core Concepts](docs/concepts.md) - Understanding Faber's architecture
- [CLI Reference](docs/cli-reference.md) - Command documentation
- [Context System](docs/contexts.md) - Dynamic knowledge loading
- [Overlay System](docs/overlays.md) - Customization without forking
- [Binding System](docs/bindings.md) - Framework transformations
- [Examples](docs/examples.md) - Tutorials and use cases
- [API Reference](docs/api.md) - Developer documentation
- [Contributing](docs/contributing.md) - How to contribute

## 🎬 Quick Start

### Installation

```bash
npm install -g @fractary/faber-cli
```

### Initialize a Project

```bash
faber init
```

This creates:
```
.faber/
  config.yml              # Configuration
  overlays/               # Customizations
roles/                    # Agent definitions
tools/                    # MCP servers & utilities
teams/                    # Multi-agent compositions
workflows/                # Cross-team orchestrations
deployments/              # Generated artifacts
```

### Create Your First Role

```bash
faber create role issue-manager --platforms github-issues,linear
```

### Validate and Build

```bash
# Validate the role
faber validate role issue-manager

# Build for Claude Code
faber build claude role issue-manager

# List all concepts
faber list
```

## 🏗️ Architecture

### Five First-Class Concepts

1. **Roles** - AI agent definitions with contexts, tasks, and flows
2. **Tools** - MCP servers and utilities for platform integration
3. **Evals** - Testing and evaluation scenarios
4. **Teams** - Multi-agent compositions
5. **Workflows** - Cross-team orchestrations

### Seven Context Categories

- **Specialists** - Domain expertise loaded on-demand
- **Platforms** - Platform-specific adapters (MCP)
- **Standards** - Best practices and conventions
- **Patterns** - Design patterns and architectures
- **Playbooks** - Operational procedures
- **References** - API and framework documentation
- **Troubleshooting** - Issue resolution guides

## 🔄 How It Works

### 1. Define Once

Create platform-agnostic agent definitions:

```yaml
# roles/issue-manager/agent.yml
org: acme
system: devops
name: issue-manager
type: role
platforms: [github-issues, linear, jira]
```

### 2. Customize via Overlays

Add organization-specific customizations without forking:

```markdown
# .faber/overlays/organization/contexts/standards/company-policy.md
All issues must include customer impact assessment...
```

### 3. Deploy Everywhere

Build for any framework:

```bash
faber build claude role issue-manager     # → .claude/agents/
faber build langgraph role issue-manager  # → langgraph/graphs/
faber build crewai role issue-manager     # → crewai/agents/
```

## 🎯 Use Cases

### For Developers
- Rapid AI agent prototyping
- Framework experimentation
- Platform flexibility

### For Organizations
- Inject company standards without forking
- Consistent agents across teams
- Environment-specific configurations

### For Open Source
- Distribute reusable agent definitions
- Community contributions
- Multi-framework support

## 🛠️ Current Implementation Status

### ✅ Complete
- Core concept system (Roles)
- Context system (7 categories)
- Overlay system
- Configuration management
- Claude Code binding
- CLI commands (init, create, list, validate, build)

### 🚧 In Progress
- Additional concept loaders (Tools, Teams, Workflows)
- LangGraph and CrewAI bindings
- MCP server integration
- Deploy command

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/fractary/faber-cli.git
cd faber-cli

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Link for local development
npm link
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io) for platform integration standards
- [Claude Code](https://claude.ai/code) for AI agent inspiration
- The open source community for feedback and contributions

## 📮 Support

- **Issues**: [GitHub Issues](https://github.com/fractary/faber-cli/issues)
- **Discussions**: [GitHub Discussions](https://github.com/fractary/faber-cli/discussions)
- **Email**: support@fractary.com

---

**Faber-CLI** - *Empowering AI orchestration without boundaries*
