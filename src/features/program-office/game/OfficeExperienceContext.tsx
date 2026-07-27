"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { OfficeCameraApiRef } from "./officeCameraApi";
import { buildFocusCatalog, findFocusNavIndex } from "./officeFocusCatalog";
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
  siglaMesa: string;
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

export type OfficeFocusPerson = { name: string; detail?: string };

export type OfficeFocusPanel = {
  kind: "committee" | "sector" | "governance";
  /** Id estável para navegação prev/next no painel de foco. */
  navId?: string;
  badge: string;
  title: string;
  subtitle?: string;
  people: OfficeFocusPerson[];
  href?: string;
  hrefLabel?: string;
  enterRoom?: { deptName: string; people: Responsavel[] };
  focus: [number, number, number];
  focusDistance?: number;
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
  focusPanel: OfficeFocusPanel | null;
  canRestoreView: boolean;
  registerCameraApiRef: (ref: OfficeCameraApiRef) => void;
  openFocusPanel: (panel: OfficeFocusPanel, options?: { skipBookmark?: boolean }) => void;
  navigateFocusPanel: (delta: -1 | 1) => void;
  closeFocusPanel: () => void;
  /** Fecha painel sem restaurar câmara (ex.: antes de trocar de sala). */
  closeFocusPanelWithoutRestore: () => void;
  restorePreviousView: () => void;
  openIframe: (href: string, title: string) => void;
  closeModal: () => void;
  enterCorridor: () => void;
  exitCorridorToMain: () => void;
  enterSectorRoom: (deptName: string, people: Responsavel[]) => void;
  backFromSectorToCorridor: () => void;
  /** Volta ao escritório principal (fecha painel / sai de corredor ou setor). */
  goHomeMain: () => void;
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
  const [focusPanel, setFocusPanel] = useState<OfficeFocusPanel | null>(null);
  const [canRestoreView, setCanRestoreView] = useState(false);
  const cameraHolderRef = useRef<OfficeCameraApiRef | null>(null);

  const syncCanRestore = useCallback(() => {
    setCanRestoreView(Boolean(cameraHolderRef.current?.current?.hasBookmark()));
  }, []);

  const registerCameraApiRef = useCallback(
    (ref: OfficeCameraApiRef) => {
      cameraHolderRef.current = ref;
      syncCanRestore();
    },
    [syncCanRestore],
  );

  const restorePreviousView = useCallback(() => {
    const api = cameraHolderRef.current?.current;
    if (api?.restoreBookmark()) {
      syncCanRestore();
    } else {
      setCanRestoreView(false);
    }
  }, [syncCanRestore]);

  const focusCatalogInput = useMemo(
    () => ({
      gruposDept,
      committeesAll,
      mesaSlots,
      equipeHref,
      nomePorResponsavelId,
      responsaveis,
    }),
    [gruposDept, committeesAll, mesaSlots, equipeHref, nomePorResponsavelId, responsaveis],
  );

  const openFocusPanel = useCallback(
    (panel: OfficeFocusPanel, options?: { skipBookmark?: boolean }) => {
      let resolved = panel;
      if (!resolved.navId) {
        const catalog = buildFocusCatalog(focusCatalogInput, room);
        const match =
          catalog.find((c) => c.navId && c.kind === panel.kind && c.title === panel.title) ??
          catalog.find((c) => c.kind === panel.kind && c.subtitle === panel.subtitle);
        if (match?.navId) resolved = { ...panel, navId: match.navId };
      }
      const api = cameraHolderRef.current?.current;
      if (api) {
        if (!options?.skipBookmark) {
          api.bookmarkView();
          syncCanRestore();
        }
        api.smoothFocusOn(resolved.focus, resolved.focusDistance);
      }
      setFocusPanel(resolved);
    },
    [focusCatalogInput, room, syncCanRestore],
  );

  const navigateFocusPanel = useCallback(
    (delta: -1 | 1) => {
      setFocusPanel((current) => {
        if (!current) return current;
        const catalog = buildFocusCatalog(focusCatalogInput, room);
        const idx = findFocusNavIndex(catalog, current.navId);
        if (idx < 0) return current;
        const next = catalog[idx + delta];
        if (!next) return current;
        const api = cameraHolderRef.current?.current;
        if (api) api.smoothFocusOn(next.focus, next.focusDistance);
        return next;
      });
    },
    [focusCatalogInput, room],
  );

  const closeFocusPanel = useCallback(() => {
    restorePreviousView();
    setFocusPanel(null);
  }, [restorePreviousView]);

  const closeFocusPanelWithoutRestore = useCallback(() => {
    setFocusPanel(null);
  }, []);

  const openIframe = useCallback((href: string, title: string) => {
    const api = cameraHolderRef.current?.current;
    if (api && !api.hasBookmark()) {
      api.bookmarkView();
      syncCanRestore();
    }
    setModal({ kind: "iframe", href, title });
  }, [syncCanRestore]);

  const closeModal = useCallback(() => setModal(null), []);

  const enterCorridor = useCallback(() => {
    setFocusPanel(null);
    setRoom({ kind: "corridor" });
  }, []);

  const exitCorridorToMain = useCallback(() => {
    setFocusPanel(null);
    setRoom({ kind: "main" });
  }, []);

  const enterSectorRoom = useCallback((deptName: string, people: Responsavel[]) => {
    setFocusPanel(null);
    setRoom({ kind: "sector", deptName, people });
  }, []);

  const backFromSectorToCorridor = useCallback(() => {
    setFocusPanel(null);
    setRoom({ kind: "corridor" });
  }, []);

  const goHomeMain = useCallback(() => {
    setFocusPanel(null);
    setRoom({ kind: "main" });
  }, []);

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
      focusPanel,
      canRestoreView,
      registerCameraApiRef,
      openFocusPanel,
      navigateFocusPanel,
      closeFocusPanel,
      closeFocusPanelWithoutRestore,
      restorePreviousView,
      openIframe,
      closeModal,
      enterCorridor,
      exitCorridorToMain,
      enterSectorRoom,
      backFromSectorToCorridor,
      goHomeMain,
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
      focusPanel,
      canRestoreView,
      registerCameraApiRef,
      openFocusPanel,
      navigateFocusPanel,
      closeFocusPanel,
      closeFocusPanelWithoutRestore,
      restorePreviousView,
      openIframe,
      closeModal,
      enterCorridor,
      exitCorridorToMain,
      enterSectorRoom,
      backFromSectorToCorridor,
      goHomeMain,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
