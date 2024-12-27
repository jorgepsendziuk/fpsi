"use client";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMany } from "@refinedev/core";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  MarkdownField,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";
import React from "react";

export default function AuxMedidaList() {
  const { dataGridProps } = useDataGrid({
    syncWithLocation: true,
    meta: {
      select: "*, controle(id,nome)",
    },
  });

  const { data: medidaData, isLoading: medidaIsLoading } = useMany({
    resource: "controle",
    ids:
      dataGridProps?.rows
        ?.map((item: any) => item?.controle?.id)
        .filter(Boolean) ?? [],
    queryOptions: {
      enabled: !!dataGridProps?.rows,
    },
  });

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        width: 100,
        field: "id",
        headerName: "ID",
        type: "number"
      },
      {
        width: 100,
        field:"id_medida",
        headerName: "ID Medida",
      },

      {
        width: 400,
        field:"medida",
        headerName: "Medida",
      },
      {
        width: 200,
        field: "actions",
        headerName: "Actions",
        sortable: false,
        renderCell: function render({ row })  {
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
      },
    ],
    [medidaData]
  );

  return (
    <List>
      <DataGrid {...dataGridProps} columns={columns} autoHeight />
    </List>
  );
}
