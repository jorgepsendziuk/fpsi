# Programa de Privacidade PINOVARA

Documento consolidado do programa de privacidade do projeto PINOVARA (Pesquisa Inovadora em Gestão do PNRA), parceria INCRA/UFBA via TED nº 50/2023.

---

## 1. Contexto do Projeto

### 1.1 O que é o PINOVARA

O **PINOVARA** (Pesquisa Inovadora em Gestão do PNRA) é uma parceria estratégica entre o Instituto Nacional de Colonização e Reforma Agrária (INCRA) e a Universidade Federal da Bahia (UFBA) por meio do Termo de Execução Descentralizado (TED) nº 50/2023.

**Objetivo:** Desenvolvimento de processos inovadores no georreferenciamento e supervisão ocupacional com coleta de dados socioeconômicos/ambientais de lotes e perímetros em projetos de assentamento federais e regularização fundiária de territórios quilombolas.

**Escopo geográfico:** Bahia, São Paulo e Espírito Santo — impactando mais de 5.000 famílias.

### 1.2 Escopo Atual (em operação)

- **Meta 11:** Qualificação e Formação Profissional — cadastro de capacitações e participantes
- **Meta 12:** Perfil de Entrada e Plano de Gestão — cadastro de organizações, responsáveis e representantes
- **Usuários do sistema:** técnicos, gestores e administradores

### 1.3 Escopo Futuro (planejado)

- **Cadastro de Famílias em territórios:** coleta em campo via tablets, dados pessoais de famílias inteiras, fotos de documentos e propriedades, para suporte fundiário e elaboração de RTID (Relatório Técnico de Identificação).

---

## 2. Papéis e Responsabilidades LGPD

```mermaid
flowchart TB
    subgraph controlador [Controlador - determina finalidades e meios]
        INCRA[INCRA]
        UFBA[UFBA]
    end
    
    subgraph contratante [Contratante administrativa]
        FUNARBE[FUNARBE - Fundação UFBA]
    end
    
    subgraph operador [Operador - executa conforme instruções]
        LGRDC[LGRDC Serviços de Informática]
    end
    
    INCRA -->|TED 50/2023| UFBA
    UFBA -->|Contrato| FUNARBE
    FUNARBE -->|Desenvolvimento/hospedagem| LGRDC
    
    LGRDC -->|Processa dados em nome de| controlador
```

### 2.1 UFBA / INCRA (Controlador)

- Determina as finalidades e os meios do tratamento de dados
- Define bases legais e políticas de retenção
- Responde perante titulares e ANPD

### 2.2 FUNARBE (Contratante)

- Fundação de apoio da UFBA; intermediária contratual
- Garante que o contrato com LGRDC preveja obrigações LGPD
- Pode atuar como controlador em conjunto com UFBA, conforme arranjo do TED

### 2.3 LGRDC (Operador)

- Processa dados pessoais em nome do controlador, conforme instruções
- Implementa medidas de segurança técnicas e organizacionais
- Mantém ROPA das atividades que executa
- Auxilia o controlador em pedidos de titulares e incidentes
- Não utiliza os dados para finalidades próprias

---

## 3. ROPA — Registro das Operações de Tratamento

Conforme art. 37 da LGPD. Detalhamento em [ROPA.md](./ROPA.md).

| # | Operação | Finalidade | Base Legal | Status |
|---|----------|------------|------------|--------|
| 1 | Cadastro de usuários do sistema | Autenticação e controle de acesso | Política pública (Art. 7º III) | Ativo |
| 2 | Cadastro de organizações e representantes (Meta 12) | Gestão de organizações participantes | Política pública, execução de contrato | Ativo |
| 3 | Capacitações e participantes (Meta 11) | Qualificação e formação profissional | Política pública, obrigação legal | Ativo |
| 4 | Cadastro de famílias em territórios | RTID, suporte fundiário, regularização | Política pública (Art. 7º III, 11 II) | Planejado |

---

## 4. Política de Privacidade

- **URL:** https://pinovaraufba.com.br/politica-privacidade
- **Última atualização:** 01/03/2026
- **Versão atual:** cobre Metas 11 e 12, usuários do sistema

### Histórico de alterações

| Data | Alteração |
|------|-----------|
| 01/03/2026 | Versão inicial — Metas 11 e 12, usuários |
| *(futuro)* | Inclusão do Cadastro de Famílias e RTID |

### Checklist de adequação para Cadastro de Famílias

Antes de iniciar a coleta em campo, a política deve ser atualizada para incluir:

- [ ] Dados de famílias (membros, documentos, fotos de propriedades)
- [ ] Dados sensíveis em territórios quilombolas (origem racial/étnica)
- [ ] Coleta em campo (tablets, técnicos, offline/sincronização)
- [ ] Finalidade RTID e regularização fundiária
- [ ] Esclarecimento dos papéis (controlador x operador)
- [ ] Termo de consentimento/informação para famílias
- [ ] Prazos de retenção para dados de famílias

---

## 5. Contatos

| Papel | Nome/Entidade | Contato |
|-------|---------------|---------|
| DPO (LGRDC) | Jorge Psendziuk | jorgefrpsendziuk@gmail.com |
| Controlador | UFBA / Projeto PINOVARA | [contato institucional] |
| Contratante | FUNARBE | [contato institucional] |

---

## 6. Documentos Relacionados

- [ROPA.md](./ROPA.md) — Registro detalhado das operações de tratamento
- [DPA_TEMPLATE.md](./DPA_TEMPLATE.md) — Modelo de acordo de processamento de dados
- [ALTERACOES_POLITICA_CADASTRO_FAMILIAS.md](./ALTERACOES_POLITICA_CADASTRO_FAMILIAS.md) — Alterações sugeridas na política antes do Cadastro de Famílias
- [TERMO_CONSENTIMENTO_FAMILIAS.md](./TERMO_CONSENTIMENTO_FAMILIAS.md) — Termo para coleta em campo
- [RIPD_CADASTRO_FAMILIAS.md](./RIPD_CADASTRO_FAMILIAS.md) — Relatório de Impacto (template)
- [GUIA_TREINAMENTO_TECNICOS_CAMPO.md](./GUIA_TREINAMENTO_TECNICOS_CAMPO.md) — Treinamento LGPD para técnicos
- [PROCESSO_PEDIDOS_TITULARES.md](./PROCESSO_PEDIDOS_TITULARES.md) — Fluxo para exercício de direitos (art. 18 LGPD)

---

## Referências

- LGPD (Lei nº 13.709/2018) — arts. 5º, 7º, 11, 37, 39, 41, 43
- [ROTINA_DPO_E_GAPS.md](../essentials/ROTINA_DPO_E_GAPS.md) — fluxo DPO e módulos FPSI
