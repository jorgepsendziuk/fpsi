#!/usr/bin/env python3
"""Gera modelo completo de Termo de Uso (PPSI) com placeholders do FPSI."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "public/models/documento_portal_termo_uso.json"
OUT_SQL = ROOT / "supabase/migrations/20260720090000_termo_uso_ppsi_completo.sql"

Y = '<span style="background-color: yellow;">'
YE = "</span>"
R = '<p style="color: #dc0000;">'
RE = "</p>"


def y(s: str) -> str:
    return f"{Y}{s}{YE}"


def p(*parts: str) -> str:
    return "".join(f"<p>{x}</p>" if not x.startswith("<p") else x for x in parts)


def sec(id_: int, secao: str, titulo: str, descricao: str, texto: str) -> dict:
    return {
        "id": id_,
        "secao": secao,
        "titulo": titulo,
        "descricao": descricao,
        "texto": texto,
    }


org = y("[Órgão ou entidade]")
servico = y("[Nome do Serviço]")
endereco = y("[Endereço]")

secoes = [
    sec(
        0,
        "Termo de Uso",
        "Introdução",
        "Modelo baseado no Guia/Template PPSI de Elaboração de Termo de Uso e Política de Privacidade (SGD/MGI). Adeque ao serviço concreto; remova orientações em vermelho antes da publicação. Não dispensa análise jurídica.",
        "",
    ),
    sec(
        1,
        "Aceitação do Termo de Uso",
        "Contrato de adesão",
        "Ciência / aceitação das condições de uso.",
        p(
            f"O presente Termo de Uso constitui contrato de adesão entre o usuário e o fornecedor deste serviço, o(a) {org}, com sede em {endereco}.",
            f"O uso do serviço {servico} está condicionado à ciência / aceitação deste Termo e das políticas associadas, em especial a Política de Privacidade.",
            "Ao utilizar o serviço, o usuário manifesta estar ciente e de acordo com o conteúdo deste Termo e vincula-se às suas condições.",
            f'{R}<em>[Oriente-se pelo Guia PPSI §1.1 sobre a escolha entre “aceitação”, “concordância” ou “ciência”, conforme o serviço.]</em>{RE}',
        ),
    ),
    sec(
        2,
        "Definições",
        "Glossário",
        "Termos usados neste documento.",
        p(
            "Para os fins deste Termo de Uso, aplicam-se as seguintes definições:",
            "<p><strong>Agente público:</strong> todo aquele que exerce, ainda que transitoriamente ou sem remuneração, por eleição, nomeação, designação, contratação ou qualquer outra forma de investidura ou vínculo, mandato, cargo, emprego ou função nos órgãos e entidades da Administração Pública, direta e indireta.</p>",
            "<p><strong>Agentes de Estado:</strong> órgãos e entidades da Administração pública e seus agentes públicos.</p>",
            "<p><strong>Códigos maliciosos:</strong> programa de computador, ou parte dele, construído com a intenção de provocar danos, obter informações indevidas ou realizar outras ações ilícitas.</p>",
            "<p><strong>Sítios e aplicativos:</strong> meios digitais pelos quais o usuário acessa os serviços e conteúdos disponibilizados.</p>",
            "<p><strong>Terceiro:</strong> pessoa ou entidade que não participa diretamente do vínculo principal entre usuário e fornecedor do serviço.</p>",
            "<p><strong>Internet:</strong> sistema mundial de protocolos lógicos para uso público e irrestrito, com finalidade de possibilitar a comunicação de dados entre terminais.</p>",
            f"<p><strong>Usuário:</strong> pessoa natural que utiliza o serviço {servico}.</p>",
            f"{R}<em>[Inclua outros termos específicos do serviço, se necessário. Definições técnicas: glossário do GSI/PR.]</em>{RE}",
        ),
    ),
    sec(
        3,
        "Arcabouço Legal",
        "Normas aplicáveis",
        "Leis e atos que regem o serviço.",
        p(
            f"O arcabouço legal aplicável ao serviço {servico} compreende, entre outros:",
            "<p><strong>Lei nº 12.965/2014</strong> — Marco Civil da Internet;</p>",
            "<p><strong>Lei nº 12.527/2011</strong> — Lei de Acesso à Informação;</p>",
            "<p><strong>Lei nº 13.460/2017</strong> — direitos do usuário de serviços públicos;</p>",
            "<p><strong>Lei nº 13.709/2018</strong> — Lei Geral de Proteção de Dados Pessoais (LGPD);</p>",
            "<p><strong>Lei nº 13.444/2017</strong> — Identificação Civil Nacional (quando aplicável);</p>",
            "<p><strong>Decreto nº 8.777/2016</strong> — Política de Dados Abertos (quando aplicável);</p>",
            "<p><strong>Decreto nº 7.724/2012</strong> — regulamentação da LAI;</p>",
            "<p><strong>Decreto nº 10.046/2019</strong> — governança no compartilhamento de dados (quando aplicável);</p>",
            "<p><strong>Decreto nº 9.637/2018</strong> — Política Nacional de Segurança da Informação;</p>",
            "<p><strong>Lei nº 12.737/2012</strong> — tipificação de delitos informáticos;</p>",
            "<p>Normas complementares do GSI/PR relativas à gestão de segurança da informação.</p>",
            f"{R}<em>[Inclua portarias, resoluções e normativos específicos do órgão e do serviço.]</em>{RE}",
        ),
    ),
    sec(
        4,
        "Descrição do Serviço",
        "O que é oferecido",
        "Objetivo, função e finalidade do serviço.",
        p(
            f"Este Termo regula o uso do serviço {servico}, disponibilizado por {org}.",
            f"{R}<em>[Descreva objetivo, público-alvo, principais funcionalidades, canais de acesso (web/app) e o que o serviço não cobre.]</em>{RE}",
            f"Informações de contato do responsável pelo serviço: e-mail {y('[E-mail de atendimento]')}, telefone {y('[Telefone de atendimento]')}, site {y('[Site institucional]')}.",
        ),
    ),
    sec(
        5,
        "Direitos do Usuário",
        "Direitos básicos",
        "Conforme Lei nº 13.460/2017 e demais normas.",
        p(
            "De acordo com a Lei nº 13.460/2017, são direitos básicos do usuário, entre outros:",
            "<p>I — participação no acompanhamento da prestação e na avaliação dos serviços;</p>",
            "<p>II — obtenção e utilização dos serviços com liberdade de escolha entre os meios oferecidos e sem discriminação;</p>",
            "<p>III — acesso e obtenção de informações relativas à sua pessoa constantes de registros ou bancos de dados, observado o disposto na legislação;</p>",
            "<p>IV — proteção de suas informações pessoais, nos termos da Lei nº 12.527/2011 e da LGPD;</p>",
            "<p>V — atuação integrada e sistêmica na expedição de atestados, certidões e documentos comprobatórios de regularidade, quando cabível;</p>",
            "<p>VI — obtenção de informações precisas e de fácil acesso sobre horário de funcionamento, serviços prestados, localização, canais de manifestação, tramitação de processos em que figure como interessado e valores de taxas/tarifas, quando houver.</p>",
            f"{R}<em>[Acrescente direitos específicos do serviço ou de normativos setoriais.]</em>{RE}",
        ),
    ),
    sec(
        6,
        "Responsabilidades do Usuário",
        "Obrigações e cuidados",
        "Deveres do usuário na utilização do serviço.",
        p(
            f"O usuário é responsável pela precisão e veracidade dos dados informados e reconhece que inconsistências podem impossibilitar o uso do serviço {servico}.",
            "Durante a utilização, compromete-se a fornecer somente informações próprias ou de terceiros com a devida autorização, quando exigido.",
            "Credenciais (login e senha) são pessoais e intransferíveis; o usuário deve manter o sigilo e comunicar uso indevido.",
            "O usuário deve manter seus dados atualizados e responde por omissões ou erros nas informações prestadas.",
            "O usuário responde por danos decorrentes do uso indevido do serviço ou de violação deste Termo e da legislação aplicável.",
            f"O(a) {org} não se responsabiliza, em especial, por:",
            "<p>I — equipamento do usuário infectado ou invadido;</p>",
            "<p>II — equipamento avariado no momento do uso;</p>",
            "<p>III — falhas de proteção do computador ou das informações no ambiente do usuário;</p>",
            "<p>IV — abuso de uso, monitoração clandestina ou vulnerabilidades no perímetro do usuário;</p>",
            "<p>V — instabilidades nos sistemas do usuário.</p>",
            "Em nenhuma hipótese a organização será responsável pela instalação, no equipamento do usuário ou de terceiros, de códigos maliciosos decorrentes da navegação na Internet pelo próprio usuário.",
        ),
    ),
    sec(
        7,
        "Responsabilidade da Administração Pública",
        "Compromissos com os dados e o serviço",
        "Deveres do órgão fornecedor.",
        p(
            f"O(a) {org} compromete-se a tratar dados pessoais em conformidade com a LGPD e demais normas aplicáveis, adotando medidas de segurança compatíveis com o risco.",
            "Poderá compartilhar informações quando houver obrigação legal ou ordem judicial, nos limites necessários.",
            f"Esforçar-se-á para manter o serviço {servico} disponível, sem garantir disponibilidade ininterrupta, podendo realizar manutenções e melhorias.",
            f"{R}<em>[Detalhe SLAs, canais de suporte e limites específicos do serviço.]</em>{RE}",
        ),
    ),
    sec(
        8,
        "Privacidade e proteção de dados",
        "Remissão à Política de Privacidade",
        "Tratamento de dados pessoais.",
        p(
            f"O tratamento de dados pessoais no âmbito do serviço {servico} observa a Política de Privacidade publicada no portal / sítio do(a) {org}.",
            "O usuário pode exercer direitos de titular pelos canais indicados na Política de Privacidade e no Portal do Titular, quando disponível.",
            f"Encarregado (DPO), quando indicado: {y('[Nome do Encarregado]')} — {y('[E-mail do Encarregado]')}.",
            f"{R}<em>[Não duplique aqui o texto integral da Política de Privacidade; mantenha a remissão e publique o documento separado no módulo Políticas.]</em>{RE}",
        ),
    ),
    sec(
        9,
        "Alterações do Termo",
        "Atualizações",
        "Como o Termo pode ser modificado.",
        p(
            f"O(a) {org} poderá atualizar este Termo para refletir mudanças legais, técnicas ou do serviço {servico}.",
            "A versão vigente será a publicada no portal / sítio oficial, com indicação da data de vigência.",
            "O uso continuado do serviço após a publicação da nova versão implica ciência das alterações, salvo disposição legal em contrário.",
        ),
    ),
    sec(
        10,
        "Disposições finais",
        "Vigência e foro",
        "Entrada em vigor e foro.",
        p(
            "Este Termo entra em vigor na data de sua publicação.",
            "Os casos omissos serão resolvidos pela unidade responsável pelo serviço, observadas a legislação e as normas internas.",
            f"Fica eleito o foro da sede do(a) {org} para dirimir controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja, quando aplicável.",
            f"{R}<em>[Ajuste o foro conforme a natureza jurídica do órgão e orientação jurídica.]</em>{RE}",
        ),
    ),
]

OUT_JSON.write_text(json.dumps({"secoes": secoes}, ensure_ascii=False, indent=2), encoding="utf-8")

payload = json.dumps(secoes, ensure_ascii=False).replace("'", "''")
sql = f"""-- Termo de Uso PPSI completo (placeholders FPSI)
UPDATE public.politica_modelo SET
  nome = 'Termo de Uso do serviço',
  descricao = 'Modelo PPSI completo de Termo de Uso (Guia SGD/MGI) — separado da Política de Privacidade',
  cor = '#455A64',
  ordem = 19,
  secoes = '{payload}'::jsonb,
  ativo = true,
  updated_at = NOW()
WHERE id = 'documento_portal_termo_uso';

INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo)
SELECT
  'documento_portal_termo_uso',
  'Termo de Uso do serviço',
  'Modelo PPSI completo de Termo de Uso (Guia SGD/MGI) — separado da Política de Privacidade',
  '#455A64',
  19,
  '{payload}'::jsonb,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.politica_modelo WHERE id = 'documento_portal_termo_uso'
);
"""
OUT_SQL.write_text(sql, encoding="utf-8")
chars = sum(len(s["texto"]) for s in secoes)
print(f"OK: {len(secoes)} seções, {chars} chars → {OUT_JSON.name}, {OUT_SQL.name}")
