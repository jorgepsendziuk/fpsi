# FPSI — Framework de Privacidade e Segurança da Informação

Implementação web do **Framework de Privacidade e Segurança da Informação (FPSI)**, alinhada à **LGPD** e ao **Programa de Privacidade e Segurança da Informação (PPSI)** do Governo Federal. Alternativa em **software livre** à ferramenta oficial em planilha Excel: multi-usuário, sem dependência de software proprietário e adaptável à realidade de cada organização.

## Para quem é

- **DPOs** (Encarregados pelo Tratamento de Dados Pessoais)
- **Gestores de TI e de Segurança da Informação**
- Órgãos públicos, pequenas empresas e consultores que conduzem programas de privacidade e segurança

Roteiro alinhado ao Framework PPSI: diagnóstico de maturidade, controles (segurança e privacidade), plano de trabalho e políticas em um só lugar.

## Origem do projeto

O projeto nasceu de uma pesquisa com profissionais da área (incl. formação CDPO/BR), que identificou a eficiência da ferramenta oficial em Excel para validação de medidas e nível de maturidade, mas também suas limitações: acessibilidade, trabalho distribuído e dependência de software proprietário. Esta implementação usa tecnologias modernas (Next.js, React, Supabase) para oferecer um software de referência em **modelo open source**, permitindo colaboração da comunidade, implantação em órgãos públicos e empresas, e até oferta como PaaS (Privacy as a Service).

**Documentação da pesquisa e do contexto regulatório:** [docs/essentials/CONTEXTO_PESQUISA_ORIGEM.md](docs/essentials/CONTEXTO_PESQUISA_ORIGEM.md)

## Como rodar

- **Setup local:** [docs/essentials/setup/COMO_RODAR_LOCALMENTE.md](docs/essentials/setup/COMO_RODAR_LOCALMENTE.md)
- **Documentação geral:** [docs/README.md](docs/README.md)

## Tecnologias

- Next.js, React, TypeScript
- Supabase (autenticação e banco de dados)
- Material-UI

## Autenticação e autorização

- **Identidade (quem está logado):** Supabase Auth (`auth.users`, sessão em cookies). Login por e-mail/senha ou OAuth.
- **Papéis e permissões:** Tabelas próprias no Supabase: `programa_users` (função e permissões por programa) e `profiles` (dados do usuário). A aplicação usa `useUserPermissions(programaId)` e a API `/api/users` para checagens de acesso. Para um eventual papel global (ex.: super-admin), pode-se usar `app_metadata` no Auth ou uma coluna em `profiles`.

## Licença

Código aberto. Consulte o repositório e a pasta `docs/` para mais informações.
