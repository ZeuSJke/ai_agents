"use client";

import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MessageBubble from "@/components/MessageBubble";
import type { ChatMessage } from "@/types/chat";

interface ChatAreaProps {
  messages: ChatMessage[];
  streamingContent: string;
  isLoading: boolean;
}

function ContextResetDivider() {
  return (
    <Divider sx={{ my: 1 }}>
      <Chip
        icon={<RestartAltIcon sx={{ fontSize: 16 }} />}
        label="Контекст сброшен"
        size="small"
        variant="outlined"
        color="warning"
        sx={{ fontSize: "0.75rem", height: 26 }}
      />
    </Divider>
  );
}

function EmptyState() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "50vh",
        opacity: 0.4,
        gap: 2,
        userSelect: "none",
      }}
    >
      <SmartToyOutlined sx={{ fontSize: 64 }} />
      <Typography variant="h6">Начните диалог</Typography>
      <Typography variant="body2" color="text.secondary">
        Введите сообщение, чтобы начать общение с AI
      </Typography>
    </Box>
  );
}

function LoadingIndicator() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "secondary.light",
        }}
      >
        <SmartToyOutlined fontSize="small" sx={{ color: "secondary.dark" }} />
      </Box>
      <CircularProgress size={20} />
    </Box>
  );
}

export default function ChatArea({ messages, streamingContent, isLoading }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamingContent]);

  const lastResetIdx = messages.findLastIndex((m) => m.role === "context-reset");
  const isEmpty = messages.length === 0 && !streamingContent;

  return (
    <Box ref={scrollRef} sx={{ flex: 1, overflow: "auto", px: { xs: 2, md: 3 }, py: 2, pb: 0, minHeight: 0 }}>
      <Box sx={{ maxWidth: 860, mx: "auto", display: "flex", flexDirection: "column", gap: 2, pb: 4 }}>
        {isEmpty && <EmptyState />}

        {messages.map((msg, i) =>
          msg.role === "context-reset" ? (
            <ContextResetDivider key={i} />
          ) : (
            <MessageBubble key={i} message={msg} dimmed={lastResetIdx >= 0 && i < lastResetIdx} />
          ),
        )}

        {streamingContent && (
          <MessageBubble message={{ role: "assistant", content: streamingContent }} isStreaming />
        )}

        {isLoading && !streamingContent && <LoadingIndicator />}
      </Box>
    </Box>
  );
}
