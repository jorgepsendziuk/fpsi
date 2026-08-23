const MIME_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-excel": "xls",
  "text/csv": "csv",
};

/** Nome de download a partir do título humano — não usa o nome cru do arquivo. */
export function nomeDownloadEvidencia(
  titulo: string,
  mime?: string | null,
  nomeArquivo?: string | null
): string {
  const extFromName = String(nomeArquivo || "")
    .match(/\.([a-zA-Z0-9]{2,5})$/)?.[1]
    ?.toLowerCase();
  const ext = MIME_EXT[String(mime || "").toLowerCase()] || extFromName || "bin";
  const base =
    titulo
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "evidencia";
  return `${base}.${ext}`;
}

export function formatarTamanhoBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
