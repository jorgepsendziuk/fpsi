#!/usr/bin/env python3
"""Extrai catálogo de controles e medidas do texto do Guia PPSI 2.0."""
import json
import re
from pathlib import Path

GUIA = Path(__file__).resolve().parents[1] / (
    "docs/ppsi/Guia do Framework de Privaci.mddade e Segurança da Informação "
    "Programa de Privacidade e Segurança da Informação PPSI 2.0"
)

# Sumário usa linhas de pontos; corpo dos capítulos (a partir ~linha 350) não.
def is_toc_controle_line(line: str) -> bool:
    return bool(re.search(r"\.{4,}", line))


def strip_page_noise(lines):
    out = []
    for ln in lines:
        t = ln.strip()
        if re.fullmatch(r"\d{1,3}", t):
            continue
        if "Guia do Framework de Privacidade" in ln and "(PPSI 2.0)" in ln:
            continue
        out.append(ln)
    return out


def parse():
    raw_lines = GUIA.read_text(encoding="utf-8").splitlines()

    # Índices de início de cada seção de controle no corpo do guia (não sumário)
    ctrl_head = re.compile(
        r"^(?P<cap>4\.1|4\.2|5\.\d+|6\.\d+) CONTROLE (?P<num>\d+):\s*(?P<tit>.*)$"
    )
    boundaries = []
    for i, line in enumerate(raw_lines):
        if i < 340:
            continue
        if is_toc_controle_line(line):
            continue
        m = ctrl_head.match(line.strip())
        if m:
            boundaries.append((i, m.group("cap"), int(m.group("num")), m.group("tit").strip()))

    controles = []
    medidas = []

    for bi, (start, cap, num, titulo) in enumerate(boundaries):
        end = boundaries[bi + 1][0] if bi + 1 < len(boundaries) else len(raw_lines)
        chunk = raw_lines[start:end]

        # Título pode continuar na linha seguinte (ex.: controle 4)
        if len(chunk) > 1:
            L1 = chunk[1].strip()
            if L1 and not L1.startswith("Visão geral") and ctrl_head.match(L1) is None:
                if not re.match(r"^\d+\.\d+", L1) and "CONTROLE" not in L1:
                    titulo = f"{titulo} {L1}".strip()
                    chunk = [chunk[0]] + chunk[2:]

        parte = None
        if num == 0:
            parte = "estruturacao" if cap == "4.1" else "instrumentos"
        seg = "base" if num == 0 else ("privacidade" if num >= 19 else "seguranca_informacao")

        cobj = {
            "ordem_no_guia": len(controles) + 1,
            "controle_numero": num,
            "parte_segmento_base": parte,
            "titulo": titulo,
            "segmento": seg,
            "visao_geral": "",
            "por_que_controle_critico": "",
            "procedimentos_e_ferramentas": "",
        }

        # Parse seções até Lista de medidas
        mode = "none"
        buf = []
        mi0 = None
        for i, line in enumerate(chunk):
            s = line.strip()
            if s == "Visão geral":
                mode = "vg"
                buf = []
                continue
            if s.startswith("Por que ") and "controle é crítico" in s:
                if mode == "vg":
                    cobj["visao_geral"] = "\n".join(strip_page_noise(buf)).strip()
                mode = "crit"
                buf = []
                continue
            if s == "Procedimentos e ferramentas":
                if mode == "crit":
                    cobj["por_que_controle_critico"] = "\n".join(strip_page_noise(buf)).strip()
                mode = "proc"
                buf = []
                continue
            if s.startswith("Lista de medidas"):
                if mode == "proc":
                    cobj["procedimentos_e_ferramentas"] = "\n".join(
                        strip_page_noise(buf)
                    ).strip()
                mode = "med"
                mi0 = i + 1
                break
            if mode in ("vg", "crit", "proc"):
                buf.append(line)

        if mode == "proc" and mi0 is None:
            cobj["procedimentos_e_ferramentas"] = "\n".join(strip_page_noise(buf)).strip()

        # Medidas: resto do chunk
        if mi0 is not None:
            mchunk = chunk[mi0:]
            # remover cabeçalho da tabela
            while mchunk and (
                "ID Título" in mchunk[0]
                or mchunk[0].strip() in ("ID", "GI")
                or (mchunk[0].strip() == "" and len(mchunk) > 1)
            ):
                if "ID Título" in mchunk[0] or mchunk[0].strip() == "ID":
                    mchunk = mchunk[1:]
                    continue
                if mchunk[0].strip() == "":
                    mchunk = mchunk[1:]
                    continue
                break

            blocks = []
            cur = []
            for line in mchunk:
                t = line.strip()
                # Evita tratar "19.1 a 19.4 e estabeleça..." como novo ID
                if re.match(r"^\d+\.\d+\s+a\s+\d", t):
                    if cur:
                        cur.append(line)
                    continue
                # Novo ID: "1.2 texto...", "0.1" sozinho
                if re.match(r"^\d+\.\d+(\s+.*)?$", t) and (
                    re.match(r"^\d+\.\d+\s+\S", t) or re.fullmatch(r"\d+\.\d+", t)
                ):
                    if cur:
                        blocks.append(cur)
                    cur = [line]
                else:
                    if cur:
                        cur.append(line)
            if cur:
                blocks.append(cur)

            for block in blocks:
                text = "\n".join(block)
                # id
                m = re.match(r"^(\d+\.\d+)\s+(.*)$", text.strip(), re.DOTALL)
                if not m:
                    continue
                mid = m.group(1)
                major = int(mid.split(".")[0])
                rest = m.group(2)

                # Separar GI ao final da pergunta (linha)
                gi = None
                lines_b = [ln.rstrip() for ln in rest.splitlines() if ln.strip() or ln == "\n"]
                # normalizar: última linha só GI
                if len(lines_b) >= 1 and lines_b[-1].strip() in ("GI1", "GI2", "GI3"):
                    gi = lines_b[-1].strip()
                    lines_b = lines_b[:-1]

                normas = ""
                desc = ""

                # re-parse body line by line
                pergunta_parts = []
                desc_parts = []
                state = "pergunta"
                for ln in lines_b:
                    st = ln.strip()
                    if st.startswith("Normas de referência:"):
                        state = "normas"
                        normas = st
                        continue
                    if state == "pergunta":
                        pergunta_parts.append(st)
                        if "?" in st:
                            state = "desc"
                    elif state == "desc":
                        desc_parts.append(st)
                    elif state == "normas":
                        normas += " " + st

                pergunta = " ".join(pergunta_parts)
                pergunta = re.sub(r"\s+", " ", pergunta).strip()
                # remove trailing GI se colado
                for g in ("GI1", "GI2", "GI3"):
                    if pergunta.endswith(g):
                        pergunta = pergunta[: -len(g)].strip()
                        gi = g

                desc = "\n".join(desc_parts).strip()
                normas = re.sub(r"\s+", " ", normas).strip() if normas else ""
                # Remove lixo de rodapé de página colado após o texto de normas
                if normas:
                    normas = re.split(r"\s+\d{1,3}\s+Guia do Framework", normas)[0].strip()
                    # Notas de rodapé explicativas do guia (parágrafo "* A IN GSI...")
                    normas = re.split(
                        r"\s+\*\s+A\s+IN GSI/PR", normas, maxsplit=1
                    )[0].strip()

                medidas.append(
                    {
                        "id_medida": mid,
                        "controle_numero": major,
                        "pergunta": pergunta,
                        "descricao": desc,
                        "normas_referencia": normas,
                        "grupo_imple": gi if seg == "seguranca_informacao" else None,
                        "id_cisv8": None,
                    }
                )

        for k in ("visao_geral", "por_que_controle_critico", "procedimentos_e_ferramentas"):
            if not cobj.get(k):
                cobj[k] = {"ausente_no_guia": True}
        controles.append(cobj)

    return {
        "meta": {
            "fonte": "Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)",
            "versao_documento_capa": "1.2",
            "data_documento_capa": "30 de janeiro de 2026",
        },
        "controles": controles,
        "medidas": medidas,
    }


if __name__ == "__main__":
    data = parse()
    print(json.dumps(data, ensure_ascii=False, indent=2))
