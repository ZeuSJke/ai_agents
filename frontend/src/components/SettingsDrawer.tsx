"use client";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import RestoreIcon from "@mui/icons-material/Restore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useState, useEffect } from "react";

export interface LLMParams {
  model: string;
  temperature: number | null;
  top_p: number | null;
  top_k: number | null;
  max_tokens: number | null;
  seed: number | null;
  frequency_penalty: number | null;
  presence_penalty: number | null;
}

const DEFAULTS: LLMParams = {
  model: "minimax/minimax-m2.5",
  temperature: null,
  top_p: null,
  top_k: null,
  max_tokens: null,
  seed: null,
  frequency_penalty: null,
  presence_penalty: null,
};

const POPULAR_MODELS = [
  "minimax/minimax-m2.5",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "openai/gpt-4.1",
  "openai/gpt-4.1-mini",
  "openai/o3-mini",
  "anthropic/claude-sonnet-4",
  "anthropic/claude-haiku-4",
  "google/gemini-2.5-pro-preview",
  "google/gemini-2.5-flash-preview",
  "google/gemini-2.0-flash-001",
  "meta-llama/llama-4-maverick",
  "meta-llama/llama-4-scout",
  "deepseek/deepseek-chat-v3-0324",
  "deepseek/deepseek-r1",
  "mistralai/mistral-large-2",
  "qwen/qwen-2.5-72b-instruct",
];

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  params: LLMParams;
  onParamsChange: (p: LLMParams) => void;
}

interface SliderParamProps {
  label: string;
  description: string;
  paramKey: keyof LLMParams;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  value: number | null;
  onChange: (key: keyof LLMParams, value: number | null) => void;
}

function SliderParam({
  label,
  description,
  paramKey,
  min,
  max,
  step,
  defaultValue,
  value,
  onChange,
}: SliderParamProps) {
  const enabled = value !== null;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={enabled}
              onChange={(e) =>
                onChange(paramKey, e.target.checked ? defaultValue : null)
              }
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {label}
              </Typography>
              <Tooltip title={description} arrow placement="top">
                <InfoOutlinedIcon
                  sx={{ fontSize: 16, color: "text.disabled", cursor: "help" }}
                />
              </Tooltip>
            </Box>
          }
          sx={{ flexGrow: 1, mr: 0 }}
        />
        {enabled && (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "primary.main",
              minWidth: 44,
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Number.isInteger(step) ? value : value?.toFixed(2)}
          </Typography>
        )}
      </Box>
      {enabled && (
        <Slider
          value={value ?? 0}
          onChange={(_, v) => onChange(paramKey, v as number)}
          min={min}
          max={max}
          step={step}
          size="small"
          sx={{ mx: 1 }}
        />
      )}
      {!enabled && (
        <Typography
          variant="caption"
          sx={{ color: "text.disabled", ml: 5.5, display: "block" }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}

interface IntFieldParamProps {
  label: string;
  description: string;
  value: number | null;
  onChange: (raw: string) => void;
}

function IntFieldParam({ label, description, value, onChange }: IntFieldParamProps) {
  return (
    <TextField
      label={label}
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      sx={{ mb: 2.5 }}
      helperText={description}
    />
  );
}

export default function SettingsDrawer({
  open,
  onClose,
  params,
  onParamsChange,
}: SettingsDrawerProps) {
  const [local, setLocal] = useState<LLMParams>(params);

  useEffect(() => {
    setLocal(params);
  }, [params]);

  const handleSlider = (key: keyof LLMParams, value: number | null) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    onParamsChange(updated);
  };

  const handleModel = (model: string) => {
    const updated = { ...local, model };
    setLocal(updated);
    onParamsChange(updated);
  };

  const handleIntField = (key: keyof LLMParams, raw: string) => {
    const value = raw === "" ? null : parseInt(raw, 10);
    if (value !== null && isNaN(value)) return;
    const updated = { ...local, [key]: value };
    setLocal(updated);
    onParamsChange(updated);
  };

  const handleReset = () => {
    setLocal(DEFAULTS);
    onParamsChange(DEFAULTS);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: 320, sm: 380 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
              Параметры генерации
            </Typography>
            <IconButton onClick={handleReset} title="Сбросить" size="small">
              <RestoreIcon />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
        </Box>

        {/* Scrollable content */}
        <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 2.5 }}>
          {/* Model Autocomplete */}
          <Autocomplete
            freeSolo
            options={POPULAR_MODELS}
            value={local.model}
            onInputChange={(_, value) => handleModel(value)}
            renderInput={(inputProps) => (
              <TextField
                {...inputProps}
                label="Модель"
                helperText="Выберите из списка или введите ID модели с openrouter.ai/models"
              />
            )}
            sx={{ mb: 3 }}
          />

          {/* Sliders */}
          <SliderParam
            label="Temperature"
            description="Степень случайности ответов. 0 — детерминированный, 2 — максимально креативный"
            paramKey="temperature"
            min={0}
            max={2}
            step={0.01}
            defaultValue={1}
            value={local.temperature}
            onChange={handleSlider}
          />

          <SliderParam
            label="Top P"
            description="Nucleus sampling: модель выбирает из наименьшего набора токенов с суммарной вероятностью P. Меньше — точнее"
            paramKey="top_p"
            min={0}
            max={1}
            step={0.01}
            defaultValue={1}
            value={local.top_p}
            onChange={handleSlider}
          />

          <SliderParam
            label="Frequency Penalty"
            description="Штраф за повторение токенов пропорционально частоте. Положительные значения снижают повторы"
            paramKey="frequency_penalty"
            min={-2}
            max={2}
            step={0.01}
            defaultValue={0}
            value={local.frequency_penalty}
            onChange={handleSlider}
          />

          <SliderParam
            label="Presence Penalty"
            description="Штраф за повторное упоминание уже использованных токенов. Положительные значения стимулируют новые темы"
            paramKey="presence_penalty"
            min={-2}
            max={2}
            step={0.01}
            defaultValue={0}
            value={local.presence_penalty}
            onChange={handleSlider}
          />

          <Divider sx={{ my: 1.5 }} />

          {/* Integer fields */}
          <IntFieldParam
            label="Top K"
            description="Модель выбирает из K наиболее вероятных токенов. Меньше — точнее, больше — разнообразнее"
            value={local.top_k}
            onChange={(raw) => handleIntField("top_k", raw)}
          />

          <IntFieldParam
            label="Max Tokens"
            description="Максимальное количество токенов в ответе. Ограничивает длину генерации"
            value={local.max_tokens}
            onChange={(raw) => handleIntField("max_tokens", raw)}
          />

          <IntFieldParam
            label="Seed"
            description="Фиксирует генерацию для воспроизводимости. Одинаковый seed + запрос = одинаковый ответ"
            value={local.seed}
            onChange={(raw) => handleIntField("seed", raw)}
          />
        </Box>
      </Box>
    </Drawer>
  );
}
