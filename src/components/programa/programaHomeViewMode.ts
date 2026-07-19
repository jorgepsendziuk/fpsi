"use client";

const STORAGE_KEY = "fpsi_programa_home_view";

export type ProgramaHomeViewMode = "dashboard" | "modulos";

export function getProgramaHomeViewMode(): ProgramaHomeViewMode {
  if (typeof window === "undefined") return "dashboard";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "modulos" ? "modulos" : "dashboard";
}

export function setProgramaHomeViewMode(mode: ProgramaHomeViewMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, mode);
}
