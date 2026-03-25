import { useState, useEffect, useCallback } from "react";
import type { StoredSession, ChatMessage, LLMParams } from "@/types/chat";

const STORAGE_KEY = "ai-agents-sessions";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function load(): StoredSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(sessions: StoredSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function useSessions() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setSessions(load());
  }, []);

  const persist = useCallback(
    (
      messages: ChatMessage[],
      systemPrompt: string,
      assistantPrompt: string,
      params: LLMParams,
    ) => {
      if (messages.length === 0) return;

      setSessions((prev) => {
        const now = Date.now();
        let updated: StoredSession[];

        if (activeId) {
          updated = prev.map((s) =>
            s.id === activeId
              ? { ...s, messages, systemPrompt, assistantPrompt, params, updatedAt: now }
              : s,
          );
        } else {
          const firstUserMsg = messages.find((m) => m.role === "user");
          const title = firstUserMsg ? firstUserMsg.content.slice(0, 50) : "Новый чат";
          const session: StoredSession = {
            id: generateId(),
            title,
            messages,
            systemPrompt,
            assistantPrompt,
            params,
            createdAt: now,
            updatedAt: now,
          };
          updated = [...prev, session];
          setActiveId(session.id);
        }

        save(updated);
        return updated;
      });
    },
    [activeId],
  );

  const select = useCallback(
    (id: string) => {
      const session = sessions.find((s) => s.id === id);
      if (!session) return null;
      setActiveId(id);
      return session;
    },
    [sessions],
  );

  const remove = useCallback((id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      save(updated);
      return updated;
    });
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const startNew = useCallback(() => {
    setActiveId(null);
  }, []);

  return { sessions, activeId, persist, select, remove, startNew };
}
