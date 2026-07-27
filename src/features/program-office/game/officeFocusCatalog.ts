import type { OfficeCommitteeSlot, OfficeFocusPanel, OfficeMesaSlot, OfficeRoomState } from "./OfficeExperienceContext";
import type { Responsavel } from "@/lib/types/types";
import {
  buildCommitteeFocusPanel,
  buildGovernanceFocusPanel,
  buildSectorFocusPanel,
} from "./officeFocusHelpers";
import {
  ANNEX_CORRIDOR_LEN,
  ANNEX_START_GAP,
  annexSectorDoorX,
  annexSectorSide,
  annexSquareRoomSlots,
  WORLD_HALF,
} from "./office3d/worldConfig";

export type OfficeFocusCatalogInput = {
  gruposDept: [string, Responsavel[]][];
  committeesAll: OfficeCommitteeSlot[];
  mesaSlots: OfficeMesaSlot[];
  equipeHref: string;
  nomePorResponsavelId: Map<number, string>;
  responsaveis: Responsavel[];
};

const COMMITTEE_LAYOUT: Array<{ pos: readonly [number, number, number]; groupRotY: number }> = [
  { pos: [-3.35, 0, -1.82], groupRotY: 0.22 },
  { pos: [-3.35, 0, 2.05], groupRotY: -0.28 },
  { pos: [3.62, 0, 0.38], groupRotY: Math.PI * 0.92 },
];

function annexSectorFocusWorld(deptIndex: number, totalDepts: number): [number, number, number] {
  const hw = WORLD_HALF;
  const zCenter = hw + ANNEX_START_GAP + ANNEX_CORRIDOR_LEN / 2;
  const { centers } = annexSquareRoomSlots(totalDepts);
  const cz = centers[deptIndex] ?? 0;
  const worldZ = zCenter + cz;
  const doorX = annexSectorDoorX(deptIndex, hw);
  const focusX = doorX + (annexSectorSide(deptIndex) === "east" ? 0.35 : -0.35);
  return [focusX, 0.45, worldZ];
}

/** Pontos de foco na sala principal + salas de setor (comités só nas mesas redondas). */
export function buildFocusCatalog(ctx: OfficeFocusCatalogInput, room: OfficeRoomState): OfficeFocusPanel[] {
  if (room.kind === "sector") {
    const p = buildSectorFocusPanel(ctx, room.deptName, room.people, [0, 0.38, 0]);
    return [{ ...p, navId: `sector-${room.deptName}` }];
  }

  if (room.kind === "corridor") {
    const zCenter = WORLD_HALF + ANNEX_START_GAP + ANNEX_CORRIDOR_LEN / 2;
    const { centers } = annexSquareRoomSlots(ctx.gruposDept.length);
    return ctx.gruposDept.map(([nome, pessoas], i) => {
      const worldZ = zCenter + (centers[i] ?? 0);
      const doorX = annexSectorDoorX(i, WORLD_HALF);
      const focus: [number, number, number] = [
        doorX + (annexSectorSide(i) === "east" ? 0.35 : -0.35),
        0.45,
        worldZ,
      ];
      const panel = buildSectorFocusPanel(ctx, nome, pessoas, focus);
      return { ...panel, navId: `sector-${nome}` };
    });
  }

  const items: OfficeFocusPanel[] = [];
  items.push({
    ...buildGovernanceFocusPanel(ctx.mesaSlots, ctx.equipeHref, [0, 0.38, 0]),
    navId: "governance",
  });

  ctx.committeesAll.slice(0, COMMITTEE_LAYOUT.length).forEach((slot, i) => {
    const layout = COMMITTEE_LAYOUT[i]!;
    const focus: [number, number, number] = [layout.pos[0], 0.35, layout.pos[2]];
    items.push({
      ...buildCommitteeFocusPanel(ctx, slot, focus),
      navId: `committee-${slot.tipo}`,
    });
  });

  ctx.gruposDept.forEach(([nome, pessoas], i) => {
    const focus = annexSectorFocusWorld(i, ctx.gruposDept.length);
    items.push({
      ...buildSectorFocusPanel(ctx, nome, pessoas, focus),
      navId: `sector-${nome}`,
    });
  });

  return items;
}

export function findFocusNavIndex(catalog: OfficeFocusPanel[], navId: string | undefined): number {
  if (!navId) return -1;
  return catalog.findIndex((p) => p.navId === navId);
}
