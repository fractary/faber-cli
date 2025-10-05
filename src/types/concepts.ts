/**
 * Concept type definitions
 */

// Base concept types
export enum ConceptType {
  ROLE = 'role',
  TOOL = 'tool',
  EVAL = 'eval',
  TEAM = 'team',
  WORKFLOW = 'workflow'
}

// Base concept interface
export interface Concept {
  name: string;
  type: ConceptType;
  description?: string;
}

// Role concept
export interface Role extends Concept {
  type: ConceptType.ROLE;
  prompt: string;
  tasks?: Task[];
  flows?: Flow[];
  contexts?: Context[];
  platforms?: string[];
  mcp_servers?: string[];
}

// Team concept
export interface Team extends Concept {
  type: ConceptType.TEAM;
  members: TeamMember[];
  coordination?: CoordinationType;
  workflows?: Workflow[];
  leader?: string;
}

export interface TeamMember {
  role: string;
  name?: string;
  config?: Record<string, unknown>;
}

export enum CoordinationType {
  HIERARCHICAL = 'hierarchical',
  COLLABORATIVE = 'collaborative',
  SEQUENTIAL = 'sequential',
  AUTONOMOUS = 'autonomous'
}

// Workflow concept
export interface Workflow extends Concept {
  type: ConceptType.WORKFLOW;
  stages: Stage[];
  teams: string[];
  triggers?: Trigger[];
  conditions?: Record<string, unknown>;
}

export interface Stage {
  name: string;
  team: string;
  entry_criteria?: string[];
  tasks: string[];
  exit_criteria?: string[];
  on_failure?: string[];
}

export interface Trigger {
  type: 'manual' | 'scheduled' | 'event';
  config?: Record<string, unknown>;
}

// Tool concept
export interface Tool extends Concept {
  type: ConceptType.TOOL;
  tool_type: ToolType;
  mcp_server?: boolean;
  protocols?: string[];
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}

export enum ToolType {
  MCP_SERVER = 'mcp-server',
  UTILITY = 'utility',
  API_CLIENT = 'api-client'
}

// Eval concept
export interface Eval extends Concept {
  type: ConceptType.EVAL;
  targets: string[];
  scenarios: Scenario[];
  metrics?: Metric[];
  success_threshold?: number;
  platforms?: string[];
}

export interface Scenario {
  name: string;
  description?: string;
  inputs: Record<string, unknown>;
  expected_outputs?: Record<string, unknown>;
  assertions?: string[];
}

export interface Metric {
  name: string;
  type: 'accuracy' | 'coverage' | 'performance' | 'quality';
  threshold?: number;
}

// Task and Flow
export interface Task {
  name: string;
  description?: string;
  content?: string;
}

export interface Flow {
  name: string;
  description?: string;
  content?: string;
}

// Context (imported from contexts)
export interface Context {
  category: string;
  name: string;
  content: string;
}

// Concept reference
export interface ConceptReference {
  type: ConceptType;
  name: string;
}

// Concept metadata (for base loader)
export interface ConceptMetadata {
  name: string;
  description?: string;
  org?: string;
  system?: string;
  [key: string]: any;
}