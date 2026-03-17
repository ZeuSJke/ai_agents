"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface PromptPanelProps {
  systemPrompt: string;
  assistantPrompt: string;
  onSystemChange: (v: string) => void;
  onAssistantChange: (v: string) => void;
}

export default function PromptPanel({
  systemPrompt,
  assistantPrompt,
  onSystemChange,
  onAssistantChange,
}: PromptPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          maxWidth: 860,
          mx: "auto",
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            py: 1,
            cursor: "pointer",
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "text.secondary", flexGrow: 1 }}
          >
            Промпты (System / Assistant)
          </Typography>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 2 }}>
            <TextField
              label="System Prompt"
              multiline
              minRows={2}
              maxRows={6}
              value={systemPrompt}
              onChange={(e) => onSystemChange(e.target.value)}
              helperText="Задаёт роль и поведение модели"
              fullWidth
            />
            <TextField
              label="Assistant Prompt (prefill)"
              multiline
              minRows={2}
              maxRows={4}
              value={assistantPrompt}
              onChange={(e) => onAssistantChange(e.target.value)}
              helperText="Начало ответа ассистента — модель продолжит с этого текста"
              fullWidth
            />
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
