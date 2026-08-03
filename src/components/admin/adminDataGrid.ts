"use client";

import { ptBR as dataGridPtBRLocale } from "@mui/x-data-grid/locales";

export const adminDataGridLocaleText = {
  ...dataGridPtBRLocale.components.MuiDataGrid.defaultProps.localeText,
};

export const adminDataGridSx = {
  border: "none",
  "& .MuiDataGrid-columnHeaders": {
    bgcolor: "action.hover",
    fontWeight: 700,
  },
};
