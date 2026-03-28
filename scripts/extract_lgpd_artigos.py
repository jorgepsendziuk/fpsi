#!/usr/bin/env python3
"""Extrai artigos da LGPD (HTML compilado Planalto) e a árvore capítulo/seção."""

from __future__ import annotations

import html as html_module
import json
import re
import shutil
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "docs/ppsi/lgpd/lei_13709_2018_planalto_compilado.html"
OUT_PATH = ROOT / "docs/ppsi/lgpd/lgpd_artigos.json"
APP_DATA_PATH = ROOT / "src/data/lgpd_artigos.json"
PUBLIC_DATA_PATH = ROOT / "public/data/lgpd_artigos.json"

ART_START = re.compile(
    r'^["\s\u201c\u201d\u00ab\u00bb]*Art\.\s*((?P<ord>[1-9]\d*)º|(?P<num>[1-9]\d*)\.)\s',
    re.UNICODE,
)
CAP_START = re.compile(r"^[\s\"'\u201c\u201d]*CAPÍTULO\s+([IVXLCDM]+)", re.I)
SEC_START = re.compile(r"^[\s\"'\u201c\u201d]*Seção\s+([IVXLCDM]+)", re.I)
ROMAN_IN_CAP = re.compile(r"CAPÍTULO\s+([IVXLCDM]+)", re.I)
ROMAN_IN_SEC = re.compile(r"Seção\s+([IVXLCDM]+)", re.I)


def _clean_line(s: str) -> str:
    s = html_module.unescape(s)
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\s*\([^)]*(?:Lei nº|Incluído|Redação|Revogado)[^)]*\)\s*", " ", s, flags=re.I)
    return " ".join(s.split()).strip(" -—")


def _merge_subtitle(lines: list[str]) -> str:
    parts: list[str] = []
    for raw in lines:
        t = _clean_line(raw.replace("\n", " "))
        if len(t) < 3:
            continue
        # Só linhas que são só um parêntese editorial (evita falsos positivos)
        if re.fullmatch(r"\([^)]+\)", t.strip()):
            continue
        if t.upper().startswith("VIGÊNCIA"):
            continue
        parts.append(t)
    joined = " ".join(parts)
    return joined[:400] if joined else ""


def roman_slug(r: str) -> str:
    return r.lower().replace(" ", "")


def format_cap_titulo(roman: str, subtitle: str) -> str:
    sub = subtitle.strip()
    if sub:
        return f"Capítulo {roman} — {sub}"
    return f"Capítulo {roman}"


def format_sec_titulo(roman: str, subtitle: str) -> str:
    sub = subtitle.strip()
    if sub:
        return f"Seção {roman} — {sub}"
    return f"Seção {roman}"


def _p_tag_collects_article_body(attrs: list[tuple[str, str | None]]) -> bool:
    """
    Planalto: artigos principais usam class=\"Artigo\"; continuações (Art. 55-A, §, incisos)
    usam \"texto1\", <p align=\"center\" style=\"... justify ... background:white\">, ou
    \"MsoNormal\" com text-indent 1cm + justify (incisos após §4º, ex. art. 11; IV/V do art. 26).
    Parágrafos MsoNormal só com 0cm (assinaturas, nota DOU) ficam de fora.
    """
    a = {k: v or "" for k, v in attrs}
    cls = (a.get("class") or "").strip()
    tokens = cls.split()
    st = (a.get("style") or "").replace(" ", "")

    if "Artigo" in cls:
        return True
    if "texto1" in tokens:
        return True
    if a.get("align") == "center" and "text-align:justify" in st and "background:white" in st:
        return True
    if "MsoNormal" in tokens and "text-align:justify" in st and "text-indent:1cm" in st:
        return True
    return False


class ArtigoParagraphCollector(HTMLParser):
    """Coleta <p> de dispositivos (Artigo + texto1 + blocos center/justify do compilado)."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._in_artigo = False
        self._buf: list[str] = []
        self.blocks: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        a = dict(attrs)
        if tag == "p" and _p_tag_collects_article_body(attrs):
            self._in_artigo = True
            self._buf = []
        elif self._in_artigo and tag == "br":
            self._buf.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag == "p" and self._in_artigo:
            raw = "".join(self._buf)
            text = html_module.unescape(raw)
            text = re.sub(r"[ \t\r\f\v]+", " ", text)
            text = re.sub(r"\n+", "\n", text).strip()
            if text and not re.fullmatch(r"[.\s\u00a0]+", text):
                self.blocks.append(text)
            self._in_artigo = False

    def handle_data(self, data: str) -> None:
        if self._in_artigo:
            self._buf.append(data)


class AllParagraphsParser(HTMLParser):
    """Todos os <p> em ordem de documento (estrutura capítulo/seção)."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._in_p = False
        self._buf: list[str] = []
        self.paragraphs: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag == "p":
            self._in_p = True
            self._buf = []
        elif self._in_p and tag == "br":
            self._buf.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag == "p" and self._in_p:
            raw = "".join(self._buf)
            text = html_module.unescape(raw)
            text = re.sub(r"[ \t\r\f\v]+", " ", text)
            text = re.sub(r"\n+", "\n", text).strip()
            if text and not re.fullmatch(r"[.\s\u00a0]+", text):
                self.paragraphs.append(text)
            self._in_p = False

    def handle_data(self, data: str) -> None:
        if self._in_p:
            self._buf.append(data)


def extract_artigo_65_fallback(html: str) -> str | None:
    marker = "Art. 65."
    i = html.find(marker)
    if i == -1:
        return None
    low = html.lower()
    j = low.find("</body>", i)
    if j == -1:
        j = len(html)
    chunk = html[i:j]
    chunk = re.sub(r"<script[^>]*>.*?</script>", " ", chunk, flags=re.DOTALL | re.I)
    chunk = re.sub(r"<[^>]+>", " ", chunk)
    text = html_module.unescape(chunk)
    text = re.sub(r"\s+", " ", text).strip()
    return text if len(text) > 20 else None


def split_artigos(blocks: list[str]) -> dict[str, str]:
    last_num = 0
    current_n: int | None = None
    chunks: list[str] = []

    def flush() -> None:
        nonlocal current_n, chunks
        if current_n is None or not chunks:
            return
        body = "\n\n".join(chunks)
        body = re.sub(r"\n{3,}", "\n\n", body).strip()
        artigos[str(current_n)] = body
        chunks = []

    artigos: dict[str, str] = {}

    for block in blocks:
        m = ART_START.match(block)
        if m:
            if m.group("ord") is not None:
                n = int(m.group("ord"))
            else:
                n = int(m.group("num"))
            if n > last_num:
                flush()
                last_num = n
                current_n = n
                chunks = [block]
                continue
        if current_n is not None:
            chunks.append(block)

    flush()
    return artigos


def walk_estrutura(paragraphs: list[str]) -> dict[int, dict[str, str | None]]:
    """Mapeia cada artigo principal ao capítulo/seção vigentes no HTML."""
    cap_roman: str | None = None
    cap_sub = ""
    sec_roman: str | None = None
    sec_sub = ""
    last_num = 0
    estrutura: dict[int, dict[str, str | None]] = {}
    i = 0
    n_p = len(paragraphs)

    while i < n_p:
        text = paragraphs[i].strip()
        first_line = text.split("\n")[0].strip()

        if CAP_START.search(text) and not ART_START.match(first_line):
            mc = ROMAN_IN_CAP.search(text)
            if not mc:
                i += 1
                continue
            cap_roman = mc.group(1).upper()
            pos = mc.end()
            tail = text[pos:].strip()
            subs: list[str] = ([tail] if tail else [])
            i += 1
            while i < n_p:
                t2 = paragraphs[i].strip()
                fl = t2.split("\n")[0].strip()
                if ART_START.match(fl):
                    break
                if CAP_START.search(t2):
                    break
                if SEC_START.search(fl):
                    break
                subs.append(t2)
                i += 1
            cap_sub = _merge_subtitle(subs)
            sec_roman = None
            sec_sub = ""
            continue

        if SEC_START.search(text) and not ART_START.match(first_line):
            ms = ROMAN_IN_SEC.search(text)
            if not ms:
                i += 1
                continue
            sec_roman = ms.group(1).upper()
            pos = ms.end()
            tail = text[pos:].strip()
            subs = [tail] if tail else []
            i += 1
            while i < n_p:
                t2 = paragraphs[i].strip()
                fl = t2.split("\n")[0].strip()
                if ART_START.match(fl):
                    break
                if CAP_START.search(t2):
                    i -= 1
                    break
                if SEC_START.search(fl):
                    i -= 1
                    break
                subs.append(t2)
                i += 1
            sec_sub = _merge_subtitle(subs)
            continue

        m = ART_START.match(first_line)
        if m:
            n = int(m.group("ord")) if m.group("ord") is not None else int(m.group("num"))
            if n > last_num:
                estrutura[n] = {
                    "cap_roman": cap_roman,
                    "cap_sub": cap_sub or None,
                    "sec_roman": sec_roman,
                    "sec_sub": sec_sub or None,
                }
                last_num = n
        i += 1

    if 6 in estrutura and 7 in estrutura:
        e6, e7 = estrutura[6], estrutura[7]
        if e6.get("cap_roman") == "I" and e7.get("cap_roman") == "II":
            estrutura[6] = {
                "cap_roman": "II",
                "cap_sub": e7.get("cap_sub"),
                "sec_roman": None,
                "sec_sub": None,
            }

    # Planalto coloca o art. 13 antes do título "Seção III" no HTML; juridicamente é a mesma seção do 14.
    if 13 in estrutura and 14 in estrutura:
        e13, e14 = estrutura[13], estrutura[14]
        if e13.get("sec_roman") == "II" and e14.get("sec_roman") == "III":
            estrutura[13] = {
                **e13,
                "sec_roman": e14.get("sec_roman"),
                "sec_sub": e14.get("sec_sub"),
            }

    return estrutura


def build_arvore(artigo_nums: list[int], estrutura: dict[int, dict[str, str | None]]) -> list[dict]:
    """Monta nós aninhados compatíveis com LgpdOutlineEntry no frontend."""
    nums = sorted(a for a in artigo_nums if a in estrutura)
    if not nums:
        return []

    groups: list[list[int]] = []
    for n in nums:
        e = estrutura[n]
        key = (e.get("cap_roman"), e.get("sec_roman"))
        if not groups:
            groups.append([n])
            continue
        prev_e = estrutura[groups[-1][0]]
        prev_key = (prev_e.get("cap_roman"), prev_e.get("sec_roman"))
        if key == prev_key:
            groups[-1].append(n)
        else:
            groups.append([n])

    arvore: list[dict] = []
    gi = 0
    cap_seq = 0
    while gi < len(groups):
        g = groups[gi]
        e0 = estrutura[g[0]]
        cap_r = e0.get("cap_roman") or "?"
        cap_groups: list[list[int]] = [g]
        gi += 1
        while gi < len(groups):
            e_next = estrutura[groups[gi][0]]
            if e_next.get("cap_roman") != cap_r:
                break
            cap_groups.append(groups[gi])
            gi += 1

        cap_seq += 1
        cap_id = f"cap-{roman_slug(str(cap_r))}-{cap_seq}"
        cap_titulo = format_cap_titulo(str(cap_r), str(e0.get("cap_sub") or ""))

        if len(cap_groups) == 1 and estrutura[cap_groups[0][0]].get("sec_roman") is None:
            arvore.append({"id": cap_id, "titulo": cap_titulo, "artigos": cap_groups[0]})
        else:
            filhos: list[dict] = []
            for j, cg in enumerate(cap_groups):
                ee = estrutura[cg[0]]
                sec_r = ee.get("sec_roman")
                if sec_r is None and len(cg) == 1 and cg[0] == 6:
                    titulo = "Art. 6º — Princípios"
                elif sec_r is None:
                    titulo = cap_titulo
                else:
                    titulo = format_sec_titulo(str(sec_r), str(ee.get("sec_sub") or ""))
                cid = f"{cap_id}-n{cg[0]}-j{j}"
                filhos.append({"id": cid, "titulo": titulo, "artigos": cg})
            arvore.append({"id": cap_id, "titulo": cap_titulo, "filhos": filhos})

    return arvore


def main() -> None:
    if not HTML_PATH.is_file():
        raise SystemExit(f"Arquivo não encontrado: {HTML_PATH}")

    raw = HTML_PATH.read_bytes()
    try:
        html_text = raw.decode("utf-8")
    except UnicodeDecodeError:
        html_text = raw.decode("iso-8859-1")

    parser = ArtigoParagraphCollector()
    parser.feed(html_text)
    parser.close()

    artigos = split_artigos(parser.blocks)

    if "65" not in artigos:
        tail = extract_artigo_65_fallback(html_text)
        if tail:
            artigos["65"] = tail

    struct_parser = AllParagraphsParser()
    struct_parser.feed(html_text)
    struct_parser.close()

    estrutura = walk_estrutura(struct_parser.paragraphs)
    art_ints = sorted(int(k) for k in artigos)

    for n in art_ints:
        if n not in estrutura and n > 1:
            estrutura[n] = {**estrutura[n - 1]}
        elif n not in estrutura:
            estrutura[n] = {
                "cap_roman": None,
                "cap_sub": None,
                "sec_roman": None,
                "sec_sub": None,
            }

    arvore = build_arvore(art_ints, estrutura)

    payload = {
        "meta": {
            "instrumento_id": "lei_13709_2018",
            "fonte_arquivo": "docs/ppsi/lgpd/lei_13709_2018_planalto_compilado.html",
            "fonte_url": (
                "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/"
                "2018/lei/L13709compilado.htm"
            ),
            "total_artigos": len(artigos),
            "gerador": "scripts/extract_lgpd_artigos.py",
            "arvore_gerada": True,
        },
        "artigos": artigos,
        "arvore": arvore,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    out_txt = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    OUT_PATH.write_text(out_txt, encoding="utf-8")
    APP_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(OUT_PATH, APP_DATA_PATH)
    PUBLIC_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(OUT_PATH, PUBLIC_DATA_PATH)
    print(
        f"Escrito {OUT_PATH}, {APP_DATA_PATH} e {PUBLIC_DATA_PATH} "
        f"({len(artigos)} artigos, {len(arvore)} capítulos na árvore)"
    )


if __name__ == "__main__":
    main()
