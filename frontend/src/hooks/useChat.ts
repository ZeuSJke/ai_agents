import { useState, useRef, useCallback } from "react";
import type { ChatMessage, UsageInfo, RequestMeta, LLMParams } from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface StreamResult {
  content: string;
  usage?: UsageInfo;
  generationId?: string;
}

async function readStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (text: string) => void,
): Promise<StreamResult> {
  const decoder = new TextDecoder();
  let accumulated = "";
  let usage: UsageInfo | undefined;
  let generationId: string | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });

    for (const line of text.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") break;

      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }

      if (parsed.error) throw new Error(parsed.error);
      if (parsed.content) {
        accumulated += parsed.content;
        onChunk(accumulated);
      }
      if (parsed.usage) usage = parsed.usage;
      if (parsed.generation_id) generationId = parsed.generation_id;
    }
  }

  return { content: accumulated, usage, generationId };
}

async function fetchCost(generationId: string): Promise<number | undefined> {
  try {
    const res = await fetch(`${API_URL}/api/generation/${generationId}`);
    if (!res.ok) return undefined;
    const data = await res.json();
    const cost = data?.data?.total_cost ?? data?.data?.usage;
    return cost !== undefined ? Number(cost) : undefined;
  } catch {
    return undefined;
  }
}

function getContextMessages(msgs: ChatMessage[]): ChatMessage[] {
  const lastResetIdx = msgs.findLastIndex((m) => m.role === "context-reset");
  const slice = lastResetIdx >= 0 ? msgs.slice(lastResetIdx + 1) : msgs;
  return slice.filter((m) => m.role === "user" || m.role === "assistant");
}

function buildRequestBody(
  contextMessages: ChatMessage[],
  systemPrompt: string,
  assistantPrompt: string,
  params: LLMParams,
) {
  return {
    messages: contextMessages.map((m) => ({ role: m.role, content: m.content })),
    system_prompt: systemPrompt,
    assistant_prompt: assistantPrompt,
    stream: true,
    ...Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== null && v !== ""),
    ),
  };
}

interface UseChatOptions {
  systemPrompt: string;
  assistantPrompt: string;
  params: LLMParams;
  onComplete: (messages: ChatMessage[]) => void;
}

export function useChat({ systemPrompt, assistantPrompt, params, onComplete }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      const newMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: userMessage },
      ];
      setMessages(newMessages);
      setIsLoading(true);
      setStreamingContent("");

      abortRef.current = new AbortController();
      const startTime = performance.now();
      const snapshot = { params: { ...params }, systemPrompt, assistantPrompt };

      try {
        const contextMessages = getContextMessages(newMessages);
        const body = buildRequestBody(contextMessages, systemPrompt, assistantPrompt, params);

        const res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Ошибка API");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("Нет потока ответа");

        const result = await readStream(reader, setStreamingContent);
        const durationMs = Math.round(performance.now() - startTime);
        const meta: RequestMeta = {
          usage: result.usage,
          durationMs,
          generationId: result.generationId,
        };

        const finalMessages: ChatMessage[] = [
          ...newMessages,
          {
            role: "assistant",
            content: result.content,
            params: snapshot.params,
            systemPrompt: snapshot.systemPrompt,
            assistantPrompt: snapshot.assistantPrompt,
            meta,
          },
        ];
        setMessages(finalMessages);
        setStreamingContent("");
        onComplete(finalMessages);

        // Fetch cost in background
        if (result.generationId) {
          fetchCost(result.generationId).then((cost) => {
            if (cost === undefined) return;
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last?.meta) {
                updated[updated.length - 1] = {
                  ...last,
                  meta: { ...last.meta, cost },
                };
                onComplete(updated);
              }
              return updated;
            });
          });
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          const durationMs = Math.round(performance.now() - startTime);
          const errorMessages: ChatMessage[] = [
            ...newMessages,
            {
              role: "assistant",
              content: `**Ошибка:** ${err.message}`,
              params: snapshot.params,
              systemPrompt: snapshot.systemPrompt,
              assistantPrompt: snapshot.assistantPrompt,
              meta: { durationMs },
            },
          ];
          setMessages(errorMessages);
          onComplete(errorMessages);
        }
        setStreamingContent("");
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, systemPrompt, assistantPrompt, params, isLoading, onComplete],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const resetContext = useCallback(() => {
    if (messages.length === 0) return;
    if (messages[messages.length - 1]?.role === "context-reset") return;
    const updated: ChatMessage[] = [...messages, { role: "context-reset", content: "" }];
    setMessages(updated);
    onComplete(updated);
  }, [messages, onComplete]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStreamingContent("");
    setIsLoading(false);
  }, []);

  const loadMessages = useCallback((msgs: ChatMessage[]) => {
    abortRef.current?.abort();
    setMessages(msgs);
    setStreamingContent("");
    setIsLoading(false);
  }, []);

  return { messages, streamingContent, isLoading, send, stop, resetContext, clear, loadMessages };
}
