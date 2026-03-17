"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TuneIcon from "@mui/icons-material/Tune";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import SettingsDrawer, { type LLMParams } from "@/components/SettingsDrawer";
import ChatArea from "@/components/ChatArea";
import PromptPanel from "@/components/PromptPanel";
import ChatInput from "@/components/ChatInput";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const DEFAULT_PARAMS: LLMParams = {
  model: "minimax/minimax-m2.5",
  temperature: null,
  top_p: null,
  top_k: null,
  max_tokens: null,
  seed: null,
  frequency_penalty: null,
  presence_penalty: null,
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [systemPrompt, setSystemPrompt] = useState(
    "Ты — полезный AI-ассистент. Отвечай кратко и по делу. Поддерживай контекст беседы."
  );
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [params, setParams] = useState<LLMParams>(DEFAULT_PARAMS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const handleSend = useCallback(
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

      try {
        const body = {
          messages: newMessages,
          system_prompt: systemPrompt,
          assistant_prompt: assistantPrompt,
          stream: true,
          ...Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== null && v !== "")
          ),
        };

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

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.error) throw new Error(parsed.error);
                if (parsed.content) {
                  accumulated += parsed.content;
                  setStreamingContent(accumulated);
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: accumulated },
        ]);
        setStreamingContent("");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `**Ошибка:** ${err.message}`,
            },
          ]);
        }
        setStreamingContent("");
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, systemPrompt, assistantPrompt, params, isLoading]
  );

  const handleClear = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setStreamingContent("");
    setIsLoading(false);
  };

  const handleStop = () => {
    if (abortRef.current) abortRef.current.abort();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* App Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <SmartToyOutlined sx={{ mr: 1.5, color: "primary.main" }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
            AI Agents
          </Typography>
          <IconButton onClick={handleClear} title="Очистить историю">
            <DeleteOutlineIcon />
          </IconButton>
          <IconButton onClick={() => setDrawerOpen(true)} title="Параметры">
            <TuneIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Prompt Panel */}
      <PromptPanel
        systemPrompt={systemPrompt}
        assistantPrompt={assistantPrompt}
        onSystemChange={setSystemPrompt}
        onAssistantChange={setAssistantPrompt}
      />

      {/* Chat Area */}
      <ChatArea
        messages={messages}
        streamingContent={streamingContent}
        isLoading={isLoading}
      />

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isLoading={isLoading}
      />

      {/* Settings Drawer */}
      <SettingsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        params={params}
        onParamsChange={setParams}
      />
    </Box>
  );
}
