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

export default function ProgramaList() {
  const { dataGridProps } = useDataGrid({
    syncWithLocation: true,
    meta: {
      select: "*, orgao(id,nome)",
    },
  });

  const { data: orgaoData, isLoading: orgaoIsLoading } = useMany({
    resource: "orgao",
    ids:
      dataGridProps?.rows
        ?.map((item: any) => item?.orgao?.id)
        .filter(Boolean) ?? [],
    queryOptions: {
      enabled: !!dataGridProps?.rows,
    },
  });

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        type: "number"
      },
      {
        field: "criado_em",
        headerName: "Criado Em",
        
        minWidth: 200,
        cell: function render({ getValue }: { getValue: () => any }) {
          return (
            <DateField format="LLL" value={getValue()} />
          );
        },
      },
      {
        field: "orgao",
        flex: 1,
        headerName: "Órgão",
        valueGetter: ({ row }: { row: { orgao: { id: number } } }) => {
          const value = row?.orgao;
          return value;
        },
        renderCell: function render({ value }) {
          return orgaoIsLoading ? (
            <>Carregando...</>
          ) : (
            orgaoData?.data?.find((item) => item.id === value?.id)?.nome
          );
        },
      },
      {
        field: "actions",
        headerName: "Ações",
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
        minWidth: 80,
      },
    ],
    [orgaoData]
  );

  return (
    <List>
      <DataGrid {...dataGridProps} columns={columns} autoHeight />
    </List>
  );
}
