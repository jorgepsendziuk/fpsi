import type { LgpdOutlineEntry } from "@/lib/normas/lgpdOutline";

/** Payload de `lgpd_artigos.json` (docs + `public/data` + `src/data`). */
export type LgpdArtigosPayload = {
  meta: {
    instrumento_id: string;
    fonte_url: string;
    total_artigos: number;
    arvore_gerada?: boolean;
  };
  artigos: Record<string, string>;
  arvore?: LgpdOutlineEntry[];
};
