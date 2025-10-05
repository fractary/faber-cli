/**
 * Core types for Faber-CLI
 */

// Five first-class concept types
export enum ConceptType {
  ROLE = 'role',
  TOOL = 'tool',
  EVAL = 'eval',
  TEAM = 'team',
  WORKFLOW = 'workflow'
}

// Seven context categories
export enum ContextCategory {
  SPECIALIST = 'specialists',
  PLATFORM = 'platforms',
  STANDARD = 'standards',
  PATTERN = 'patterns',
  PLAYBOOK = 'playbooks',
  REFERENCE = 'references',
  TROUBLESHOOTING = 'troubleshooting'
}

// Common metadata fields for all concepts
export interface ConceptMetadata {
  org: string;
  system: string;
  name: string;
  type: ConceptType;
  description: string;
  created: string;
  updated: string;
  visibility: 'public' | 'internal' | 'private';
  tags: string[];
}

// Role-specific metadata
export interface RoleMetadata extends ConceptMetadata {
  type: ConceptType.ROLE;
  platforms: string[];
  default_platform?: string;
  platform_config_key?: string;
  color?: string;
  agent_type?: 'autonomous' | 'interactive' | 'batch';
}

// Tool-specific metadata
export interface ToolMetadata extends ConceptMetadata {
  type: ConceptType.TOOL;
  tool_type: 'mcp-server' | 'utility' | 'api-client';
  mcp_server: boolean;
  platforms?: string[];
  default_platform?: string;
  protocols?: string[];
}

// Eval-specific metadata
export interface EvalMetadata extends ConceptMetadata {
  type: ConceptType.EVAL;
  targets: string[];
  platforms: string[];
  metrics: string[];
  success_threshold: number;
}

// Team-specific metadata
export interface TeamMetadata extends ConceptMetadata {
  type: ConceptType.TEAM;
  members: Array<{
    role: string;
    name: string;
    config?: Record<string, unknown>;
  }>;
  coordination: 'hierarchical' | 'collaborative' | 'sequential';
  leader?: string;
  platform_config_key?: string;
}

// Workflow-specific metadata
export interface WorkflowMetadata extends ConceptMetadata {
  type: ConceptType.WORKFLOW;
  stages: string[];
  teams: string[];
  triggers: string[];
  schedule?: string;
  conditions?: Record<string, unknown>;
}

// Union type for all metadata types
export type AnyConceptMetadata = RoleMetadata | ToolMetadata | EvalMetadata | TeamMetadata | WorkflowMetadata;

// Context structure
export interface Context {
  category: ContextCategory;
  name: string;
  content: string;
  metadata?: ContextMetadata;
  path?: string;
}

// Context metadata (optional frontmatter)
export interface ContextMetadata {
  category?: ContextCategory;
  name?: string;
  description?: string;
  platform?: string;
  mcp_server?: string;
  required_tools?: string[];
  fallback?: 'api' | 'cli' | 'manual';
  related?: string[];
  tags?: string[];
}

// Task structure
export interface Task {
  name: string;
  content: string;
  path?: string;
}

// Flow structure
export interface Flow {
  name: string;
  content: string;
  path?: string;
}

// Base concept interface
export interface Concept {
  metadata: AnyConceptMetadata;
  path: string;
}

// Role concept
export interface Role extends Concept {
  metadata: RoleMetadata;
  prompt: string;
  tasks: Map<string, Task>;
  flows: Map<string, Flow>;
  contexts: Map<string, Context>;
  bindings?: Map<string, BindingConfig>;
}

// Tool concept
export interface Tool extends Concept {
  metadata: ToolMetadata;
  readme?: string;
  implementation?: Record<string, unknown>;
}

// Eval concept
export interface Eval extends Concept {
  metadata: EvalMetadata;
  scenarios: Map<string, unknown>;
  expectations: Map<string, unknown>;
}

// Team concept
export interface Team extends Concept {
  metadata: TeamMetadata;
  workflows: Map<string, unknown>;
  coordination: Record<string, unknown>;
}

// Workflow concept
export interface Workflow extends Concept {
  metadata: WorkflowMetadata;
  stages: Map<string, unknown>;
  teamAssignments: Map<string, unknown>;
}

// Concept reference format
export interface ConceptReference {
  type: ConceptType;
  name: string;
  toString(): string;
}

// Binding configuration
export interface BindingConfig {
  name: string;
  version: string;
  extends?: string;
  concept_types?: ConceptType[];
  output_structure?: {
    role_path?: string;
    tool_path?: string;
    eval_path?: string;
    team_path?: string;
    workflow_path?: string;
    docs_path?: string;
    config_path?: string;
  };
  templates?: Record<string, string>;
  path_resolution?: {
    context_prefix?: string;
    task_prefix?: string;
    flow_prefix?: string;
  };
  transforms?: {
    pre_process?: string[];
    post_process?: string[];
  };
  framework_specific?: Record<string, unknown>;
  template_vars?: Record<string, unknown>;
}

// Deployment artifact
export interface DeploymentArtifact {
  files: Map<string, string>;
  directories: string[];
  metadata: DeploymentMetadata;
}

// Deployment metadata
export interface DeploymentMetadata {
  concept: ConceptReference;
  binding: string;
  timestamp: Date;
  config?: Record<string, unknown>;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

// Validation error
export interface ValidationError {
  path: string;
  message: string;
  type: 'error' | 'warning';
}

// Configuration
export interface Config {
  platforms?: Record<string, string>;
  mcp_servers?: Record<string, MCPServerConfig>;
  overlays?: {
    enabled: boolean;
    paths?: string[];
  };
  bindings?: Record<string, unknown>;
}

// MCP server configuration
export interface MCPServerConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  api_key?: string;
}