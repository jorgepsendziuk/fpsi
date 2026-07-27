import type { OfficePersonSheetPayload } from "./OfficeExperienceContext";
import type { Responsavel } from "@/lib/types/types";

export function truncateLabel(text: string, max = 18): string {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export function sheetForSectorPerson(p: Responsavel, deptName: string): OfficePersonSheetPayload {
  const nome = (p.nome && p.nome.trim()) || `#${p.id}`;
  const cargo = p.cargo?.trim();
  const setorLinha = p.departamento?.trim() || deptName;
  return {
    title: truncateLabel(nome),
    subtitle: deptName,
    rows: [
      { label: "Nome", value: nome },
      { label: "Cargo", value: cargo || "—" },
      { label: "Departamento", value: setorLinha || "—" },
    ],
  };
}

export function sheetForCommitteeMember(
  nome: string,
  slotTitle: string,
  slotSubtitle: string,
  cargoSetor: string,
): OfficePersonSheetPayload {
  return {
    title: truncateLabel(nome),
    subtitle: slotTitle,
    rows: [
      { label: "Comité", value: slotTitle },
      { label: "Função", value: slotSubtitle },
      { label: "Nome", value: nome },
      { label: "Cargo / setor", value: cargoSetor || "—" },
    ],
  };
}
