import type { LLMParams } from "@/components/SettingsPanel";

export type { LLMParams };

export interface UsageInfo {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface RequestMeta {
  usage?: UsageInfo;
  durationMs?: number;
  cost?: number;
  generationId?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "context-reset";
  content: string;
  params?: LLMParams;
  systemPrompt?: string;
  assistantPrompt?: string;
  meta?: RequestMeta;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoredSession extends ChatSession {
  messages: ChatMessage[];
  systemPrompt: string;
  assistantPrompt: string;
  params: LLMParams;
}
