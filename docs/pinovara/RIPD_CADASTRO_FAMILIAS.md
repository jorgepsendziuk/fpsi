# RIPD — Relatório de Impacto à Proteção de Dados Pessoais

**Operação:** Cadastro de Famílias em Territórios  
**Projeto:** PINOVARA — TED 50/2023 INCRA/UFBA  
**Art. 38 LGPD** — Tratamentos de alto risco

---

*Template para preenchimento. O RIPD deve ser elaborado pelo DPO e aprovado pelo controlador antes do início da coleta em campo.*

---

## 1. Identificação da Operação

| Campo | Descrição |
|-------|-----------|
| **Título** | Cadastro de famílias em territórios — coleta em campo para RTID e regularização fundiária |
| **Vinculação ROPA** | Operação 4 — Cadastro de famílias em territórios |
| **Controlador** | UFBA / INCRA |
| **Operador** | LGRDC Serviços de Informática |

---

## 2. Descrição dos Dados Coletados

### 2.1 Categorias de dados

- **Identificação:** nome completo, CPF, RG, data de nascimento
- **Contato:** endereço, telefone
- **Documentos:** fotos de documentos de identificação
- **Propriedade:** fotos da propriedade e do lote, coordenadas GPS
- **Socioeconômicos/ambientais:** informações sobre a família e o território
- **Dados sensíveis (quando aplicável):** em territórios quilombolas, dados que revelem origem racial ou étnica (art. 5º II LGPD)

### 2.2 Titulares

Famílias em assentamentos federais e territórios quilombolas nos estados da Bahia, São Paulo e Espírito Santo — estimativa de mais de 5.000 famílias.

### 2.3 Vulnerabilidades dos titulares

- População em situação de vulnerabilidade socioeconômica
- Possível desconhecimento dos direitos previstos na LGPD
- Coleta em contexto de política pública (assimetria de poder)
- Dados sensíveis em territórios quilombolas

---

## 3. Metodologia de Coleta e Segurança

### 3.1 Metodologia

- Coleta em campo por técnicos de campo treinados
- Uso de tablets com aplicativo específico
- Armazenamento local com sincronização posterior
- Termo de consentimento/informação apresentado antes da coleta
- Possibilidade de coleta offline em áreas sem conectividade

### 3.2 Medidas de segurança técnicas

- Criptografia em trânsito (HTTPS) e em repouso
- Controle de acesso por papéis e permissões
- Dispositivos com bloqueio e senha
- Backups regulares
- Logs de auditoria

### 3.3 Medidas organizacionais

- Treinamento de técnicos em LGPD e coleta responsável
- Política de privacidade atualizada e acessível
- Canal de contato com DPO para titulares

---

## 4. Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Vazamento de dados em dispositivos em campo | Média | Alto | Bloqueio de dispositivo, criptografia, política de uso |
| Acesso não autorizado a fotos de documentos | Baixa | Alto | Controle de acesso, retenção limitada |
| Uso indevido de dados sensíveis (quilombolas) | Baixa | Alto | Base legal explícita, transparência, salvaguardas |
| Falta de compreensão do titular | Média | Médio | Termo em linguagem acessível, explicação verbal |
| Perda de dados em sincronização | Baixa | Médio | Backup local, validação de sincronização |

---

## 5. Medidas, Salvaguardas e Mitigação

- **Minimização:** Coleta apenas dos dados necessários para as finalidades declaradas
- **Transparência:** Termo de consentimento/informação em linguagem acessível
- **Segurança:** Criptografia, controle de acesso, treinamento de técnicos
- **Direitos dos titulares:** Canal com DPO para exercício de direitos (art. 18 LGPD)
- **Base legal:** Política pública (Art. 7º III); dados sensíveis — Art. 11 II
- **Retenção:** Prazo definido (vigência + 5 anos), exclusão ao término

---

## 6. Conclusão e Recomendações

### 6.1 Necessidade do RIPD

O tratamento envolve dados pessoais em grande escala, dados sensíveis (em territórios quilombolas), coleta em contexto de vulnerabilidade e uso de imagens de documentos. Conforme art. 38 da LGPD, tratamentos que possam gerar risco aos direitos e liberdades do titular exigem relatório de impacto.

### 6.2 Conclusão

Com a implementação das medidas descritas (termo de consentimento, política atualizada, treinamento, segurança técnica e organizacional), os riscos podem ser mitigados a um nível aceitável. Recomenda-se:

1. Atualizar a política de privacidade antes do início
2. Realizar treinamento dos técnicos de campo
3. Garantir que o termo seja apresentado e assinado antes da coleta
4. Monitorar incidentes e pedidos de titulares

### 6.3 Aprovação

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| DPO | | | |
| Controlador (UFBA/INCRA) | | | |

---

*Este RIPD pode ser registrado no módulo RIPD do FPSI em `programas/[id]/conformidade/ripd`.*
