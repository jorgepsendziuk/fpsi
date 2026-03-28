#!/usr/bin/env python3
"""Gera migration SQL (controle + medida) e controles.json a partir de catalogo_ppsi_2_0_guia.json."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "docs/ppsi/catalogo_ppsi_2_0_guia.json"
CONTROLES_OUT = ROOT / "src/lib/services/controles.json"
MEDIDAS_META_OUT = ROOT / "src/lib/services/medidas.json"
MIGRATION_OUT = ROOT / "supabase/migrations/20260327120000_ppsi20_catalogo_controles_medidas.sql"

SEGMENTO_DIAGNOSTICO = {
    "base": 1,
    "seguranca_informacao": 2,
    "privacidade": 3,
}


def sql_literal(s: str | None) -> str:
    if s is None:
        return "NULL"
    return "'" + s.replace("'", "''") + "'"


def norm_grupo(g: str | None) -> str | None:
    if not g:
        return None
    u = g.strip().upper()
    if u.startswith("GI") and len(u) >= 3 and u[2:].isdigit():
        return "G" + u[2:]
    return g.strip() or None


def resolve_id_controle(controle_numero: int, id_medida: str) -> int:
    """ordem_no_guia 1–27: id = ordem; medidas do controle 0 repartem entre id 1 e 2."""
    if controle_numero == 0:
        parts = id_medida.split(".")
        minor = int(parts[1]) if len(parts) >= 2 else 0
        return 1 if minor <= 8 else 2
    if 1 <= controle_numero <= 25:
        return controle_numero + 2
    raise ValueError(f"controle_numero inesperado: {controle_numero}")


def privacy_aplicabilidade(ctrl: dict) -> str:
    seg = ctrl.get("segmento")
    if seg == "privacidade":
        return (ctrl.get("visao_geral") or "").strip()
    return ""


def main() -> None:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    controles = data["controles"]
    medidas = data["medidas"]

    # --- controles.json ---
    out_controles = []
    for c in controles:
        oid = c["ordem_no_guia"]
        out_controles.append(
            {
                "id": oid,
                "nome": c["titulo"],
                "texto": (c.get("visao_geral") or "").strip(),
                "por_que_implementar": (c.get("por_que_controle_critico") or "").strip(),
                "procedimentos_e_ferramentas": (c.get("procedimentos_e_ferramentas") or "").strip(),
                "fique_atento": None,
                "aplicabilidade_privacidade": privacy_aplicabilidade(c) or "",
            }
        )

    CONTROLES_OUT.write_text(
        json.dumps({"controles": out_controles}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    MEDIDAS_META_OUT.write_text(
        json.dumps(
            {
                "total_medidas_catalogo_ppsi_20": len(medidas),
                "nota": "A listagem completa das medidas está na tabela public.medida (Supabase); este ficheiro mantém apenas o total para a landing.",
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    # --- SQL ---
    lines: list[str] = [
        "-- PPSI 2.0: substitui catálogo legado por conteúdo de docs/ppsi/catalogo_ppsi_2_0_guia.json",
        "-- (27 controles, 210 medidas). IDs explícitos 1–27 e 1–210.",
        "-- Apaga respostas de programa (programa_medida / programa_controle) antes do catálogo.",
        "",
        "DELETE FROM public.programa_medida;",
        "DELETE FROM public.programa_controle;",
        "DELETE FROM public.medida;",
        "DELETE FROM public.controle;",
        "",
        "INSERT INTO public.controle (id, numero, diagnostico, nome) VALUES",
    ]

    cv_rows = []
    for c in controles:
        oid = c["ordem_no_guia"]
        diag = SEGMENTO_DIAGNOSTICO[c["segmento"]]
        nome = c["titulo"]
        num = c["controle_numero"]
        cv_rows.append(
            f"  ({oid}, {num}, {diag}, {sql_literal(nome)})"
        )
    lines.append(",\n".join(cv_rows) + ";")
    lines.append("")

    lines.append("INSERT INTO public.medida (id, id_medida, id_controle, id_cisv8, grupo_imple, funcao_nist_csf, medida, descricao) VALUES")

    mv_rows = []
    for i, m in enumerate(medidas, start=1):
        id_c = resolve_id_controle(m["controle_numero"], m["id_medida"])
        g = norm_grupo(m.get("grupo_imple"))
        pergunta = m.get("pergunta") or ""
        desc = (m.get("descricao") or "").strip()
        norm = m.get("normas_referencia")
        if norm:
            desc = f"{desc}\n\n{norm}".strip() if desc else str(norm)
        mv_rows.append(
            "  ("
            f"{i}, {sql_literal(m['id_medida'])}, {id_c}, NULL, "
            f"{sql_literal(g) if g else 'NULL'}, NULL, "
            f"{sql_literal(pergunta)}, {sql_literal(desc)}"
            ")"
        )

    lines.append(",\n".join(mv_rows) + ";")
    lines.append("")
    lines.append("SELECT setval(pg_get_serial_sequence('public.controle', 'id'), (SELECT COALESCE(MAX(id), 1) FROM public.controle));")
    lines.append("SELECT setval(pg_get_serial_sequence('public.medida', 'id'), (SELECT COALESCE(MAX(id), 1) FROM public.medida));")

    MIGRATION_OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Wrote {CONTROLES_OUT.relative_to(ROOT)} ({len(out_controles)} controles)")
    print(f"Wrote {MEDIDAS_META_OUT.relative_to(ROOT)} (total {len(medidas)})")
    print(f"Wrote {MIGRATION_OUT.relative_to(ROOT)} ({len(medidas)} medidas)")


if __name__ == "__main__":
    main()
