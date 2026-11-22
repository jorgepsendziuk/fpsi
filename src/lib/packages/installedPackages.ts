import fpsiPackagesConfig from "../../../config/fpsi-packages.json";

export type FpsiPackageId = "publico" | "ppsi-2.0" | "governanca-ia" | "framework";

export type FpsiPackagesFile = {
  v: number;
  packages: Record<FpsiPackageId, boolean>;
  updatedAt: string | null;
};

const DEFAULT_PACKAGES: Record<FpsiPackageId, boolean> = {
  publico: true,
  "ppsi-2.0": true,
  "governanca-ia": true,
  framework: true,
};

/** Rotas do pacote publico (site institucional). */
export const PUBLICO_ROUTE_EXACT = new Set([
  "/",
  "/sobre",
  "/artigo",
  "/gestao",
  "/privacidade",
  "/offline",
]);

export const PUBLICO_ROUTE_PREFIXES = ["/divulgacao", "/linkedin"] as const;

export function readPackagesConfig(): FpsiPackagesFile {
  const raw = fpsiPackagesConfig as FpsiPackagesFile;
  return {
    v: raw.v ?? 1,
    packages: { ...DEFAULT_PACKAGES, ...(raw.packages ?? {}) },
    updatedAt: raw.updatedAt ?? null,
  };
}

export function isPackageEnabled(id: FpsiPackageId): boolean {
  return readPackagesConfig().packages[id] !== false;
}

export function isPublicoEnabled(): boolean {
  return isPackageEnabled("publico");
}

export function isPublicoMarketingPath(pathname: string): boolean {
  if (PUBLICO_ROUTE_EXACT.has(pathname)) return true;
  return PUBLICO_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}