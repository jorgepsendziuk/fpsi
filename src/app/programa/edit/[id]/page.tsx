"use client";

import  ResponsavelList  from "@app/responsavel/page";
import {
  Autocomplete,
  Box,
  Button,
  Select, 
  TextField,
  Typography,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { useGo } from "@refinedev/core";
import { Edit, useAutocomplete } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";

export default function ProgramaEdit() {
  const {
    saveButtonProps,
    refineCore: { queryResult, formLoading, onFinish },
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm({
    refineCoreProps: {
      meta: {
        select: "*",
      },
    },
  });

  const ProgramaData = queryResult?.data?.data;

  const { autocompleteProps: orgaoAutocompleteProps } = useAutocomplete({
    resource: "orgao",
    defaultValue: ProgramaData?.orgao?.id,
  });
  const { autocompleteProps: responsavelAutocompleteProps } = useAutocomplete({
    resource: "responsavel",
    defaultValue: ProgramaData?.responsavel?.id,
  });
  const go = useGo();
  return (
    <Edit
      headerProps={{
        sx: {
          backgroundColor: "#e6ecf2",
        },
      }}
      title={<Typography variant="h5">Programa</Typography>}
      breadcrumb
      isLoading={formLoading}
      headerButtons={({ defaultButtons }) => (
        <>
          
          <Button
      onClick={() => {
        go({
          to: {
            resource: "diagnostico", // resource name or identifier
            action: "list",    // action name
          },
          // query: {
          //   filters: [
          //     {
          //       field: "title",
          //       operator: "contains",
          //       value: "Refine",
          //     },
          //   ],
          // },
          type: "push", // or "replace" depending on your navigation needs
        });
      }}
    >
      DIAGNÓSTICO
    </Button>
        </>
      )}
      saveButtonProps={saveButtonProps}
    >
      <Box
        component="form"
        sx={{ display: "flex ", flexDirection: "row" }}
        autoComplete="off"
      >
        <Box sx={{ flex: "1 1 50%", padding: 1 }}>
          {/* orgao */}
          <Controller
            control={control}
            name={"orgao"}
            rules={{ required: "This field is required" }}
            // eslint-disable-next-line
            defaultValue={null as any}
            render={({ field }) => (
              <Autocomplete
                {...orgaoAutocompleteProps}
                {...field}
                onChange={(_, value) => {
                  field.onChange(value.id);
                }}
                getOptionLabel={(item) => {
                  return (
                    orgaoAutocompleteProps?.options?.find((p) => {
                      const itemId =
                        typeof item === "object"
                          ? item?.id?.toString()
                          : item?.toString();
                      const pId = p?.id?.toString();
                      return itemId === pId;
                    })?.nome ?? ""
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  const optionId = option?.id?.toString();
                  const valueId =
                    typeof value === "object"
                      ? value?.id?.toString()
                      : value?.toString();
                  return value === undefined || optionId === valueId;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={"Órgão"}
                    margin="normal"
                    variant="outlined"
                    error={!!(errors as any)?.orgao?.id}
                    helperText={(errors as any)?.orgao?.id?.message}
                    required
                  />
                )}
              />
            )}
          />
          {/* responsavel_controle_interno */}
          <Controller
            control={control}
            name={"responsavel_controle_interno"}
            rules={{ required: "This field is required" }}
            // eslint-disable-next-line
            defaultValue={null as any}
            render={({ field }) => (
              <Autocomplete
                {...responsavelAutocompleteProps}
                {...field}
                onChange={(_, value) => {
                  field.onChange(value.id);
                }}
                getOptionLabel={(item) => {
                  return (
                    responsavelAutocompleteProps?.options?.find((p) => {
                      const itemId =
                        typeof item === "object"
                          ? item?.id?.toString()
                          : item?.toString();
                      const pId = p?.id?.toString();
                      return itemId === pId;
                    })?.nome ?? ""
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  const optionId = option?.id?.toString();
                  const valueId =
                    typeof value === "object"
                      ? value?.id?.toString()
                      : value?.toString();
                  return value === undefined || optionId === valueId;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={"Responsável pelo Controle Interno"}
                    margin="normal"
                    variant="outlined"
                    error={!!(errors as any)?.nome?.id}
                    helperText={(errors as any)?.nome?.id?.message}
                    required
                  />
                )}
              />
            )}
          />
          {/* responsavel_privacidade */}
          <Controller
            control={control}
            name={"responsavel_privacidade"}
            rules={{ required: "This field is required" }}
            // eslint-disable-next-line
            defaultValue={null as any}
            render={({ field }) => (
              <Autocomplete
                {...responsavelAutocompleteProps}
                {...field}
                onChange={(_, value) => {
                  field.onChange(value.id);
                }}
                getOptionLabel={(item) => {
                  return (
                    responsavelAutocompleteProps?.options?.find((p) => {
                      const itemId =
                        typeof item === "object"
                          ? item?.id?.toString()
                          : item?.toString();
                      const pId = p?.id?.toString();
                      return itemId === pId;
                    })?.nome ?? ""
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  const optionId = option?.id?.toString();
                  const valueId =
                    typeof value === "object"
                      ? value?.id?.toString()
                      : value?.toString();
                  return value === undefined || optionId === valueId;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={"Encarregado pelo Tratamento de Dados Pessoais"}
                    margin="normal"
                    variant="outlined"
                    error={!!(errors as any)?.nome?.id}
                    helperText={(errors as any)?.nome?.id?.message}
                    required
                  />
                )}
              />
            )}
          />
          {/* responsavel_si */}
          <Controller
            control={control}
            name={"responsavel_si"}
            rules={{ required: "This field is required" }}
            // eslint-disable-next-line
            defaultValue={null as any}
            render={({ field }) => (
              <Autocomplete
                {...responsavelAutocompleteProps}
                {...field}
                onChange={(_, value) => {
                  field.onChange(value.id);
                }}
                getOptionLabel={(item) => {
                  return (
                    responsavelAutocompleteProps?.options?.find((p) => {
                      const itemId =
                        typeof item === "object"
                          ? item?.id?.toString()
                          : item?.toString();
                      const pId = p?.id?.toString();
                      return itemId === pId;
                    })?.nome ?? ""
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  const optionId = option?.id?.toString();
                  const valueId =
                    typeof value === "object"
                      ? value?.id?.toString()
                      : value?.toString();
                  return value === undefined || optionId === valueId;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={"Gestor de Segurança da Informação"}
                    margin="normal"
                    variant="outlined"
                    error={!!(errors as any)?.nome?.id}
                    helperText={(errors as any)?.nome?.id?.message}
                    required
                  />
                )}
              />
            )}
          />
          {/* responsavel_ti */}
          <Controller
            control={control}
            name={"responsavel_ti"}
            rules={{ required: "This field is required" }}
            // eslint-disable-next-line
            defaultValue={null as any}
            render={({ field }) => (
              <Autocomplete
                {...responsavelAutocompleteProps}
                {...field}
                onChange={(_, value) => {
                  field.onChange(value.id);
                }}
                getOptionLabel={(item) => {
                  return (
                    responsavelAutocompleteProps?.options?.find((p) => {
                      const itemId =
                        typeof item === "object"
                          ? item?.id?.toString()
                          : item?.toString();
                      const pId = p?.id?.toString();
                      return itemId === pId;
                    })?.nome ?? ""
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  const optionId = option?.id?.toString();
                  const valueId =
                    typeof value === "object"
                      ? value?.id?.toString()
                      : value?.toString();
                  return value === undefined || optionId === valueId;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={"Gestor de Tecnologia da Informação"}
                    margin="normal"
                    variant="outlined"
                    error={!!(errors as any)?.nome?.id}
                    helperText={(errors as any)?.nome?.id?.message}
                    required
                  />
                )}
              />
            )}
          />
        </Box>
        <Box sx={{ flex: "1 1 50%", padding: 1 }}>
          <TextField
            {...register("sgd_numero_documento_nota_tecnica", {
              required: "Campo obrigatório",
            })}
            error={!!(errors as any)?.sgd_numero_documento_nota_tecnica}
            helperText={
              (errors as any)?.sgd_numero_documento_nota_tecnica?.message
            }
            margin="normal"
            fullWidth
            InputLabelProps={{ shrink: true }}
            type="text"
            label={"Nº do Documento (Nota Técnica)"}
            name="sgd_numero_documento_nota_tecnica"
          />

          <TextField
            {...register("sgd_versao_diagnostico_enviado", {
              required: "Campo obrigatório",
            })}
            error={!!(errors as any)?.sgd_versao_diagnostico_enviado}
            helperText={
              (errors as any)?.sgd_versao_diagnostico_enviado?.message
            }
            margin="normal"
            fullWidth
            InputLabelProps={{ shrink: true }}
            type="text"
            label={"Versão do Diagnóstico Enviado"}
            name="sgd_versao_diagnostico_enviado"
          />

          <TextField
            {...register("sgd_data_limite_retorno", {
              required: "Campo obrigatório",
            })}
            error={!!(errors as any)?.sgd_data_limite_retorno}
            helperText={(errors as any)?.sgd_data_limite_retorno?.message}
            margin="normal"
            fullWidth
            InputLabelProps={{ shrink: true }}
            type="text"
            label={"Data Limite para Retorno do Diagnóstico"}
            name="sgd_data_limite_retorno"
          />

          <TextField
            {...register("sgd_retorno_data", {
              required: "Campo obrigatório",
            })}
            error={!!(errors as any)?.sgd_retorno_data}
            helperText={(errors as any)?.sgd_retorno_data?.message}
            margin="normal"
            fullWidth
            InputLabelProps={{ shrink: true }}
            type="text"
            label={"Data de Retorno do Diagnóstico para SGD"}
            name="sgd_retorno_data"
          />

          <TextField
            {...register("sgd_versao_diagnostico", {
              required: "Campo obrigatório",
            })}
            error={!!(errors as any)?.sgd_versao_diagnostico}
            helperText={(errors as any)?.sgd_versao_diagnostico?.message}
            margin="normal"
            fullWidth
            InputLabelProps={{ shrink: true }}
            type="text"
            label={"Versão do Diagnóstico Devolvido"}
            name="sgd_versao_diagnostico"
          />
        </Box>
      </Box>

      <ResponsavelList />
    </Edit>
  );
}
