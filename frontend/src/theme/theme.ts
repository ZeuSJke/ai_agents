"use client";

import { createTheme } from "@mui/material/styles";

// Material You 3 inspired theme
const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#6750A4",
          light: "#EADDFF",
          dark: "#21005D",
          contrastText: "#FFFFFF",
        },
        secondary: {
          main: "#625B71",
          light: "#E8DEF8",
          dark: "#1D192B",
          contrastText: "#FFFFFF",
        },
        error: {
          main: "#B3261E",
          light: "#F9DEDC",
          dark: "#601410",
        },
        background: {
          default: "#FEF7FF",
          paper: "#FFFBFE",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#D0BCFF",
          light: "#4F378B",
          dark: "#EADDFF",
          contrastText: "#381E72",
        },
        secondary: {
          main: "#CCC2DC",
          light: "#4A4458",
          dark: "#E8DEF8",
          contrastText: "#332D41",
        },
        error: {
          main: "#F2B8B5",
          light: "#8C1D18",
          dark: "#F9DEDC",
        },
        background: {
          default: "#141218",
          paper: "#1D1B20",
        },
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Roboto", "Noto Sans", "Arial", sans-serif',
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: "none",
          fontWeight: 500,
          paddingInline: 24,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: "16px 0 0 16px",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: "0.8rem",
          maxWidth: 260,
          lineHeight: 1.5,
        },
      },
    },
  },
});

export default theme;
