import { alpha, type Theme } from "@mui/material/styles";
import type { CSSObject } from "@mui/system";

export type AdminTableDensity = "normal" | "compact";

export const adminTableMetrics = {
  rowHeight: { normal: 40, compact: 35 },
  headerHeight: 48,
  headerWeight: 600,
} as const;

// Shared visual roles for MUI lists and Handsontable data-entry grids.
export function getAdminTableStyles(theme: Theme, density: AdminTableDensity): CSSObject {
  return {
    minWidth: 0,
    maxWidth: "100%",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "& .MuiTableCell-root": {
      ...theme.typography.body1,
      borderBottomColor: theme.palette.divider,
      height: adminTableMetrics.rowHeight[density],
      padding: theme.spacing(density === "compact" ? 0.5 : 1, 1.5),
    },
    "& .MuiTableCell-head": {
      backgroundColor: theme.palette.primary.light,
      fontWeight: adminTableMetrics.headerWeight,
      height: adminTableMetrics.headerHeight,
    },
    "& .MuiTableRow-hover:hover": { backgroundColor: theme.palette.action.hover },
    "& .MuiTableRow-root.Mui-selected": { backgroundColor: theme.palette.action.selected },
  };
}

export function getAdminHotTableStyles(theme: Theme): CSSObject {
  const { palette, typography } = theme;
  return {
    colorScheme: palette.mode,
    "--ht-font-family": typography.fontFamily,
    "--ht-font-size": typography.body1.fontSize,
    "--ht-font-weight": typography.body1.fontWeight,
    "--ht-line-height": typography.body1.lineHeight,
    "--ht-font-size-small": typography.body2.fontSize,
    "--ht-header-font-weight": adminTableMetrics.headerWeight,
    "--ht-accent-color": palette.primary.main,
    "--ht-border-color": palette.divider,
    "--ht-foreground-color": palette.text.primary,
    "--ht-foreground-secondary-color": palette.text.secondary,
    "--ht-background-color": palette.background.paper,
    "--ht-background-secondary-color": palette.background.paper,
    "--ht-read-only-color": palette.text.primary,
    "--ht-disabled-color": palette.text.disabled,
    "--ht-placeholder-color": palette.text.secondary,
    "--ht-header-foreground-color": palette.text.primary,
    "--ht-header-background-color": palette.primary.light,
    "--ht-header-row-foreground-color": palette.text.primary,
    "--ht-header-row-background-color": palette.primary.light,
    "--ht-header-highlighted-foreground-color": palette.text.primary,
    "--ht-header-highlighted-background-color": palette.action.selected,
    "--ht-header-active-foreground-color": palette.primary.contrastText,
    "--ht-header-active-background-color": palette.primary.main,
    "--ht-header-row-highlighted-foreground-color": palette.text.primary,
    "--ht-header-row-highlighted-background-color": palette.action.selected,
    "--ht-header-row-active-foreground-color": palette.primary.contrastText,
    "--ht-header-row-active-background-color": palette.primary.main,
    "--ht-row-header-odd-background-color": palette.primary.light,
    "--ht-row-header-even-background-color": palette.primary.light,
    "--ht-cell-read-only-background-color": palette.background.paper,
    "--ht-cell-horizontal-border-color": palette.divider,
    "--ht-cell-vertical-border-color": palette.divider,
    "--ht-cell-selection-background-color": palette.action.selected,
    "--ht-cell-success-background-color": alpha(palette.success.main, 0.12),
    "--ht-cell-error-background-color": alpha(palette.error.main, 0.12),
    "--ht-cell-editor-foreground-color": palette.text.primary,
    "--ht-cell-editor-background-color": palette.background.paper,
    "--ht-input-foreground-color": palette.text.primary,
    "--ht-input-background-color": palette.background.paper,
    "--ht-input-hover-foreground-color": palette.text.primary,
    "--ht-input-hover-background-color": palette.background.paper,
    "--ht-menu-foreground-color": palette.text.primary,
    "--ht-menu-background-color": palette.background.paper,
    "--ht-wrapper-border-width": "1px",
    "--ht-wrapper-border-radius": `${theme.shape.borderRadius}px`,
    "--ht-density-cell-vertical": theme.spacing(0.5),
    "--ht-density-cell-horizontal": theme.spacing(1.5),
    "& .handsontable th, & .handsontable td": { fontFamily: typography.fontFamily },
    "& .handsontable th": { whiteSpace: "normal", verticalAlign: "middle" },
    "& .handsontable td": { verticalAlign: "middle" },
    "& .handsontableInput": {
      fontFamily: typography.fontFamily,
      fontSize: typography.body1.fontSize,
      color: palette.text.primary,
      backgroundColor: palette.background.paper,
    },
  };
}
