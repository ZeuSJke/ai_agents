"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import ReactMarkdown from "react-markdown";
import { MetaChips, ParamsChip } from "@/components/MessageMeta";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  dimmed?: boolean;
}

const avatarSx = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  mt: 0.5,
} as const;

export default function MessageBubble({ message, isStreaming, dimmed }: MessageBubbleProps) {
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
        opacity: dimmed ? 0.45 : 1,
        transition: "opacity 0.3s",
      }}
    >
      <Box
        sx={{
          ...avatarSx,
          bgcolor: isUser ? "primary.main" : "secondary.light",
          color: isUser ? "primary.contrastText" : "secondary.dark",
        }}
      >
        {isUser ? <PersonOutlined fontSize="small" /> : <SmartToyOutlined fontSize="small" />}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: isUser ? "primary.main" : "action.hover",
            color: isUser ? "primary.contrastText" : "text.primary",
            borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
            "& a": { color: isUser ? "inherit" : "primary.main" },
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
              {isStreaming && <BlinkingCursor />}
            </Box>
          )}
        </Paper>

        {!isUser && !isStreaming && message.meta && <MetaChips meta={message.meta} />}
        {!isUser && !isStreaming && message.params && (
          <ParamsChip
            params={message.params}
            systemPrompt={message.systemPrompt}
            assistantPrompt={message.assistantPrompt}
          />
        )}
      </Box>
    </Box>
  );
}

function BlinkingCursor() {
  return (
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
        "@keyframes blink": { "50%": { opacity: 0 } },
      }}
    />
  );
}
