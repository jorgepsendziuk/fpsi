/** Limites e helpers para anexos de evidência (sem vídeo; imagens ~A4). */

export const EVIDENCIA_MAX_BYTES = 5 * 1024 * 1024; // 5MB após processamento
export const EVIDENCIA_MAX_INPUT_BYTES = 12 * 1024 * 1024; // 12MB bruto
/** A4 @ ~150 dpi */
export const EVIDENCIA_A4_WIDTH = 1240;
export const EVIDENCIA_A4_HEIGHT = 1754;
export const EVIDENCIA_JPEG_QUALITY = 82;

export const EVIDENCIA_ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
]);

export const EVIDENCIA_BLOCKED_MIME_PREFIXES = ["video/", "audio/"];

export type EvidenciaCategoria =
  | "pdf"
  | "imagem"
  | "planilha"
  | "link"
  | "contrato"
  | "politica"
  | "certificado"
  | "ata"
  | "print"
  | "outro";

export type EvidenciaAlvoTipo =
  | "medida"
  | "programa_medida"
  | "controle"
  | "risco"
  | "politica"
  | "sistema_ia"
  | "plano_acao"
  | "incidente"
  | "ripd"
  | "outro";

export type EvidenciaRow = {
  id: number;
  programa_id: number;
  titulo: string;
  descricao: string;
  categoria: EvidenciaCategoria;
  mime_type: string;
  tamanho_bytes: number;
  nome_arquivo: string | null;
  url_externa: string | null;
  sha256: string | null;
  validade: string | null;
  versao: string;
  status: string;
  created_at: string;
  /** Omitido em listagens leves */
  conteudo_base64?: string | null;
};

export function categoriaFromMime(mime: string): EvidenciaCategoria {
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "imagem";
  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    mime === "text/csv"
  ) {
    return "planilha";
  }
  return "outro";
}

export function assertEvidenciaMimeAllowed(mime: string): void {
  if (EVIDENCIA_BLOCKED_MIME_PREFIXES.some((p) => mime.startsWith(p))) {
    throw new Error("Vídeos e áudios não são permitidos como evidência. Use PDF, imagem ou planilha.");
  }
  if (!EVIDENCIA_ALLOWED_MIME.has(mime) && !mime.startsWith("image/")) {
    throw new Error(`Tipo não permitido: ${mime}. Use PDF, imagem (JPG/PNG/WebP) ou planilha.`);
  }
}

export async function sha256Hex(buffer: Buffer): Promise<string> {
  const { createHash } = await import("crypto");
  return createHash("sha256").update(buffer).digest("hex");
}
