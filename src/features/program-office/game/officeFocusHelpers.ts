import type { OfficeCommitteeSlot, OfficeFocusPanel, OfficeMesaSlot } from "./OfficeExperienceContext";
import type { Responsavel } from "@/lib/types/types";

type CtxNames = {
  nomePorResponsavelId: Map<number, string>;
  responsaveis: Responsavel[];
};

export function buildCommitteeFocusPanel(
  ctx: CtxNames,
  slot: OfficeCommitteeSlot,
  focus: [number, number, number],
): OfficeFocusPanel {
  const people = slot.memberIds.map((id) => {
    const nome = ctx.nomePorResponsavelId.get(id)?.trim() || `#${id}`;
    const resp = ctx.responsaveis.find((r) => r.id === id);
    const detail = [resp?.cargo?.trim(), resp?.departamento?.trim()].filter(Boolean).join(" · ");
    return { name: nome, detail: detail || undefined };
  });
  return {
    kind: "committee",
    badge: "MESA DE COMITÊ",
    title: slot.subtitle,
    subtitle: slot.title,
    people,
    href: slot.href,
    hrefLabel: "Cadastro do comité",
    focus,
    focusDistance: 7.2,
  };
}

export function buildSectorFocusPanel(
  ctx: CtxNames,
  deptName: string,
  people: Responsavel[],
  focus: [number, number, number],
): OfficeFocusPanel {
  const listed = people.slice(0, 12).map((p) => {
    const nome = (p.nome && p.nome.trim()) || `#${p.id}`;
    const detail = [p.cargo?.trim(), p.departamento?.trim()].filter(Boolean).join(" · ");
    return { name: nome, detail: detail || deptName };
  });
  return {
    kind: "sector",
    badge: "SALA DE SETOR",
    title: deptName,
    subtitle: `${people.length} responsável(is) neste departamento`,
    people: listed,
    enterRoom: { deptName, people },
    focus,
    focusDistance: 7.8,
  };
}

export function buildGovernanceFocusPanel(
  mesaSlots: OfficeMesaSlot[],
  equipeHref: string,
  focus: [number, number, number],
): OfficeFocusPanel {
  const people = mesaSlots.map((s) => ({
    name: s.empty ? "A designar" : s.label,
    detail: s.rotulo,
  }));
  return {
    kind: "governance",
    badge: "MESA DE GOVERNANÇA",
    title: "Papéis PPSI 2.0",
    subtitle: "Cinco lugares obrigatórios na mesa central",
    people,
    href: equipeHref,
    hrefLabel: "Estrutura de governança",
    focus,
    focusDistance: 8.5,
  };
}
