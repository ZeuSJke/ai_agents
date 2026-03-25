"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import TuneIcon from "@mui/icons-material/Tune";
import DataUsageIcon from "@mui/icons-material/DataUsage";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import type { RequestMeta, LLMParams } from "@/types/chat";

const PARAM_LABELS: Record<string, string> = {
  model: "Модель",
  temperature: "Temperature",
  top_p: "Top P",
  top_k: "Top K",
  max_tokens: "Max Tokens",
  seed: "Seed",
  frequency_penalty: "Freq. Penalty",
  presence_penalty: "Pres. Penalty",
};

const smallChipSx = { height: 22, fontSize: "0.7rem" } as const;

function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function formatCost(cost: number): string {
  if (cost < 0.001) return `$${cost.toFixed(6)}`;
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(3)}`;
}

export function MetaChips({ meta }: { meta: RequestMeta }) {
  const items: { icon: React.ReactElement; label: string }[] = [];

  if (meta.usage) {
    const u = meta.usage;
    items.push({
      icon: <DataUsageIcon sx={{ fontSize: 13 }} />,
      label: `${u.prompt_tokens ?? "?"}+${u.completion_tokens ?? "?"}=${u.total_tokens ?? "?"}`,
    });
  }
  if (meta.durationMs !== undefined) {
    items.push({
      icon: <TimerOutlinedIcon sx={{ fontSize: 13 }} />,
      label: formatDuration(meta.durationMs),
    });
  }
  if (meta.cost !== undefined) {
    items.push({
      icon: <AttachMoneyIcon sx={{ fontSize: 13 }} />,
      label: formatCost(meta.cost),
    });
  }

  if (items.length === 0) return null;

  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
      {items.map((c, i) => (
        <Chip
          key={i}
          icon={c.icon}
          label={c.label}
          size="small"
          variant="outlined"
          sx={{ ...smallChipSx, fontSize: "0.68rem", "& .MuiChip-icon": { fontSize: 13, ml: 0.5 }, opacity: 0.65 }}
        />
      ))}
    </Box>
  );
}

export function ParamsChip({
  params,
  systemPrompt,
  assistantPrompt,
}: {
  params: LLMParams;
  systemPrompt?: string;
  assistantPrompt?: string;
}) {
  const [open, setOpen] = useState(false);

  const activeParams = Object.entries(params).filter(
    ([key, val]) => val !== null && val !== "" && key !== "model",
  );

  return (
    <Box sx={{ mt: 0.5 }}>
      <Chip
        icon={<TuneIcon sx={{ fontSize: 14 }} />}
        label={`${params.model}${activeParams.length > 0 ? ` +${activeParams.length}` : ""}`}
        size="small"
        variant="outlined"
        onClick={() => setOpen(!open)}
        sx={{
          height: 24,
          fontSize: "0.7rem",
          cursor: "pointer",
          "& .MuiChip-icon": { fontSize: 14 },
          opacity: 0.7,
          "&:hover": { opacity: 1 },
        }}
      />
      <Collapse in={open}>
        <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, bgcolor: "action.hover", fontSize: "0.75rem" }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            <Chip
              label={`${PARAM_LABELS.model}: ${params.model}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={smallChipSx}
            />
            {activeParams.map(([key, val]) => (
              <Chip
                key={key}
                label={`${PARAM_LABELS[key] || key}: ${val}`}
                size="small"
                variant="outlined"
                sx={smallChipSx}
              />
            ))}
          </Box>
          {systemPrompt && (
            <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary", whiteSpace: "pre-wrap" }}>
              <strong>System:</strong> {systemPrompt.length > 150 ? systemPrompt.slice(0, 150) + "..." : systemPrompt}
            </Typography>
          )}
          {assistantPrompt && (
            <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "text.secondary", whiteSpace: "pre-wrap" }}>
              <strong>Prefill:</strong> {assistantPrompt.length > 100 ? assistantPrompt.slice(0, 100) + "..." : assistantPrompt}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
