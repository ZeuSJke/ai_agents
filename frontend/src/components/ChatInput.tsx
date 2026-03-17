"use client";

import { useState, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [input, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isLoading) return;
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: 2,
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          maxWidth: 860,
          mx: "auto",
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 6,
          bgcolor: "background.paper",
        }}
      >
        <InputBase
          inputRef={inputRef}
          multiline
          maxRows={6}
          placeholder="Введите сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ flex: 1, py: 0.5, fontSize: "1rem" }}
          autoFocus
        />
        {isLoading ? (
          <IconButton onClick={onStop} color="error" title="Остановить">
            <StopIcon />
          </IconButton>
        ) : (
          <IconButton
            onClick={handleSend}
            disabled={!input.trim()}
            color="primary"
            title="Отправить"
          >
            <SendIcon />
          </IconButton>
        )}
      </Paper>
    </Box>
  );
}
