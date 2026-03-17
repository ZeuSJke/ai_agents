"use client";

import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/app/page";

interface ChatAreaProps {
  messages: ChatMessage[];
  streamingContent: string;
  isLoading: boolean;
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        maxWidth: "85%",
        alignSelf: isUser ? "flex-end" : "flex-start",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: isUser ? "primary.main" : "secondary.light",
          color: isUser ? "primary.contrastText" : "secondary.dark",
          flexShrink: 0,
          mt: 0.5,
        }}
      >
        {isUser ? (
          <PersonOutlined fontSize="small" />
        ) : (
          <SmartToyOutlined fontSize="small" />
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: isUser ? "primary.main" : "action.hover",
          color: isUser ? "primary.contrastText" : "text.primary",
          borderRadius: isUser
            ? "20px 20px 4px 20px"
            : "20px 20px 20px 4px",
          "& a": {
            color: isUser ? "inherit" : "primary.main",
          },
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {isUser ? (
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {message.content}
          </Typography>
        ) : (
          <Box className="message-markdown">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {isStreaming && (
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 6,
                  height: 18,
                  bgcolor: "text.primary",
                  ml: 0.5,
                  animation: "blink 1s step-end infinite",
                  verticalAlign: "text-bottom",
                  "@keyframes blink": {
                    "50%": { opacity: 0 },
                  },
                }}
              />
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default function ChatArea({
  messages,
  streamingContent,
  isLoading,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <Box
      sx={{
        flex: 1,
        overflow: "auto",
        px: { xs: 2, md: 4 },
        py: 2,
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          maxWidth: 860,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.length === 0 && !streamingContent && (
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
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {streamingContent && (
          <MessageBubble
            message={{ role: "assistant", content: streamingContent }}
            isStreaming
          />
        )}

        {isLoading && !streamingContent && (
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
              <SmartToyOutlined
                fontSize="small"
                sx={{ color: "secondary.dark" }}
              />
            </Box>
            <CircularProgress size={20} />
          </Box>
        )}

        <div ref={bottomRef} />
      </Box>
    </Box>
  );
}
