# 📊 SISTEMA DE CÁLCULO DE MATURIDADE - FPSI (IMPLEMENTAÇÃO CORRETA)

## 🔍 **VISÃO GERAL**

O sistema FPSI utiliza a **implementação correta** localizada em `src/app/diagnostico/utils.ts` para calcular a maturidade organizacional. Esta documentação explica o funcionamento real e correto do sistema.

---

## 🏗️ **ESTRUTURA CORRETA DOS CÁLCULOS**

### **Implementação Principal:**
- **📁 Arquivo**: `src/app/diagnostico/utils.ts`
- **🎯 Função**: `calculateMaturityIndexForControle`
- **📊 Suporte**: `calculateSumOfResponses`

---

## 🔢 **CÁLCULO DE RESPOSTAS: `calculateSumOfResponses`**

```typescript
export const calculateSumOfResponses = (programaMedidas: ProgramaMedida[], diagnostico: number): number => {
  return programaMedidas.reduce((sum, programaMedida) => {
    if (programaMedida.resposta === undefined || programaMedida.resposta === null) return sum;

    let resposta: Resposta | undefined;
    const respostaId = typeof programaMedida.resposta === 'string' ? parseInt(programaMedida.resposta, 10) : programaMedida.resposta;

    // LÓGICA ESPECÍFICA POR DIAGNÓSTICO:
    if (diagnostico === 1) {
      resposta = respostasimnao.find((resposta) => resposta.id === respostaId);
    } else if (diagnostico === 2 || diagnostico === 3) {
      resposta = respostas.find((resposta) => resposta.id === respostaId);
    }

    if (resposta?.peso === null) return sum;
    return sum + (resposta?.peso || 0);
  }, 0);
};
```

### **Como funciona:**

#### **1. Diagnóstico 1 (Sim/Não):**
```javascript
respostasimnao = [
  { id: 1, peso: 1, label: "Sim" },
  { id: 2, peso: 0, label: "Não" }
];

// Exemplo: 3 medidas com respostas [1, 1, 2]
// Resultado: 1 + 1 + 0 = 2
```

#### **2. Diagnósticos 2 e 3 (Escala de Maturidade):**
```javascript
respostas = [
  { id: 1, peso: 1, label: "Adota em maior parte ou totalmente" },
  { id: 2, peso: 0.75, label: "Adota em menor parte" },
  { id: 3, peso: 0.5, label: "Adota parcialmente" },
  { id: 4, peso: 0.25, label: "Há decisão formal ou plano aprovado para implementar" },
  { id: 5, peso: 0, label: "A organização não adota essa medida" },
  { id: 6, peso: null, label: "Não se aplica" }
];

// Exemplo: 4 medidas com respostas [1, 2, 3, 4]
// Resultado: 1 + 0.75 + 0.5 + 0.25 = 2.5
```

---

## ⚙️ **CÁLCULO DE CONTROLE: `calculateMaturityIndexForControle`**

```typescript
export const calculateMaturityIndexForControle = (
  controle: Controle, 
  programaControle: ProgramaControle, 
  programaMedidas: ProgramaMedida[]
): string => {
  const sumOfResponses = calculateSumOfResponses(programaMedidas, controle.diagnostico);
  const numberOfMedidas = programaMedidas.filter((pm) => pm.resposta !== undefined && pm.resposta !== null).length;
  
  if (numberOfMedidas === 0) return "0";

  const baseIndex = sumOfResponses / numberOfMedidas;
  const inccMultiplier = 1 + (((incc.find((incc) => incc.id === programaControle.nivel)?.nivel || 0)) * 1 / 5);
  
  return ((baseIndex / 2) * inccMultiplier).toFixed(2);
};
```

### **Fórmula Detalhada:**

#### **1. Média das Respostas:**
```javascript
baseIndex = sumOfResponses / numberOfMedidas
```

#### **2. Multiplicador INCC:**
```javascript
// Array INCC:
incc = [
  { id: 1, nivel: 0, indice: 0 },   // → multiplicador: 1.0
  { id: 2, nivel: 1, indice: 20 },  // → multiplicador: 1.2  
  { id: 3, nivel: 2, indice: 40 },  // → multiplicador: 1.4
  { id: 4, nivel: 3, indice: 60 },  // → multiplicador: 1.6
  { id: 5, nivel: 4, indice: 80 },  // → multiplicador: 1.8
  { id: 6, nivel: 5, indice: 100 }, // → multiplicador: 2.0
];

inccMultiplier = 1 + (incc.nivel * 1 / 5)
```

#### **3. Resultado Final:**
```javascript
finalScore = (baseIndex / 2) * inccMultiplier
```

### **Exemplo Completo:**

```javascript
// Controle do Diagnóstico 2 com INCC nível 3:
medidas = [
  { resposta: 1 },  // peso 1
  { resposta: 2 },  // peso 0.75
  { resposta: 3 },  // peso 0.5
  { resposta: 4 }   // peso 0.25
];

// 1. Soma das respostas
sumOfResponses = 1 + 0.75 + 0.5 + 0.25 = 2.5

// 2. Média das respostas  
baseIndex = 2.5 / 4 = 0.625

// 3. Multiplicador INCC (nível 3 = incc.nivel 2)
inccMultiplier = 1 + (2 * 1 / 5) = 1.4

// 4. Resultado final
finalScore = (0.625 / 2) * 1.4 = 0.4375
```

---

## 🎯 **CÁLCULO DE DIAGNÓSTICO**

### **Implementação na Página:**

```typescript
const calculateDiagnosticoMaturityCorrect = (diagnosticoId: number): { score: number, label: string } => {
  const controles = state.controles?.[diagnosticoId] || [];
  const controlesDoPrograma = controles.filter((controle: any) => controle.programa === programaId);

  if (controlesDoPrograma.length === 0) {
    return { score: 0, label: "Inicial" };
  }

  let totalMaturitySum = 0;
  let controlesWithData = 0;

  controlesDoPrograma.forEach((controle: any) => {
    const programaControle = {
      id: controle.programa_controle_id || 0,
      programa: programaId,
      controle: controle.id,
      nivel: controle.nivel || 1
    };

    const medidas = state.medidas?.[controle.id] || [];
    
    if (medidas.length > 0) {
      const programaMedidas = medidas.map((medida: any) => ({
        id: medida.programa_medida?.id || medida.id,
        medida: medida.id,
        controle: controle.id,
        programa: programaId,
        resposta: medida.programa_medida?.resposta || medida.resposta,
      }));

      const controleMaturityStr = calculateMaturityIndexForControle(controle, programaControle, programaMedidas);
      const controleMaturity = parseFloat(controleMaturityStr);
      
      if (!isNaN(controleMaturity)) {
        totalMaturitySum += controleMaturity;
        controlesWithData++;
      }
    }
  });

  if (controlesWithData === 0) {
    return { score: 0, label: "Inicial" };
  }

  // MÉDIA SIMPLES DOS CONTROLES
  const averageMaturity = totalMaturitySum / controlesWithData;
  const maturityLabel = getMaturityLabel(averageMaturity);

  return { 
    score: averageMaturity, 
    label: maturityLabel || "Inicial" 
  };
};
```

### **Lógica:**
1. **Filtra controles** do programa específico
2. **Para cada controle** com medidas:
   - Converte dados para formato `ProgramaMedida`
   - Calcula maturidade usando `calculateMaturityIndexForControle`
   - Acumula resultado
3. **Média simples** de todos os controles com dados
4. **Classifica** resultado usando `getMaturityLabel`

---

## 📈 **FAIXAS DE MATURIDADE**

```typescript
export const maturidade = [
  { id: 1, min: 0, max: 0.29, label: "Inicial" },
  { id: 2, min: 0.3, max: 0.49, label: "Básico" },
  { id: 3, min: 0.5, max: 0.69, label: "Intermediário" },
  { id: 4, min: 0.7, max: 0.89, label: "Em Aprimoramento" },
  { id: 5, min: 0.9, max: 1, label: "Aprimorado" },
];
```

---

## 🔧 **CARACTERÍSTICAS IMPORTANTES**

### **1. ✅ Divisão por 2**
A fórmula **divide por 2** o baseIndex, resultando em scores mais conservadores:
```javascript
finalScore = (baseIndex / 2) * inccMultiplier
```

### **2. ✅ Diferentes Escalas por Diagnóstico**
- **Diagnóstico 1**: Respostas Sim/Não (0 ou 1)
- **Diagnósticos 2-3**: Escala de maturidade (0 a 1)

### **3. ✅ INCC como Multiplicador**
INCC amplifica a maturidade baseada na importância/complexidade do controle.

### **4. ✅ Média Simples para Diagnóstico**
Não usa peso INCC no nível de diagnóstico, apenas média aritmética dos controles.

---

## 🚀 **IMPLEMENTAÇÃO ATUAL**

### **Página Principal:**
📁 `src/app/programas/[id]/diagnosticos/page.tsx`

### **Função Principal:**
`calculateDiagnosticoMaturityCorrect()`

### **Utilitários Usados:**
- `calculateMaturityIndexForControle()` 
- `calculateSumOfResponses()`
- `getMaturityLabel()`

---

## 📊 **EXEMPLO REAL DE CÁLCULO**

```javascript
// Diagnóstico 2, Programa 1:
// Controle A (INCC nível 2):
//   - Medida 1: resposta 1 (peso 1.0)
//   - Medida 2: resposta 3 (peso 0.5)
//   
// Controle B (INCC nível 4):
//   - Medida 3: resposta 2 (peso 0.75)
//   - Medida 4: resposta 4 (peso 0.25)

// CONTROLE A:
// sumOfResponses = 1.0 + 0.5 = 1.5
// baseIndex = 1.5 / 2 = 0.75
// inccMultiplier = 1 + (1 * 1/5) = 1.2  (nível 2 → incc.nivel = 1)
// scoreA = (0.75 / 2) * 1.2 = 0.45

// CONTROLE B:
// sumOfResponses = 0.75 + 0.25 = 1.0
// baseIndex = 1.0 / 2 = 0.5
// inccMultiplier = 1 + (3 * 1/5) = 1.6  (nível 4 → incc.nivel = 3)
// scoreB = (0.5 / 2) * 1.6 = 0.4

// DIAGNÓSTICO:
// averageMaturity = (0.45 + 0.4) / 2 = 0.425
// label = "Básico" (0.3-0.49)
```

---

## ✅ **VALIDAÇÃO**

O sistema está funcionando corretamente com:
- ✅ Cálculos baseados na implementação original (`utils.ts`)
- ✅ Diferentes escalas por tipo de diagnóstico
- ✅ Aplicação correta do fator INCC
- ✅ Média simples para diagnósticos
- ✅ Classificação correta de maturidade

**🎯 RESULTADO: Sistema de maturidade funcionando com a implementação correta e original!** 