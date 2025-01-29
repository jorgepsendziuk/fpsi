"use client";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  CreateButton,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";
import React from "react";

const ResponsavelList = () => {
  const { dataGridProps } = useDataGrid({
    resource: "responsavel"
  });

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: "nome",
        flex: 1,
        headerName: "Responsável"
      },
      {
        field: "departamento",
        flex: 1,
        headerName: "Departamento"
      },
      {
        field: "email",
        flex: 1,
        headerName: "Email"
      },
      {
        field: "actions",
        headerName: "Ações",
        sortable: false,
        renderCell: function render({ row }) {
          return (
            <>
              <EditButton hideText recordItemId={row.id} />
              <ShowButton hideText recordItemId={row.id} />
              <DeleteButton hideText recordItemId={row.id} />
            </>
          );
        },
        align: "center",
        headerAlign: "center",
        minWidth: 80,
      },
    ],
    []
  );

  return (
    <List
      breadcrumb
      headerButtons={<CreateButton 
        resource="responsavel"
        color="primary"
        style={{ backgroundColor: "#ccc" }}
      >CADASTRAR</CreateButton>}
      title="Áreas de Domínio - Plano de Trabalho"
      wrapperProps={{
        sx: {
          backgroundColor: "#e6ecf2",
          textAlign: "center",
        },
      }}
    >
      <DataGrid 
        {...dataGridProps} 
        columns={columns}
        hideFooterPagination
        hideFooter
        autoHeight 
        style={{ backgroundColor: "white" }}
      />
    </List>
  );
}

export default ResponsavelList;
