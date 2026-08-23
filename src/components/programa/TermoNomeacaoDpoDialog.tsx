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
  Paper,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GavelIcon from "@mui/icons-material/Gavel";
import * as dataService from "@/lib/services/dataService";
import {
  analyzeTermoGaps,
  atoFormalAnexoId,
  buildAtoDesignacaoResumo,
  buildAtoFormalParagrafos,
  createEmptyTermoDraft,
  seedTermoDraftFromPrograma,
  type TermoNomeacaoDpoDraft,
  type TipoEncarregadoAto,
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

type ResponsavelOpt = { id: number; nome?: string | null; email?: string | null; cargo?: string | null };

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
  const [responsaveis, setResponsaveis] = useState<ResponsavelOpt[]>([]);

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
          if (!String(prog.razao_social ?? "").trim() && emp?.razao_social) {
            prog = { ...prog, razao_social: emp.razao_social };
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
      setError("Não foi possível carregar os dados para o ato formal.");
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
  const preview = useMemo(() => buildAtoFormalParagrafos(draft), [draft]);
  const anexo = atoFormalAnexoId(draft.tipoEncarregado);
  const pj = draft.tipoEncarregado === "pessoa_juridica";

  const patch = <K extends keyof TermoNomeacaoDpoDraft>(key: K, value: TermoNomeacaoDpoDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const pickResponsavelNome = (id: unknown): string => {
    const r = responsaveis.find((x) => x.id === Number(id));
    return r ? String(r.nome ?? "").trim() : "";
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
        dpo_nome: pj ? draft.dpoPessoaNaturalResponsavel : draft.dpoNome,
      };
      const doc = await buildTermoNomeacaoDpoPdf({
        programa: enrichedPrograma,
        idOrSlug,
        draft,
      });
      doc.save(safeTermoPdfFileName(draft.organizacaoNome, draft.tipoEncarregado));

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
        Ato formal de indicação do encarregado
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Gera o documento no modelo da ANPD (Resolução CD/ANPD nº 18/2024):{" "}
          <strong>Anexo I</strong> para encarregado pessoa natural e <strong>Anexo II</strong> para
          pessoa jurídica. O PDF usa logo e dados já cadastrados; complete o que faltar antes da
          assinatura.
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <>
            {obrigatorios.length > 0 && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                <strong>Falta para gerar:</strong> {obrigatorios.map((g) => g.label).join("; ")}
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
              Tipo de encarregado (Anexo {anexo})
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={draft.tipoEncarregado}
              onChange={(_, value: TipoEncarregadoAto | null) => {
                if (!value) return;
                patch("tipoEncarregado", value);
              }}
              sx={{ mb: 2, flexWrap: "wrap" }}
            >
              <ToggleButton value="pessoa_natural" sx={{ textTransform: "none", px: 1.5 }}>
                Pessoa natural — Anexo I
              </ToggleButton>
              <ToggleButton value="pessoa_juridica" sx={{ textTransform: "none", px: 1.5 }}>
                Pessoa jurídica — Anexo II
              </ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Controlador
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome do controlador"
                  value={draft.organizacaoNome}
                  onChange={(e) => patch("organizacaoNome", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data da indicação"
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
                  label="Cidade da assinatura"
                  value={draft.cidadeAssinatura}
                  onChange={(e) => patch("cidadeAssinatura", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cargo na assinatura"
                  value={draft.representanteLegalCargo}
                  onChange={(e) => patch("representanteLegalCargo", e.target.value)}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Representante legal do controlador
            </Typography>
            {responsaveis.length > 0 && (
              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel id="ato-rep-select">Preencher a partir de Papéis e equipe</InputLabel>
                <Select
                  labelId="ato-rep-select"
                  label="Preencher a partir de Papéis e equipe"
                  value=""
                  onChange={(e) => {
                    const r = responsaveis.find((x) => x.id === Number(e.target.value));
                    if (!r) return;
                    setDraft((prev) => ({
                      ...prev,
                      representanteLegalNome: String(r.nome ?? "").trim(),
                      representanteLegalCargo: String(r.cargo ?? "").trim() || prev.representanteLegalCargo,
                    }));
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
            <TextField
              fullWidth
              size="small"
              label="Nome do representante legal"
              value={draft.representanteLegalNome}
              onChange={(e) => patch("representanteLegalNome", e.target.value)}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 1.5 }} />

            {pj ? (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Encarregado — pessoa jurídica
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome empresarial ou título do estabelecimento"
                  value={draft.dpoNomeEmpresarial}
                  onChange={(e) => patch("dpoNomeEmpresarial", e.target.value)}
                  sx={{ mb: 1.5 }}
                  helperText="Quem é indicado como encarregado (pessoa jurídica)."
                />
                {responsaveis.length > 0 && (
                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel id="ato-pn-select">
                      Pessoa natural responsável (Papéis e equipe)
                    </InputLabel>
                    <Select
                      labelId="ato-pn-select"
                      label="Pessoa natural responsável (Papéis e equipe)"
                      value=""
                      onChange={(e) => patch("dpoPessoaNaturalResponsavel", pickResponsavelNome(e.target.value))}
                    >
                      {responsaveis.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <TextField
                  fullWidth
                  size="small"
                  label="Nome completo da pessoa natural responsável"
                  value={draft.dpoPessoaNaturalResponsavel}
                  onChange={(e) => patch("dpoPessoaNaturalResponsavel", e.target.value)}
                  helperText="Representará a pessoa jurídica nas interações junto à ANPD e aos titulares."
                  sx={{ mb: 2 }}
                />
              </>
            ) : (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Encarregado — pessoa natural
                </Typography>
                {responsaveis.length > 0 && (
                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel id="ato-dpo-select">Preencher a partir de Papéis e equipe</InputLabel>
                    <Select
                      labelId="ato-dpo-select"
                      label="Preencher a partir de Papéis e equipe"
                      value=""
                      onChange={(e) => patch("dpoNome", pickResponsavelNome(e.target.value))}
                    >
                      {responsaveis.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <TextField
                  fullWidth
                  size="small"
                  label="Nome completo do encarregado"
                  value={draft.dpoNome}
                  onChange={(e) => patch("dpoNome", e.target.value)}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Substituto(a)
            </Typography>
            {responsaveis.length > 0 && (
              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel id="ato-sup-select">Preencher substituto a partir de Papéis e equipe</InputLabel>
                <Select
                  labelId="ato-sup-select"
                  label="Preencher substituto a partir de Papéis e equipe"
                  value=""
                  onChange={(e) => patch("substitutoNome", pickResponsavelNome(e.target.value))}
                >
                  {responsaveis.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              fullWidth
              size="small"
              label="Nome completo do substituto(a)"
              value={draft.substitutoNome}
              onChange={(e) => patch("substitutoNome", e.target.value)}
              helperText="Ausências, impedimentos e vacâncias — Anexos I e II da ANPD."
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Prévia do texto (modelo ANPD)
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "action.hover" }}>
              {preview.map((paragrafo, i) => (
                <Typography key={i} variant="body2" sx={{ mb: i === preview.length - 1 ? 0 : 1.5, textAlign: "justify" }}>
                  {paragrafo}
                </Typography>
              ))}
            </Paper>

            {canPersist && (
              <FormControlLabel
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
