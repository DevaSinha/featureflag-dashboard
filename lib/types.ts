// ─── Auth & Organization DTOs ────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface AuthTokens {
  user: User;
  access_token: string;
  refresh_token: string;
}

// ─── Feature Flag DTOs ──────────────────────────────────────────────────────

export type FlagType = 'BOOLEAN' | 'MULTIVARIATE';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  type: FlagType;
  enabled: boolean;
  default_value: boolean | string | number | Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface CreateFlagPayload {
  key: string;
  name: string;
  description?: string;
  type: FlagType;
  default_value: boolean | string | number | Record<string, unknown>;
  enabled: boolean;
}

export interface UpdateFlagPayload {
  name?: string;
  description?: string;
  default_value?: boolean | string | number | Record<string, unknown>;
  enabled?: boolean;
}

// ─── Rules ──────────────────────────────────────────────────────────────────

export interface RuleCondition {
  attribute: string;
  operator: string;
  value: string;
}

export interface FlagRule {
  id: string;
  flag_id: string;
  environment_id: string;
  conditions: RuleCondition[];
  rollout_percentage: number;
  enabled: boolean;
  priority?: number;
}

export interface CreateRulePayload {
  environment_id: string;
  conditions: RuleCondition[];
  rollout_percentage: number;
  enabled: boolean;
  priority?: number;
}

// ─── Experiments ────────────────────────────────────────────────────────────

export interface Experiment {
  id: string;
  flag_id: string;
  name: string;
  description?: string;
  status: string;
  tracked_events: string[];
  created_at: string;
}

export interface CreateExperimentPayload {
  flag_id: string;
  name: string;
  description?: string;
  tracked_events: string[];
}

export interface ExperimentMetrics {
  experiment_id: string;
  [key: string]: unknown;
}

// ─── Environments & API Keys ────────────────────────────────────────────────

export interface Environment {
  id: string;
  name: string;
  key: string;
  project_id: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key?: string; // Only returned on creation
  environment_id: string;
  created_at: string;
}

// ─── Audit Logs ─────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string;
  actor_name?: string;
  changes?: Record<string, unknown>;
  created_at: string;
}

// ─── Members ────────────────────────────────────────────────────────────────

export interface OrgMember {
  id: string;
  user_id: string;
  org_id: string;
  role: string;
  created_at: string;
  user?: User;
}

// ─── AI Assistant (RAG) DTOs ────────────────────────────────────────────────

export interface SourceFlag {
  flag_id: string;
  key: string;
  name: string;
  similarity: number;
}

export interface UsageMetadata {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface AssistantQueryResponse {
  answer: string;
  sources: SourceFlag[];
  usage: UsageMetadata | null;
}

/** Machine-readable error codes from the Go RAG handler */
export type AssistantErrorCode =
  | 'RAG_RATE_LIMITED'
  | 'RAG_TOKEN_LIMIT_EXCEEDED'
  | 'RAG_EMBEDDING_FAILED'
  | 'RAG_LLM_FAILED'
  | 'RAG_NO_RESULTS'
  | 'RAG_CONTEXT_TOO_LARGE'
  | 'RAG_NOT_AUTHORIZED';

/** Maps Go error codes to user-friendly messages */
export const ASSISTANT_ERROR_MESSAGES: Record<AssistantErrorCode, string> = {
  RAG_RATE_LIMITED: "You've reached the query limit for today. Please try again tomorrow.",
  RAG_TOKEN_LIMIT_EXCEEDED: 'Daily token budget exhausted. Try again tomorrow.',
  RAG_EMBEDDING_FAILED: 'AI service is temporarily unavailable. Please retry in a moment.',
  RAG_LLM_FAILED: 'AI service is temporarily unavailable. Please retry in a moment.',
  RAG_NO_RESULTS: 'No relevant flags found for your query. Try rephrasing.',
  RAG_CONTEXT_TOO_LARGE: 'Your query is too complex. Try breaking it into smaller questions.',
  RAG_NOT_AUTHORIZED: "You don't have access to this project's assistant.",
};

// ─── Chat UI Types ──────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  sources?: SourceFlag[];
  isStreaming?: boolean;
  error?: string;
  timestamp: number;
}

// ─── Generic API Wrapper ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  authError?: boolean;
}
