"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GavelIcon from "@mui/icons-material/Gavel";
import * as dataService from "@/lib/services/dataService";
import {
  analyzeTermoGaps,
  buildAtoDesignacaoResumo,
  createEmptyTermoDraft,
  seedTermoDraftFromPrograma,
  type PessoaTermoFields,
  type TermoNomeacaoDpoDraft,
} from "@/lib/utils/termoNomeacaoDpo";
import { buildTermoNomeacaoDpoPdf, safeTermoPdfFileName } from "@/lib/utils/termoNomeacaoDpoPdf";

type Props = {
  open: boolean;
  onClose: () => void;
  programaId: number;
  idOrSlug: string;
  programa: Record<string, unknown> | null;
  canPersist?: boolean;
  onProgramaUpdated?: (programa: Record<string, unknown>) => void;
};

function PessoaFieldsBlock({
  title,
  value,
  onChange,
  prefix,
}: {
  title: string;
  value: PessoaTermoFields;
  onChange: (next: PessoaTermoFields) => void;
  prefix: string;
}) {
  const set = (key: keyof PessoaTermoFields, v: string) => onChange({ ...value, [key]: v });
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            size="small"
            label="Nome completo"
            value={value.nome}
            onChange={(e) => set("nome", e.target.value)}
            inputProps={{ "aria-label": `${prefix}-nome` }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Cargo"
            value={value.cargo}
            onChange={(e) => set("cargo", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Nacionalidade"
            value={value.nacionalidade}
            onChange={(e) => set("nacionalidade", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Estado civil"
            value={value.estadoCivil}
            onChange={(e) => set("estadoCivil", e.target.value)}
            placeholder="casado(a), solteiro(a)…"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="E-mail"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="RG"
            value={value.rg}
            onChange={(e) => set("rg", e.target.value)}
            helperText="Só no PDF — não é salvo"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Órgão emissor RG"
            value={value.rgOrgao}
            onChange={(e) => set("rgOrgao", e.target.value)}
            placeholder="SSP SP"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="CPF"
            value={value.cpf}
            onChange={(e) => set("cpf", e.target.value)}
            helperText="Só no PDF — não é salvo"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export function TermoNomeacaoDpoDialog({
  open,
  onClose,
  programaId,
  idOrSlug,
  programa,
  canPersist = false,
  onProgramaUpdated,
}: Props) {
  const [draft, setDraft] = useState<TermoNomeacaoDpoDraft>(createEmptyTermoDraft);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistAto, setPersistAto] = useState(true);
  const [responsaveis, setResponsaveis] = useState<
    Array<{ id: number; nome?: string | null; email?: string | null; cargo?: string | null }>
  >([]);

  const applyResponsavelToPessoa = (
    person: PessoaTermoFields,
    r: { nome?: string | null; email?: string | null; cargo?: string | null } | null,
    defaultCargo: string
  ): PessoaTermoFields => {
    if (!r) return person;
    return {
      ...person,
      nome: String(r.nome ?? "").trim() || person.nome,
      email: String(r.email ?? "").trim() || person.email,
      cargo: String(r.cargo ?? "").trim() || person.cargo || defaultCargo,
    };
  };

  const load = useCallback(async () => {
    if (!programaId) return;
    setLoading(true);
    setError(null);
    try {
      const lista = await dataService.fetchResponsaveis(programaId);
      setResponsaveis(lista);
      const byId = (id: unknown) => {
        const n = Number(id);
        if (!Number.isFinite(n) || n <= 0) return null;
        return lista.find((r: { id: number }) => r.id === n) ?? null;
      };

      let prog: Record<string, unknown> = { ...(programa ?? {}) };
      let gestorEmpresa: string | null = null;
      const empresaId = Number(prog.empresa_id);
      if (Number.isFinite(empresaId) && empresaId > 0) {
        try {
          const emp = await dataService.fetchEmpresaById(empresaId);
          gestorEmpresa = emp?.gestor_responsavel ?? null;
          if (!String(prog.endereco ?? "").trim() && emp?.endereco) {
            prog = { ...prog, endereco: emp.endereco };
          }
          if (!String(prog.razao_social ?? "").trim() && emp?.razao_social) {
            prog = { ...prog, razao_social: emp.razao_social };
          }
          if (!String(prog.cnpj ?? "").trim() && emp?.cnpj) {
            prog = { ...prog, cnpj: emp.cnpj };
          }
          if (!String(prog.nome_fantasia ?? "").trim() && emp?.nome_fantasia) {
            prog = { ...prog, nome_fantasia: emp.nome_fantasia };
          }
        } catch {
          /* ignore */
        }
      }

      const seeded = seedTermoDraftFromPrograma({
        programa: prog,
        dpo: byId(prog.encarregado_dados_pessoais),
        suplente: byId(prog.encarregado_substituto),
        representante: byId(prog.representante_alta_administracao),
        gestorResponsavelEmpresa: gestorEmpresa,
      });
      setDraft(seeded);
    } catch (e) {
      console.error(e);
      setError("Não foi possível carregar os dados para o termo.");
    } finally {
      setLoading(false);
    }
  }, [programaId, programa]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const gaps = useMemo(() => analyzeTermoGaps(draft), [draft]);
  const obrigatorios = gaps.filter((g) => g.severity === "obrigatorio");
  const recomendados = gaps.filter((g) => g.severity === "recomendado");

  const patch = <K extends keyof TermoNomeacaoDpoDraft>(key: K, value: TermoNomeacaoDpoDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (obrigatorios.length > 0) {
      setError("Preencha os campos obrigatórios antes de gerar o PDF.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const enrichedPrograma = {
        ...(programa ?? {}),
        dpo_nome: draft.dpo.nome,
        dpo_email: draft.dpo.email,
      };
      const doc = await buildTermoNomeacaoDpoPdf({
        programa: enrichedPrograma,
        idOrSlug,
        draft,
      });
      doc.save(safeTermoPdfFileName(draft.organizacaoNome));

      if (canPersist && persistAto) {
        const resumo = buildAtoDesignacaoResumo(draft);
        await dataService.updateProgramaField(programaId, "dpo_ato_designacao_data", draft.dataNomeacao || null);
        await dataService.updateProgramaField(programaId, "dpo_ato_designacao_texto", resumo);
        onProgramaUpdated?.({
          ...(programa ?? {}),
          dpo_ato_designacao_data: draft.dataNomeacao,
          dpo_ato_designacao_texto: resumo,
        });
      }
      onClose();
    } catch (e) {
      console.error(e);
      setError("Não foi possível gerar o PDF.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <GavelIcon color="primary" />
        Termo de Nomeação do DPO
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Gera um rascunho do ato formal de designação do Encarregado (art. 41 LGPD e Resolução CD/ANPD nº 18/2024),
          usando logo, organização e papéis já cadastrados. CPF/RG entram só neste PDF e não são persistidos.
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <>
            {obrigatorios.length > 0 && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                <strong>Falta para gerar:</strong>{" "}
                {obrigatorios.map((g) => g.label).join("; ")}
              </Alert>
            )}
            {recomendados.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Recomendado completar (aparecerá como [placeholder] no PDF):</strong>
                <Box component="ul" sx={{ m: 0, pl: 2.5, mt: 0.5 }}>
                  {recomendados.map((g) => (
                    <li key={g.key}>
                      {g.label}
                      {g.hint ? ` — ${g.hint}` : ""}
                    </li>
                  ))}
                </Box>
              </Alert>
            )}
            {gaps.length === 0 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Dados essenciais e recomendados preenchidos. Você pode gerar o PDF.
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Organização (controlador)
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Razão social / nome"
                  value={draft.organizacaoNome}
                  onChange={(e) => patch("organizacaoNome", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="CNPJ"
                  value={draft.cnpj}
                  onChange={(e) => patch("cnpj", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="CCM (opcional)"
                  value={draft.ccm}
                  onChange={(e) => patch("ccm", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cidade da assinatura"
                  value={draft.cidadeAssinatura}
                  onChange={(e) => patch("cidadeAssinatura", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Endereço"
                  value={draft.endereco}
                  onChange={(e) => patch("endereco", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data da nomeação"
                  type="date"
                  value={draft.dataNomeacao}
                  onChange={(e) => patch("dataNomeacao", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Telefone"
                  value={draft.telefone}
                  onChange={(e) => patch("telefone", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="E-mail da organização"
                  value={draft.emailOrg}
                  onChange={(e) => patch("emailOrg", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Site"
                  value={draft.site}
                  onChange={(e) => patch("site", e.target.value)}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Representante legal
            </Typography>
            {responsaveis.length > 0 && (
              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel id="termo-rep-select">Preencher a partir de Papéis e equipe</InputLabel>
                <Select
                  labelId="termo-rep-select"
                  label="Preencher a partir de Papéis e equipe"
                  value=""
                  onChange={(e) => {
                    const r = responsaveis.find((x) => x.id === Number(e.target.value));
                    if (!r) return;
                    const next = applyResponsavelToPessoa(draft.representanteLegal, r, "Representante Legal");
                    patch("representanteLegal", {
                      ...next,
                      cargoAssinatura: next.cargo || "Representante Legal",
                    });
                  }}
                >
                  {responsaveis.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome"
                  value={draft.representanteLegal.nome}
                  onChange={(e) =>
                    patch("representanteLegal", { ...draft.representanteLegal, nome: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cargo na assinatura"
                  value={draft.representanteLegal.cargoAssinatura}
                  onChange={(e) =>
                    patch("representanteLegal", {
                      ...draft.representanteLegal,
                      cargoAssinatura: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 1.5 }} />

            {responsaveis.length > 0 && (
              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel id="termo-dpo-select">Preencher DPO a partir de Papéis e equipe</InputLabel>
                <Select
                  labelId="termo-dpo-select"
                  label="Preencher DPO a partir de Papéis e equipe"
                  value=""
                  onChange={(e) => {
                    const r = responsaveis.find((x) => x.id === Number(e.target.value));
                    if (!r) return;
                    patch(
                      "dpo",
                      applyResponsavelToPessoa(
                        draft.dpo,
                        r,
                        "Encarregado pelo Tratamento de Dados Pessoais (DPO)"
                      )
                    );
                  }}
                >
                  {responsaveis.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <PessoaFieldsBlock
              title="Encarregado (DPO)"
              prefix="dpo"
              value={draft.dpo}
              onChange={(dpo) => patch("dpo", dpo)}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={draft.incluirSuplente}
                  onChange={(e) => patch("incluirSuplente", e.target.checked)}
                />
              }
              label="Incluir suplente de DPO no termo"
            />
            {draft.incluirSuplente && (
              <>
                {responsaveis.length > 0 && (
                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel id="termo-sup-select">Preencher suplente a partir de Papéis e equipe</InputLabel>
                    <Select
                      labelId="termo-sup-select"
                      label="Preencher suplente a partir de Papéis e equipe"
                      value=""
                      onChange={(e) => {
                        const r = responsaveis.find((x) => x.id === Number(e.target.value));
                        if (!r) return;
                        patch("suplente", applyResponsavelToPessoa(draft.suplente, r, "Suplente de DPO"));
                      }}
                    >
                      {responsaveis.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <PessoaFieldsBlock
                  title="Suplente de DPO"
                  prefix="suplente"
                  value={draft.suplente}
                  onChange={(suplente) => patch("suplente", suplente)}
                />
              </>
            )}

            {canPersist && (
              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Checkbox checked={persistAto} onChange={(e) => setPersistAto(e.target.checked)} />
                }
                label="Ao gerar, atualizar data e resumo do ato de designação no programa"
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={generating}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfIcon />}
          onClick={() => void handleGenerate()}
          disabled={loading || generating || obrigatorios.length > 0}
        >
          Gerar PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}
