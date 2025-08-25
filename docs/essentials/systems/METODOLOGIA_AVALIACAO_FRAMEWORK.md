# 📋 METODOLOGIA DE AVALIAÇÃO DO FRAMEWORK DE PRIVACIDADE E SEGURANÇA DA INFORMAÇÃO

## 🎯 **VISÃO GERAL**

Este documento descreve a metodologia completa de avaliação implementada no sistema FPSI, baseada no Guia do Framework oficial de Privacidade e Segurança da Informação. A metodologia abrange três dimensões principais: **Nível de Implementação**, **Nível de Capacidade** e **Cálculo de Maturidade**.

---

## 📊 **1. NÍVEIS DE IMPLEMENTAÇÃO**

O nível de implementação expressa uma análise sobre a **amplitude de implementação** da respectiva medida, considerando a abrangência de ativos de informação que possuem aplicabilidade.

### **1.1 Diagnósticos 2 e 3 (Escala de Maturidade)**

Para os diagnósticos de Segurança da Informação e Privacidade, o avaliador deve selecionar um dos níveis listados na **Tabela 2** para cada medida:

| **Nível de Implementação** | **Pontuação** | **Descrição** |
|---------------------------|---------------|---------------|
| **Adota em maior parte ou totalmente** | 1 | Há decisão formal ou plano aprovado, e a medida na organização é implementada integralmente em mais de 50% ou em todos os: ativos no caso de medida de segurança da informação; ou processos/serviços no caso de medida de privacidade. |
| **Adota em menor parte** | 0,75 | Há decisão formal ou plano aprovado, e a medida na organização é implementada integralmente em menos de 50% dos: ativos no caso de medida de segurança da informação; ou processos/serviços no caso de medida de privacidade. |
| **Adota parcialmente** | 0,5 | Há decisão formal ou plano aprovado, e a medida na organização é implementada parcialmente em mais de 50% ou em todos os: ativos no caso de medida de segurança da informação; ou processos/serviços no caso de medida de privacidade. |
| **Há decisão formal ou plano aprovado para implementar** | 0,25 | Há decisão formal ou plano aprovado, porém não há na organização implementação ou está parcialmente implementado em menos de 50% dos: ativos no caso de medida de segurança da informação; ou processos/serviços no caso de medida de privacidade. |
| **A organização não adota essa medida** | 0 | Não há qualquer decisão formal ou plano aprovado, tampouco implementação da medida. |
| **Não se aplica** | null | A medida não se aplica em nenhum ativo no caso de medida de segurança da informação ou processo/serviço no caso de medida de privacidade, por entendimento dos gestores ou considerando alguma particularidade do contexto de atuação da organização. A não aplicabilidade deverá seguir de uma motivação baseada em uma análise de riscos. |

### **1.2 Diagnóstico 1 (Controle 0 - Estrutura Básica)**

Para o Controle 0 – Estrutura Básica de Gestão em Segurança da Informação e Privacidade, os níveis consistem numa resposta binária conforme **Tabela 3**:

| **Nível de Implementação** | **Pontuação** | **Descrição** |
|---------------------------|---------------|---------------|
| **Sim** | 1 | O papel ou instrumento foi devidamente instituído na organização. |
| **Não** | 0 | O papel ou instrumento não foi devidamente instituído na organização. |

---

## 🏗️ **2. NÍVEIS DE CAPACIDADE**

Diferentemente do nível de implementação, que foca em aspectos **quantitativos**, o nível de capacidade foca no aspecto **qualitativo**, e tem como objetivo avaliar o nível de efetividade da adequação de um controle. A avaliação é realizada **por controle**, e não por medida.

### **2.1 Tabela de Níveis de Capacidade (Tabela 4)**

| **Nível** | **Índice** | **Descrição** |
|-----------|------------|---------------|
| **0** | 0 | Ausência de capacidade para a implementação das medidas do controle, ou desconhecimento sobre o atendimento das medidas. |
| **1** | 20 | O controle atinge mais ou menos seu objetivo, por meio da aplicação de um conjunto incompleto de atividades que podem ser caracterizadas como iniciais ou intuitivas (pouco organizadas). |
| **2** | 40 | O controle atinge seu objetivo por meio da aplicação de um conjunto básico, porém completo, de atividades que podem ser caracterizadas como realizadas. |
| **3** | 60 | O controle atinge seu objetivo de forma muito mais organizada utilizando os recursos organizacionais. Além disso, o controle é formalizado por meio de uma política institucional, específica ou como parte de outra maior. |
| **4** | 80 | O controle atinge seu objetivo, é bem definido e suas medidas são implementadas continuamente por meio de um processo decorrente da política formalizada. |
| **5** | 100 | O controle atinge seu objetivo, é bem definido, suas medidas são implementadas continuamente por meio de um processo e seu desempenho é mensurado quantitativamente por meio de indicadores. |

---

## 🧮 **3. CÁLCULO DE MATURIDADE**

### **3.1 Maturidade por Controle (iMC)**

A maturidade é obtida por meio da relação entre a avaliação quantitativa e a qualitativa, considerando os níveis de implementação atribuídos às medidas e os níveis de capacidade atribuídos aos controles.

#### **Fórmula do Indicador de Maturidade por Controle:**

```
iMC = (∑PMC / (QMC - QMNAC)) / 2 * (1 + iNCC/100)
```

**Onde:**
- `iMC` = indicador de maturidade por controle
- `PMC` = somatório das pontuações das medidas avaliadas no controle
- `QMC` = quantidade de medidas do controle
- `QMNAC` = quantidade de medidas não aplicáveis do controle
- `iNCC` = índice do nível de capacidade do controle

#### **Observações Importantes:**

1. **Divisão por 2**: A fórmula divide o índice base por 2, resultando em scores mais conservadores
2. **Medidas não respondidas**: São consideradas como peso 0 no cálculo
3. **Medidas "Não se aplica"**: São excluídas tanto do numerador quanto do denominador
4. **Multiplicador INCC**: Amplifica a maturidade baseada na capacidade do controle

### **3.2 Classificação de Maturidade (Tabela 5)**

| **iMC** | **Nível de Maturidade** |
|---------|------------------------|
| 0,00 a 0,29 | Inicial |
| 0,30 a 0,49 | Básico |
| 0,50 a 0,69 | Intermediário |
| 0,70 a 0,89 | Em Aprimoramento |
| 0,90 a 1,00 | Aprimorado |

### **3.3 Indicadores de Segurança (iSeg) e Privacidade (iPriv)**

#### **Fórmula de avaliação do iSeg:**
```
iSeg = ((iMC₀ × 4) + ∑ᵢ₌₁¹⁸ iMCᵢ) / 22
```

**Onde:**
- `iSeg` = indicador de maturidade de segurança da informação
- `i` = número do controle avaliado, considerando os controles de 1 a 18 de Segurança
- `iMC` = indicador de maturidade por controle

#### **Fórmula de avaliação do iPriv:**
```
iPriv = ((iMC₀ × 4) + ∑ᵢ₌₁₉³¹ iMCᵢ) / 17
```

**Onde:**
- `iPriv` = indicador de maturidade de privacidade
- `i` = número do controle avaliado, considerando os controles de 19 a 31 de Privacidade
- `iMC` = indicador de maturidade por controle

#### **Peso do Controle 0:**

O **Controle 0 – Estrutura Básica de Gestão** recebe peso 4 (quatro) nas fórmulas devido à sua importância fundamental para a instituição dos papéis e instrumentos em conformidade com a PNSI e com a LGPD. Este controle é tratado separadamente dos demais controles, sendo essencial para a cultura organizacional quanto às duas temáticas.

### **3.4 Classificação Final (Tabela 6)**

Tanto o iSeg quanto o iPriv utilizam os mesmos níveis de maturidade:

| **iSeg / iPriv** | **Nível de Maturidade** |
|------------------|------------------------|
| 0,00 a 0,29 | Inicial |
| 0,30 a 0,49 | Básico |
| 0,50 a 0,69 | Intermediário |
| 0,70 a 0,89 | Em Aprimoramento |
| 0,90 a 1,00 | Aprimorado |

---

## 💻 **4. IMPLEMENTAÇÃO NO SISTEMA**

### **4.1 Arquivos Principais**

- **`src/lib/utils/calculations.ts`**: Contém a implementação correta da fórmula de maturidade
- **`src/lib/utils/maturity.ts`**: Utilitários de cálculo e classificação de maturidade
- **`src/lib/utils/utils.ts`**: Constantes de respostas, INCC e maturidade

### **4.2 Função Principal**

```typescript
export const calculateMaturityIndexForControle = (
  controle: Controle, 
  programaControle: ProgramaControle, 
  programaMedidas: ProgramaMedida[]
): string => {
  const sumOfResponses = calculateSumOfResponses(programaMedidas, controle.diagnostico);
  
  // Usar total de medidas (incluindo não respondidas), excluindo apenas "Não se aplica"
  const totalMedidas = programaMedidas.filter((pm) => {
    if (pm.resposta === 6) return false; // Excluir "Não se aplica"
    return true; // Incluir todas as outras
  }).length;
  
  if (totalMedidas === 0) return "0.00";

  const baseIndex = sumOfResponses / totalMedidas;
  const inccLevel = incc.find((incc) => incc.id === programaControle.nivel);
  const inccMultiplier = 1 + ((inccLevel?.nivel || 0) * 1 / 5);
  
  const finalScore = (baseIndex / 2) * inccMultiplier;
  
  return finalScore.toFixed(2);
};
```

### **4.3 Características da Implementação**

1. **✅ Conformidade com o Framework**: Implementa exatamente a fórmula oficial
2. **✅ Tratamento de Medidas Não Respondidas**: Consideradas como peso 0
3. **✅ Exclusão de "Não se aplica"**: Removidas do denominador conforme especificação
4. **✅ Diferentes Escalas por Diagnóstico**: Sim/Não para Diagnóstico 1, escala completa para 2 e 3
5. **✅ Multiplicador INCC**: Aplicado corretamente conforme capacidade do controle
6. **✅ Divisão por 2**: Implementada conforme fórmula oficial

---

## 📝 **5. EXEMPLO PRÁTICO**

### **Avaliação do Controle 0 – Estrutura Básica**

| **Medida** | **Nível de Implementação** | **∑PMC** | **QMC** | **QMNAC** | **Nível de Capacidade** | **iNCC** |
|------------|---------------------------|----------|---------|-----------|------------------------|----------|
| Medida 0.1 | Atendido (1) | | | | | |
| Medida 0.2 | Não Atendido (0) | | | | | |
| Medida 0.3 | Atendido (1) | 3,00 | 7 | 0 | Nível 2 | 40 |
| Medida 0.4 | Atendido (1) | | | | | |
| Medida 0.5 | Não Atendido (0) | | | | | |
| Medida 0.6 | Não Atendido (0) | | | | | |
| Medida 0.7 | Não Atendido (0) | | | | | |

**Aplicando a fórmula:**
```
iMC = (3,00 / (7-0)) / 2 * (1 + 40/100)
    = (3,00 / 7) / 2 * (1 + 40/100)
    = (0,43 / 2) * (1 + 40/100)
    = 0,21 * (1 + 40/100)
    = 0,21 * 1,40
    = 0,30
```

**Resultado**: O indicador de maturidade do Controle 0 seria **0,30** ou nível de maturidade **Básico**.

---

## 🔧 **6. VALIDAÇÃO E CONFORMIDADE**

### **6.1 Pontos de Conformidade Verificados**

- ✅ **Fórmula de cálculo**: Implementada exatamente conforme especificação oficial
- ✅ **Tabelas de pontuação**: Todas as tabelas (2, 3, 4, 5 e 6) implementadas corretamente
- ✅ **Peso do Controle 0**: Multiplicado por 4 nas fórmulas de iSeg e iPriv
- ✅ **Tratamento de "Não se aplica"**: Excluído corretamente dos cálculos
- ✅ **Níveis INCC**: Implementados conforme tabela oficial
- ✅ **Classificação de maturidade**: Faixas implementadas conforme especificação

### **6.2 Melhorias Implementadas**

1. **Correção do cálculo de medidas não respondidas**: Agora são consideradas como peso 0
2. **Sincronização de dados**: Interface reflete mudanças instantaneamente
3. **Cache inteligente**: Evita recálculos desnecessários
4. **Validação de dados**: Garante integridade dos cálculos

---

## 📚 **7. REFERÊNCIAS**

- **Guia do Framework de Privacidade e Segurança da Informação** (Documento oficial)
- **Tabelas 2, 3, 4, 5 e 6** do Framework oficial
- **Fórmulas oficiais** para cálculo de iMC, iSeg e iPriv
- **Implementação técnica** em `src/lib/utils/calculations.ts`

---

## 📋 **8. CONTROLE DE VERSÃO**

| **Versão** | **Data** | **Alterações** |
|------------|----------|----------------|
| 1.0 | 2024-01-XX | Documentação inicial baseada no guia oficial |
| 1.1 | 2024-01-XX | Correções de conformidade com framework |
| 1.2 | 2024-01-XX | Validação completa da implementação |

---

**📌 Nota**: Esta documentação garante que a implementação do sistema FPSI está em total conformidade com a metodologia oficial do Framework de Privacidade e Segurança da Informação, proporcionando avaliações precisas e confiáveis da maturidade organizacional.
