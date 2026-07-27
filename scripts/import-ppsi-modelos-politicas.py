#!/usr/bin/env python3
"""
Importa modelos oficiais PPSI (DOCX) para JSON + migration SQL de politica_modelo.
Também gera o Termo de Uso a partir do template oficial.
"""
from __future__ import annotations

import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC_DIR = ROOT / "docs/ppsi/ppsi docs/modelo/doc"
TEMPLATE_TERMO = ROOT / "docs/ppsi/ppsi docs/template/template_termo_uso_politica_privacidade (1).docx"
OUT_MODELS = ROOT / "public/models"
OUT_SQL = ROOT / "supabase/migrations/20260719200000_politicas_import_ppsi_oficial_termo.sql"

MAP = {
    "politica_protecao_dados_pessoais": "modelo_ppdp.docx",
    "politica_backup": "modelo_politica_backup.docx",
    "politica_controle_acesso": "modelo_politica_controle_acesso.docx",
    "politica_defesas_malware": "modelo_politica_defesas_malware.docx",
    "politica_desenvolvimento_pessoas": "modelo_politica_desenvolvimento_pessoas.docx",
    "politica_gerenciamento_vulnerabilidades": "modelo_politica_gerenciamento_vulnerabilidades.docx",
    "politica_gestao_ativos": "modelo_politica_gestao_ativos.docx",
    "politica_logs_auditoria": "modelo_politica_logs_auditoria.docx",
    "politica_provedor_servicos": "modelo_politica_provedor_servicos.docx",
    "politica_seguranca_informacao": "modelo_politica_seguranca_informacao.docx",
}

META = {
    "politica_protecao_dados_pessoais": (
        "Política de Proteção de Dados Pessoais",
        "Diretrizes para proteção de dados pessoais conforme LGPD (modelo PPSI)",
        "#2196F3",
        0,
    ),
    "politica_backup": (
        "Política de Backup",
        "Procedimentos para backup e recuperação de dados (modelo PPSI)",
        "#4CAF50",
        1,
    ),
    "politica_controle_acesso": (
        "Política de Controle de Acesso",
        "Gestão de credenciais e privilégios de acesso (modelo PPSI)",
        "#FF9800",
        2,
    ),
    "politica_defesas_malware": (
        "Política de Defesas contra Malware",
        "Proteção contra softwares maliciosos (modelo PPSI)",
        "#F44336",
        3,
    ),
    "politica_desenvolvimento_pessoas": (
        "Política de Desenvolvimento de Pessoas",
        "Treinamento e conscientização em privacidade e SI (modelo PPSI)",
        "#9C27B0",
        4,
    ),
    "politica_gerenciamento_vulnerabilidades": (
        "Política de Gerenciamento de Vulnerabilidades",
        "Identificação e correção de vulnerabilidades (modelo PPSI)",
        "#E91E63",
        5,
    ),
    "politica_gestao_ativos": (
        "Política de Gestão de Ativos",
        "Inventário e gestão de ativos de TI (modelo PPSI)",
        "#607D8B",
        6,
    ),
    "politica_logs_auditoria": (
        "Política de Logs e Auditoria",
        "Registros de eventos e trilhas de auditoria (modelo PPSI)",
        "#795548",
        7,
    ),
    "politica_provedor_servicos": (
        "Política de Provedor de Serviços",
        "Gestão de fornecedores e prestadores de serviços (modelo PPSI)",
        "#00BCD4",
        8,
    ),
    "politica_seguranca_informacao": (
        "Política de Segurança da Informação",
        "Diretrizes gerais de segurança da informação — POSIN (modelo PPSI)",
        "#3F51B5",
        9,
    ),
}


def docx_paragraphs(path: Path) -> list[str]:
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml").decode("utf-8", errors="ignore")
    text = re.sub(r"</w:p>", "\n", xml)
    text = re.sub(r"<w:tab[^/]*/>", "\t", text)
    text = re.sub(r"<[^>]+>", "", text)
    for a, b in [
        ("&amp;", "&"),
        ("&lt;", "<"),
        ("&gt;", ">"),
        ("&quot;", '"'),
        ("&#39;", "'"),
        ("\xa0", " "),
    ]:
        text = text.replace(a, b)
    paras = []
    for raw in text.splitlines():
        line = re.sub(r"\s+", " ", raw).strip()
        if not line:
            continue
        # TOC / field noise
        if "PAGEREF" in line or "_Toc" in line or "\\h" in line:
            continue
        if re.match(r"(?i)^página\s+\d+", line):
            continue
        paras.append(line)
    return paras


SECTION_START = re.compile(
    r"(?i)^("
    r"prop[oó]sito(?:\s*\[.*?\])?(?:\s+conforme.*)?"
    r"|escopo(?:\s*\[.*?\])?(?:\s+conforme.*)?"
    r"|termos e defini[cç][oõ]es(?:\s*\[.*?\])?(?:\s+conforme.*)?"
    r"|declara[cç][oõ]es da pol[ií]tica(?:\s*\[.*?\])?"
    r"|princ[ií]pios fundamentais"
    r"|cap[ií]tulo\s+[ivxlcd\d]+(?:\s*[-–—:].*)?"
    r"|disposi[cç][oõ]es finais"
    r"|aceita[cç][aã]o do termo de uso"
    r"|defini[cç][oõ]es do termo de uso"
    r"|arcabou[cç]o legal"
    r"|descri[cç][aã]o do servi[cç]o"
    r"|direitos e responsabilidades"
    r"|pol[ií]tica de privacidade"
    r"|informa[cç][oõ]es coletadas"
    r"|finalidade da coleta"
    r"|compartilhamento"
    r"|seguran[cç]a das informa[cç][oõ]es"
    r"|direitos do titular"
    r"|contato"
    r")\s*$"
)

SKIP_UNTIL = re.compile(r"(?i)^prop[oó]sito")


def normalize_heading(line: str) -> tuple[str, str]:
    """Retorna (secao, titulo)."""
    clean = re.sub(r"\s*conforme\s+IN.*$", "", line, flags=re.I).strip()
    clean = re.sub(r"\s*\[.*?\]\s*", " ", clean)
    clean = re.sub(r"\s+", " ", clean).strip(" -–—:")
    # "Propósito Objetivo da Política" às vezes vem em linhas separadas
    m = re.match(r"(?i)^(prop[oó]sito)\b(.*)$", clean)
    if m:
        rest = m.group(2).strip(" -–—:")
        return "Propósito", rest or "Objetivo da Política"
    m = re.match(r"(?i)^(escopo)\b(.*)$", clean)
    if m:
        rest = m.group(2).strip(" -–—:")
        return "Escopo", rest or "Amplitude e alcance da Política"
    m = re.match(r"(?i)^(termos e defini[cç][oõ]es)\b(.*)$", clean)
    if m:
        return "Termos e definições", "Glossário"
    m = re.match(r"(?i)^(declara[cç][oõ]es da pol[ií]tica)\b(.*)$", clean)
    if m:
        return "Declarações da política", "Regras aplicáveis ao caso específico"
    m = re.match(r"(?i)^(cap[ií]tulo\s+[ivxlcd\d]+)\s*[-–—:]?\s*(.*)$", clean)
    if m:
        num = m.group(1).upper().replace("CAPÍTULO", "CAPÍTULO").replace("CAPITULO", "CAPÍTULO")
        if not num.startswith("CAPÍTULO"):
            num = "CAPÍTULO " + num.split()[-1]
        # normalize CAPÍTULO spelling
        num = re.sub(r"(?i)^cap[ií]tulo", "CAPÍTULO", num)
        title = m.group(2).strip() or num
        return f"{num}" + (f" - {title}" if title and title.upper() != num.upper() and not title.upper().startswith("CAPÍTULO") else ""), title if title else num
    return clean, clean


def highlight_placeholders(html_text: str) -> str:
    def repl(m: re.Match) -> str:
        return f'<span style="background-color: yellow;">{m.group(0)}</span>'

    return re.sub(
        r"\[(?:Órgão|Orgao|Nome do Órgão|Nome do Orgao|Órgão ou [Ee]ntidade|Orgao ou [Ee]ntidade|"
        r"Unidade[^\]]*|prazo[^\]]*|definir[^\]]*|responsável[^\]]*|Comitê[^\]]*|"
        r"CPDP[^\]]*|Nome do [Ss]erviço[^\]]*)[^\]]*\]",
        repl,
        html_text,
    )


def paras_to_html(paras: list[str]) -> str:
    parts = []
    for p in paras:
        # skip lonely "Objetivo da Política" / "Glossário" subtitle lines after heading
        if re.match(r"(?i)^(objetivo da pol[ií]tica|gloss[aá]rio|amplitude,? alcance.*)$", p):
            continue
        if re.match(r"(?i)^importante:", p):
            # description material — keep as red note
            parts.append(f'<p style="color: #dc0000;"><em>{escape_html(p)}</em></p>')
            continue
        # red instructional brackets already in source often
        esc = escape_html(p)
        if re.search(r"\[Acrescente|\[Liste|\[Defina|\[Ajuste|\[Inclua|\[Adicione", p, re.I):
            parts.append(f'<p style="color: #dc0000;">{esc}</p>')
        else:
            parts.append(f"<p>{esc}</p>")
    html = "".join(parts)
    return highlight_placeholders(html)


def escape_html(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def split_sections(paras: list[str], doc_name: str) -> list[dict]:
    # start at first Propósito (skip capa/sumário/créditos)
    start = 0
    for i, p in enumerate(paras):
        if SKIP_UNTIL.match(p) and "PAGEREF" not in p:
            # avoid early false positives in legal citations before model body:
            # prefer the occurrence after ~80 lines if multiple
            start = i
            # keep searching for a later one that looks like section header alone
            if len(p) < 80:
                break
    body = paras[start:]

    # Also skip if Propósito appears inside long legal text — find short heading
    for i, p in enumerate(body):
        if re.match(r"(?i)^prop[oó]sito(\s*\[|\s*$|\s+conforme)", p) and len(p) < 120:
            body = body[i:]
            break

    sections: list[dict] = []
    # intro
    sections.append(
        {
            "id": 0,
            "secao": doc_name,
            "titulo": "Introdução",
            "descricao": (
                "IMPORTANTE: Modelo oficial do PPSI (Secretaria de Governo Digital). "
                "Utilize como referência e adeque às particularidades do órgão ou entidade. "
                "Substitua trechos entre colchetes / destaque amarelo e remova orientações em vermelho antes da aprovação."
            ),
            "texto": "",
        }
    )

    current_secao = None
    current_titulo = None
    buf: list[str] = []

    def flush():
        nonlocal current_secao, current_titulo, buf
        if current_secao is None:
            buf = []
            return
        # avoid empty duplicate capítulo headers
        texto = paras_to_html(buf)
        # if section is only a duplicate short heading, still keep if has arts
        sections.append(
            {
                "id": len(sections),
                "secao": current_secao,
                "titulo": current_titulo or current_secao,
                "descricao": "",
                "texto": texto,
            }
        )
        buf = []

    for p in body:
        # standalone subtitle lines that follow Propósito/Escopo
        if re.match(r"(?i)^(objetivo da pol[ií]tica|gloss[aá]rio)$", p) and current_secao:
            if not current_titulo or current_titulo == current_secao:
                current_titulo = p
            continue

        def is_citacao_capitulo(line: str) -> bool:
            return bool(
                re.match(r"(?i)^cap[ií]tulo\b", line)
                and re.search(r"(?i)\bArt\.?\s*\d|Inciso|al[ií]nea|Seção\s+[IVXLC\d]+", line)
            )

        is_header = False
        if SECTION_START.match(p) and len(p) < 160:
            if is_citacao_capitulo(p):
                if current_secao:
                    buf.append(p)
                continue
            is_header = True
        elif re.match(r"(?i)^cap[ií]tulo\s+[ivxlcd\d]+\b", p) and len(p) < 160:
            if is_citacao_capitulo(p):
                if current_secao:
                    buf.append(p)
                continue
            is_header = True
        elif re.match(r"(?i)^disposi[cç][oõ]es finais\s*$", p):
            is_header = True

        # Capítulos curtos ("Capítulo II") antes de Declarações = referência normativa
        if is_header and re.match(r"(?i)^cap[ií]tulo\s+[ivxlcd\d]+\s*$", p):
            if current_secao is None:
                continue
            if current_secao and not re.match(
                r"(?i)^(declara|cap[ií]tulo|disposi)", current_secao
            ):
                buf.append(p)
                continue

        if is_header:
            flush()
            secao, titulo = normalize_heading(p)
            # fix CAPÍTULO secao formatting
            if secao.startswith("CAPÍTULO") and " - " not in secao and titulo and titulo != secao:
                secao = f"{secao.split()[0]} {secao.split()[1]} - {titulo}" if len(secao.split()) >= 2 else secao
            # Disposições finais
            if re.match(r"(?i)^disposi", secao):
                secao, titulo = "Disposições finais", "Disposições finais"
            current_secao = secao
            current_titulo = titulo
            continue

        if current_secao is None:
            continue
        buf.append(p)

    flush()

    # drop empty body sections (no texto and not intro)
    cleaned = [sections[0]]
    for s in sections[1:]:
        if (s.get("texto") or "").strip():
            cleaned.append(s)
        elif s["secao"].upper().startswith("CAPÍTULO"):
            # keep chapter marker only if next would merge — skip empties
            continue
    # re-id
    for i, s in enumerate(cleaned):
        s["id"] = i
    return cleaned


def split_termo(paras: list[str]) -> list[dict]:
    """Extrai só a parte Termo de Uso do template PPSI (privacidade fica no doc próprio do portal)."""
    start = 0
    for i, p in enumerate(paras):
        if re.match(r"(?i)^termo de uso\s*$", p):
            start = i + 1
            break
    end = len(paras)
    for i, p in enumerate(paras[start:], start):
        if re.match(r"(?i)^pol[ií]tica de privacidade\s*$", p):
            end = i
            break
    body = paras[start:end]

    headers = [
        (r"(?i)^aceita[cç][aã]o do termo de uso", "Aceitação do Termo de Uso", "Contrato de adesão"),
        (r"(?i)^defini[cç][oõ]es do termo de uso", "Definições do Termo de Uso", "Glossário"),
        (r"(?i)^arcabou[cç]o legal", "Arcabouço Legal", "Normas aplicáveis"),
        (r"(?i)^descri[cç][aã]o do servi[cç]o", "Descrição do Serviço", "O que é oferecido"),
        (r"(?i)^direitos do usu[aá]rio", "Direitos do Usuário", "Direitos e deveres"),
        (r"(?i)^responsabilidades do usu[aá]rio", "Responsabilidades do Usuário", "Deveres"),
        (r"(?i)^responsabilidades do (órgão|orgao|fornecedor|prestador)", "Responsabilidades do Fornecedor", "Deveres do órgão"),
        (r"(?i)^propriedade intelectual", "Propriedade Intelectual", "Direitos autorais"),
        (r"(?i)^isenz[aã]o de responsabilidade", "Isenção de Responsabilidade", "Limitações"),
        (r"(?i)^informa[cç][oõ]es prestadas", "Informações Prestadas pelo Usuário", "Conteúdo do usuário"),
        (r"(?i)^san[cç][oõ]es", "Sanções", "Penalidades"),
        (r"(?i)^mudan[cç]as (no|do) termo", "Mudanças no Termo", "Atualizações"),
        (r"(?i)^disposi[cç][oõ]es gerais", "Disposições Gerais", "Disposições gerais"),
        (r"(?i)^foro", "Foro", "Foro competente"),
        (r"(?i)^contato", "Contato", "Canais de atendimento"),
    ]

    sections = [
        {
            "id": 0,
            "secao": "Termo de Uso",
            "titulo": "Introdução",
            "descricao": (
                "IMPORTANTE: Modelo simplificado do PPSI (Guia de Elaboração de Termo de Uso e Política de Privacidade). "
                "Adeque ao serviço concreto. Trechos exemplificativos e orientações em vermelho devem ser revisados "
                "antes da publicação. Não dispensa análise jurídica."
            ),
            "texto": "",
        }
    ]

    # Fallback: chunk by blank-ish headings matching first group of known titles in body
    current = None
    buf: list[str] = []

    def flush():
        nonlocal current, buf
        if not current:
            buf = []
            return
        sections.append(
            {
                "id": len(sections),
                "secao": current[0],
                "titulo": current[1],
                "descricao": "",
                "texto": paras_to_html(buf),
            }
        )
        buf = []

    for p in body:
        # Termo de Uso termina quando começa a Política de Privacidade do mesmo template
        # (no FPSI a privacidade do portal é documento separado).
        if re.match(r"(?i)^pol[ií]tica de privacidade\s*$", p) and current is not None:
            flush()
            break
        matched = None
        for pat, secao, titulo in headers:
            if re.match(pat, p) and len(p) < 120:
                matched = (secao, titulo)
                break
        if matched:
            # pular cabeçalho de política de privacidade se aparecer na lista
            if matched[0].startswith("Política de Privacidade"):
                flush()
                break
            flush()
            current = matched
            continue
        if current is None:
            if re.match(r"(?i)^ponto de aten", p):
                continue
            continue
        buf.append(p)
    flush()

    for i, s in enumerate(sections):
        s["id"] = i
    # if too few sections, dump remaining as single body
    if len(sections) < 3:
        html = paras_to_html(body[:200])
        return [
            sections[0],
            {
                "id": 1,
                "secao": "Conteúdo do Termo de Uso",
                "titulo": "Modelo PPSI",
                "descricao": "",
                "texto": html,
            },
        ]
    return [s for s in sections if s["id"] == 0 or (s.get("texto") or "").strip()]


def sql_escape(s: str) -> str:
    return s.replace("'", "''")


def upsert_sql(id_: str, nome: str, descricao: str, cor: str, ordem: int, secoes: list) -> str:
    payload = json.dumps(secoes, ensure_ascii=False)
    return f"""
INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  '{id_}',
  '{sql_escape(nome)}',
  '{sql_escape(descricao)}',
  '{cor}',
  {ordem},
  '{sql_escape(payload)}'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem,
  secoes = EXCLUDED.secoes,
  ativo = true,
  updated_at = NOW();
"""


def main():
    OUT_MODELS.mkdir(parents=True, exist_ok=True)
    parts = [
        "-- Importação dos modelos oficiais PPSI (DOCX) + Termo de Uso\n",
        "-- Gerado por scripts/import-ppsi-modelos-politicas.py\n",
    ]
    stats = []

    for tipo, filename in MAP.items():
        path = DOC_DIR / filename
        if not path.exists():
            raise SystemExit(f"Arquivo não encontrado: {path}")
        nome, desc, cor, ordem = META[tipo]
        paras = docx_paragraphs(path)
        secoes = split_sections(paras, nome)
        chars = sum(len(s.get("texto") or "") for s in secoes)
        stats.append((tipo, len(secoes), chars, len(paras)))
        out_json = OUT_MODELS / f"{tipo}.json"
        out_json.write_text(json.dumps({"secoes": secoes}, ensure_ascii=False, indent=2), encoding="utf-8")
        parts.append(upsert_sql(tipo, nome, desc, cor, ordem, secoes))
        print(f"OK {tipo}: {len(secoes)} seções, {chars} chars texto (de {len(paras)} parágrafos)")

    # Termo de uso
    if not TEMPLATE_TERMO.exists():
        raise SystemExit(f"Template termo não encontrado: {TEMPLATE_TERMO}")
    paras = docx_paragraphs(TEMPLATE_TERMO)
    secoes_termo = split_termo(paras)
    chars = sum(len(s.get("texto") or "") for s in secoes_termo)
    stats.append(("documento_portal_termo_uso", len(secoes_termo), chars, len(paras)))
    (OUT_MODELS / "documento_portal_termo_uso.json").write_text(
        json.dumps({"secoes": secoes_termo}, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    parts.append(
        upsert_sql(
            "documento_portal_termo_uso",
            "Termo de Uso (portal / serviço)",
            "Modelo PPSI de Termo de Uso (Guia de Elaboração de Termo de Uso e Política de Privacidade)",
            "#455A64",
            19,
            secoes_termo,
        )
    )
    print(f"OK documento_portal_termo_uso: {len(secoes_termo)} seções, {chars} chars")

    # portal link column
    parts.append(
        """
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS link_termo_uso text;
COMMENT ON COLUMN public.programa.link_termo_uso IS 'URL externa do termo de uso; se vazio, usa /{slug}/termo-uso';
"""
    )

    OUT_SQL.write_text("\n".join(parts), encoding="utf-8")
    print(f"\nWrote {OUT_SQL} ({OUT_SQL.stat().st_size} bytes)")
    print("JSON em", OUT_MODELS)


if __name__ == "__main__":
    main()
