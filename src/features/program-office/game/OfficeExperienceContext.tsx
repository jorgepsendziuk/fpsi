"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Programa, Responsavel } from "@/lib/types/types";
import type { GovernancaGruposMembros, ModulosResumoApi } from "@/lib/services/dataService";

export type OfficeRoomState =
  | { kind: "main" }
  | { kind: "corridor" }
  | { kind: "sector"; deptName: string; people: Responsavel[] };

export type OfficePersonSheetPayload = {
  title: string;
  subtitle?: string;
  rows: { label: string; value: string }[];
};

export type OfficeModalState = null | { kind: "iframe"; href: string; title: string };

export type OfficeBoardPoster = {
  key: string;
  title: string;
  line: string;
  href: string;
};

export type OfficeMesaSlot = {
  campo: string;
  rotulo: string;
  chefe: boolean;
  label: string;
  empty: boolean;
  responsavelId: number | null;
  /** Cargo e departamento do responsável (quando houver cadastro). */
  cargoSetorLine: string;
};

export type OfficeChip = {
  key: string;
  label: string;
  detail: string;
  href: string;
};

export type OfficeCommitteeSlot = {
  tipo: string;
  title: string;
  subtitle: string;
  href: string;
  count: number;
  memberIds: number[];
};

export type OfficeExperienceValue = {
  idOrSlug: string;
  base: string;
  equipeHref: string;
  programa: Programa;
  nomePorResponsavelId: Map<number, string>;
  responsaveis: Responsavel[];
  membros: GovernancaGruposMembros;
  resumo: ModulosResumoApi | null;
  resumoLoading: boolean;
  gruposDept: [string, Responsavel[]][];
  boardPosters: OfficeBoardPoster[];
  mesaSlots: OfficeMesaSlot[];
  chips: OfficeChip[];
  committeesAll: OfficeCommitteeSlot[];
  room: OfficeRoomState;
  modal: OfficeModalState;
  openIframe: (href: string, title: string) => void;
  closeModal: () => void;
  enterCorridor: () => void;
  exitCorridorToMain: () => void;
  enterSectorRoom: (deptName: string, people: Responsavel[]) => void;
  backFromSectorToCorridor: () => void;
};

const Ctx = createContext<OfficeExperienceValue | null>(null);

export function useOfficeExperience(): OfficeExperienceValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOfficeExperience outside OfficeExperienceProvider");
  return v;
}

type ProviderProps = {
  children: ReactNode;
  idOrSlug: string;
  base: string;
  equipeHref: string;
  programa: Programa;
  nomePorResponsavelId: Map<number, string>;
  responsaveis: Responsavel[];
  membros: GovernancaGruposMembros;
  resumo: ModulosResumoApi | null;
  resumoLoading: boolean;
  gruposDept: [string, Responsavel[]][];
  boardPosters: OfficeBoardPoster[];
  mesaSlots: OfficeMesaSlot[];
  chips: OfficeChip[];
  committeesAll: OfficeCommitteeSlot[];
};

export function OfficeExperienceProvider({
  children,
  idOrSlug,
  base,
  equipeHref,
  programa,
  nomePorResponsavelId,
  responsaveis,
  membros,
  resumo,
  resumoLoading,
  gruposDept,
  boardPosters,
  mesaSlots,
  chips,
  committeesAll,
}: ProviderProps) {
  const [room, setRoom] = useState<OfficeRoomState>({ kind: "main" });
  const [modal, setModal] = useState<OfficeModalState>(null);

  const openIframe = useCallback((href: string, title: string) => {
    setModal({ kind: "iframe", href, title });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const enterCorridor = useCallback(() => setRoom({ kind: "corridor" }), []);

  const exitCorridorToMain = useCallback(() => setRoom({ kind: "main" }), []);

  const enterSectorRoom = useCallback((deptName: string, people: Responsavel[]) => {
    setRoom({ kind: "sector", deptName, people });
  }, []);

  const backFromSectorToCorridor = useCallback(() => setRoom({ kind: "corridor" }), []);

  const value = useMemo<OfficeExperienceValue>(
    () => ({
      idOrSlug,
      base,
      equipeHref,
      programa,
      nomePorResponsavelId,
      responsaveis,
      membros,
      resumo,
      resumoLoading,
      gruposDept,
      boardPosters,
      mesaSlots,
      chips,
      committeesAll,
      room,
      modal,
      openIframe,
      closeModal,
      enterCorridor,
      exitCorridorToMain,
      enterSectorRoom,
      backFromSectorToCorridor,
    }),
    [
      idOrSlug,
      base,
      equipeHref,
      programa,
      nomePorResponsavelId,
      responsaveis,
      membros,
      resumo,
      resumoLoading,
      gruposDept,
      boardPosters,
      mesaSlots,
      chips,
      committeesAll,
      room,
      modal,
      openIframe,
      closeModal,
      enterCorridor,
      exitCorridorToMain,
      enterSectorRoom,
      backFromSectorToCorridor,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
