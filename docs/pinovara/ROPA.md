# ROPA — Registro das Operações de Tratamento (Art. 37 LGPD)

Projeto: PINOVARA | Controlador: UFBA/INCRA | Operador: LGRDC Serviços de Informática

---

## Operação 1: Cadastro de usuários do sistema

| Campo | Descrição |
|-------|-----------|
| **Nome do processo** | Cadastro e gestão de usuários do sistema PINOVARA |
| **Finalidade** | Autenticação, controle de acesso e identificação de técnicos, gestores e administradores que utilizam o sistema |
| **Base legal** | Art. 7º, III — execução de política pública (TED 50/2023 INCRA/UFBA) |
| **Categorias de dados** | Nome completo, e-mail, senha (criptografada), permissões/papéis, data de registro |
| **Titulares** | Técnicos, gestores e administradores do projeto |
| **Compartilhamento** | Não há compartilhamento com terceiros; dados utilizados apenas para operação do sistema |
| **Retenção** | Até exclusão da conta ou 5 anos de inatividade |
| **Medidas de segurança** | Autenticação JWT, criptografia bcrypt, HTTPS, controle de acesso por papéis, logs de auditoria |

---

## Operação 2: Cadastro de organizações e representantes (Meta 12)

| Campo | Descrição |
|-------|-----------|
| **Nome do processo** | Perfil de Entrada e Plano de Gestão — organizações e representantes |
| **Finalidade** | Cadastro e gestão de organizações participantes do projeto; registro de representantes legais; elaboração de diagnósticos e relatórios técnicos |
| **Base legal** | Art. 7º, III — execução de política pública; Art. 7º, V — execução de contrato |
| **Categorias de dados** | **Organizações:** nome, CNPJ, endereço, telefone, e-mail institucional, coordenadas GPS, dados socioeconômicos e ambientais. **Representantes:** nome, CPF, RG, endereço residencial, telefone, e-mail, função na organização |
| **Titulares** | Organizações participantes e seus representantes legais |
| **Compartilhamento** | UFBA (pesquisa/extensão), INCRA (projeto), prestadores de infraestrutura (hospedagem) |
| **Retenção** | Vigência do projeto + 5 anos após encerramento, conforme exigências legais |
| **Medidas de segurança** | Controle de acesso, backups, HTTPS, logs de auditoria |

---

## Operação 3: Capacitações e participantes (Meta 11)

| Campo | Descrição |
|-------|-----------|
| **Nome do processo** | Qualificação e Formação Profissional — capacitações e participantes |
| **Finalidade** | Cadastro de capacitações; gestão de participantes; registro de presença; avaliações; geração de certificados e relatórios |
| **Base legal** | Art. 7º, II — cumprimento de obrigação legal; Art. 7º, III — execução de política pública |
| **Categorias de dados** | **Participantes:** nome, CPF, RG (opcional), e-mail, telefone, instituição vinculada, data de inscrição, registros de presença, avaliações e feedback |
| **Titulares** | Participantes das capacitações |
| **Compartilhamento** | UFBA, INCRA, prestadores de infraestrutura |
| **Retenção** | Vigência do projeto + 5 anos (certificação e comprovação de participação) |
| **Medidas de segurança** | Controle de acesso, backups, HTTPS, logs de auditoria |

---

## Operação 4: Cadastro de famílias em territórios *(planejado)*

| Campo | Descrição |
|-------|-----------|
| **Nome do processo** | Cadastro de famílias em territórios — coleta em campo |
| **Finalidade** | Coleta de dados pessoais de famílias para suporte fundiário, elaboração de RTID (Relatório Técnico de Identificação) e eventual regularização; georreferenciamento de lotes e perímetros |
| **Base legal** | Art. 7º, III — execução de política pública; Art. 11, II — dados sensíveis (origem racial/étnica em territórios quilombolas) quando aplicável |
| **Categorias de dados** | **Membros da família:** nome, CPF, RG, endereço, telefone, data de nascimento. **Documentos:** fotos de documentos de identificação. **Propriedade:** fotos da propriedade, coordenadas GPS, dados socioeconômicos e ambientais. **Territórios quilombolas:** pode envolver dados sensíveis (origem racial/étnica) |
| **Titulares** | Famílias em assentamentos federais e territórios quilombolas |
| **Compartilhamento** | INCRA, UFBA, órgãos competentes para regularização fundiária |
| **Retenção** | Vigência do projeto + 5 anos (conforme legislação fundiária) |
| **Medidas de segurança** | Coleta via tablets com armazenamento seguro; sincronização criptografada; controle de acesso; backups; treinamento de técnicos |
| **Observação** | Exige RIPD (Relatório de Impacto) e atualização da política de privacidade antes do início |

---

## Uso no FPSI

As operações acima podem ser registradas no módulo ROPA do FPSI em `programas/[id]/conformidade/ropa` para acompanhamento e exportação.
