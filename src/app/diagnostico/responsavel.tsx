"use client";
import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRowModesModel, GridRowModes, GridActionsCellItem } from "@mui/x-data-grid";
import { supabaseBrowserClient } from "@utils/supabase/client";
import { Save, Cancel, Edit, Delete, Add } from "@mui/icons-material";
import { Button, Box } from "@mui/material";
import type { Responsavel } from "../../lib/types/types";

// Container
import ResponsavelContainer from './containers/ResponsavelContainer';

/**
 * Props for the Responsavel module
 */
interface ResponsavelProps {
  /** The program ID */
  programa: number;
  /** Optional callback when responsavel list is updated */
  onUpdate?: () => void;
}

/**
 * Responsavel module that re-exports the ResponsavelContainer
 */
const ResponsavelModule = ({ programa, onUpdate }: ResponsavelProps) => {
  return (
    <ResponsavelContainer 
      programa={programa} 
      onUpdate={onUpdate} 
    />
  );
};

export default ResponsavelModule;
