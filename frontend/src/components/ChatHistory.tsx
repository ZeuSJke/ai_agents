"use client";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { ChatSession } from "@/types/chat";

interface ChatHistoryProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export default function ChatHistory({
  sessions,
  activeSessionId,
  onSelect,
  onNew,
  onDelete,
}: ChatHistoryProps) {
  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <Box
      sx={{
        width: 260,
        minWidth: 260,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, flexGrow: 1 }}>
          История чатов
        </Typography>
        <IconButton onClick={onNew} size="small" title="Новый чат" color="primary">
          <AddIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flex: 1, overflow: "auto", py: 0.5 }}>
        {sorted.length === 0 && (
          <Typography
            variant="body2"
            sx={{ px: 2, py: 3, color: "text.disabled", textAlign: "center" }}
          >
            Нет сохранённых чатов
          </Typography>
        )}
        {sorted.map((s) => (
          <ListItemButton
            key={s.id}
            selected={s.id === activeSessionId}
            onClick={() => onSelect(s.id)}
            sx={{
              borderRadius: 2,
              mx: 0.5,
              py: 1,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": { bgcolor: "primary.dark" },
                "& .MuiTypography-root": { color: "inherit" },
                "& .MuiIconButton-root": { color: "inherit" },
              },
            }}
          >
            <ListItemText
              primary={s.title}
              secondary={new Date(s.updatedAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
              primaryTypographyProps={{
                variant: "body2",
                noWrap: true,
                fontWeight: 500,
              }}
              secondaryTypographyProps={{
                variant: "caption",
                noWrap: true,
              }}
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(s.id);
              }}
              title="Удалить"
              sx={{ ml: 0.5, opacity: 0.6 }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
