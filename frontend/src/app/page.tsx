"use client";

import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import SettingsPanel, { DEFAULT_PARAMS } from "@/components/SettingsPanel";
import ChatArea from "@/components/ChatArea";
import PromptPanel from "@/components/PromptPanel";
import ChatInput from "@/components/ChatInput";
import ChatHistory from "@/components/ChatHistory";
import { useSessions } from "@/hooks/useSessions";
import { useChat } from "@/hooks/useChat";
import type { LLMParams, ChatMessage } from "@/types/chat";

// Re-export types for backwards compatibility with components that import from page
export type { ChatMessage, UsageInfo, RequestMeta } from "@/types/chat";

export default function Home() {
  const [systemPrompt, setSystemPrompt] = useState(
    "Ты — полезный AI-ассистент. Отвечай кратко и по делу. Поддерживай контекст беседы.",
  );
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [params, setParams] = useState<LLMParams>(DEFAULT_PARAMS);

  const { sessions, activeId, persist, select, remove, startNew } = useSessions();

  const onComplete = useCallback(
    (msgs: ChatMessage[]) => persist(msgs, systemPrompt, assistantPrompt, params),
    [persist, systemPrompt, assistantPrompt, params],
  );

  const chat = useChat({ systemPrompt, assistantPrompt, params, onComplete });

  const handleSelectSession = (id: string) => {
    const session = select(id);
    if (!session) return;
    chat.loadMessages(session.messages);
    setSystemPrompt(session.systemPrompt);
    setAssistantPrompt(session.assistantPrompt);
    setParams(session.params);
  };

  const handleNewSession = () => {
    startNew();
    chat.clear();
  };

  const handleDeleteSession = (id: string) => {
    remove(id);
    if (activeId === id) chat.clear();
  };

  const handleClear = () => {
    startNew();
    chat.clear();
  };

  const sessionList = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      <ChatHistory
        sessions={sessionList}
        activeSessionId={activeId}
        onSelect={handleSelectSession}
        onNew={handleNewSession}
        onDelete={handleDeleteSession}
      />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{ bgcolor: "background.paper", color: "text.primary", borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar variant="dense">
            <SmartToyOutlined sx={{ mr: 1.5, color: "primary.main" }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
              AI Agents
            </Typography>
            <Tooltip title="Сбросить контекст — новые сообщения не будут включать предыдущую историю" arrow>
              <IconButton onClick={chat.resetContext} color="warning">
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleClear} title="Новый чат">
              <DeleteOutlineIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <PromptPanel
          systemPrompt={systemPrompt}
          assistantPrompt={assistantPrompt}
          onSystemChange={setSystemPrompt}
          onAssistantChange={setAssistantPrompt}
        />

        <ChatArea messages={chat.messages} streamingContent={chat.streamingContent} isLoading={chat.isLoading} />

        <ChatInput onSend={chat.send} onStop={chat.stop} isLoading={chat.isLoading} />
      </Box>

      <SettingsPanel params={params} onParamsChange={setParams} />
    </Box>
  );
}
