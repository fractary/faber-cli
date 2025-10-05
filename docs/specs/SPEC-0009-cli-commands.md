---
spec: SPEC-0009
title: CLI Commands
status: draft
created: 2025-01-19
updated: 2025-01-19
authors: [Fractary Team]
---

# CLI Commands

## Overview

Complete CLI command reference for faber-cli.

## Command Pattern

`faber <command> [concept-type] [name] [options]`

## Core Commands

### 1. init

Initialize faber project.

```bash
faber init [--template <name>]
```

### 2. create

Create new concepts.

```bash
faber create role <name> [--platforms <list>]
faber create tool <name> [--type mcp-server]
faber create eval <name> [--target <concept:name>]
faber create team <name> [--members <list>]
faber create workflow <name> [--teams <list>]
```

### 3. list

List concepts.

```bash
faber list [concept-type]
faber list roles
faber list tools --type mcp-server
faber list platforms
faber list bindings
```

### 4. validate

Validate concepts.

```bash
faber validate [concept-type] [name] [--binding <framework>]
```

### 5. build

Build deployments.

```bash
faber build <framework> [concept-type] [name] [--output <path>]
```

### 6. deploy

Deploy concepts.

```bash
faber deploy <concept-type> <name> <framework> [--target <path>]
```

### 7. status

Show status.

```bash
faber status [concept-type] [--framework <framework>]
```

### 8. config

Manage configuration.

```bash
faber config <key> [value]
faber config platforms.issue-manager linear
faber config get platforms.issue-manager
```

## Overlay Commands

### overlay init

```bash
faber overlay init
```

### overlay create

```bash
faber overlay create organization
faber overlay create role <name>
faber overlay create platform <name>
faber overlay create team <name>
```

### overlay list

```bash
faber overlay list [type] [name]
```

### overlay status

```bash
faber overlay status [concept-type] [name]
```

### overlay diff

```bash
faber overlay diff <concept-type> <name>
```

## References

- [SPEC-0001: Faber-CLI Overview](./SPEC-0001-faber-cli-overview.md)
- [SPEC-0002: Concept System](./SPEC-0002-concept-system.md)
