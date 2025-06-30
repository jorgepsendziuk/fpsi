# Sistema de Maturidade Inteligente para Diagnósticos

## **Visão Geral**
Sistema implementado para calcular e exibir índices de maturidade dos diagnósticos de forma inteligente na interface de árvore com carregamento sob demanda, resolvendo o problema onde os índices só apareciam após alterações em controles.

## **Problema Resolvido**
- **Antes**: Diagnósticos só mostravam maturidade após mudanças em controles
- **Depois**: Diagnósticos mostram maturidade desde o carregamento inicial
- **Estratégia**: Carregamento automático e estimativas inteligentes

## **Implementação**

### **1. Estado de Carregamento Automático**
```typescript
const [autoLoadingControles, setAutoLoadingControles] = useState<Set<number>>(new Set());
```

### **2. Função de Cálculo Inteligente**
A função `calculateMaturity` foi reescrita com três estratégias:

#### **Estratégia 1: Sem Controles → Carregamento Automático**
```typescript
if (diagnosticoControles.length === 0) {
  // Carregar controles assincronamente
  if (!autoLoadingControles.has(diagnostico.id) && !loadingControles.has(diagnostico.id)) {
    loadControles(diagnostico.id);
  }
  
  // Estado visual durante carregamento
  return { score: 0, label: 'Carregando...', rawScore: 0 };
}
```

#### **Estratégia 2: Poucos Dados → Estimativa por INCC**
```typescript
const percentualComMedidas = controlComMedidas.length / diagnosticoControles.length;

if (percentualComMedidas < 0.5) {
  // Calcular média dos níveis INCC dos controles
  const mediaINCC = diagnosticoControles.reduce((sum, controle) => {
    return sum + (controle.nivel || 1);
  }, 0) / diagnosticoControles.length;
  
  // Converter para score estimado (máximo 0.6)
  const estimatedScore = Math.min(((mediaINCC - 1) * 0.15), 0.6);
  
  return {
    score: estimatedScore,
    label: `${label} (Estimativa)`,
    rawScore: estimatedScore
  };
}
```

#### **Estratégia 3: Dados Suficientes → Cálculo Real**
```typescript
const maturityData = getDiagnosticoMaturity(diagnostico, diagnosticoControles, medidas);
return { 
  score: maturityData.score,
  label: maturityData.label,
  rawScore: maturityData.score
};
```

## **Lógica de Estimativa**

### **Mapeamento INCC → Score Estimado**
| Nível INCC | Score Estimado | Faixa        |
|------------|----------------|--------------|
| 1          | 0.00           | Inicial      |
| 2          | 0.15           | Inicial      |
| 3          | 0.30           | Básico       |
| 4          | 0.45           | Básico       |
| 5          | 0.60           | Intermediário|
| 6          | 0.75           | Em Aprimoramento |

### **Limitações da Estimativa**
- **Máximo conservador**: 0.6 (Intermediário)
- **Indicação visual**: Labels incluem "(Estimativa)"
- **Transição automática**: Para cálculo real quando dados carregam

## **Estados Visuais**

### **1. Carregando**
```typescript
{ score: 0, label: 'Carregando...', rawScore: 0 }
```

### **2. Estimativa**
```typescript
{ score: 0.3, label: 'Básico (Estimativa)', rawScore: 0.3 }
```

### **3. Real**
```typescript
{ score: 0.75, label: 'Em Aprimoramento', rawScore: 0.75 }
```

## **Carregamento Automático**

### **Gatilhos de Carregamento**
1. **Diagnóstico sem controles**: Auto-carrega controles
2. **Controle sem medidas**: Auto-carrega medidas (já implementado)
3. **Cache expirado**: Recarrega automaticamente

### **Prevenção de Loops**
```typescript
// Evitar carregamentos duplicados
if (!autoLoadingControles.has(diagnostico.id) && !loadingControles.has(diagnostico.id)) {
  // Iniciar carregamento
  setAutoLoadingControles(prev => new Set(prev).add(diagnostico.id));
  
  loadControles(diagnostico.id).then(() => {
    // Limpar estado e invalidar cache
    setAutoLoadingControles(prev => {
      const newSet = new Set(prev);
      newSet.delete(diagnostico.id);
      return newSet;
    });
    invalidateCache('diagnostico', diagnostico.id);
  });
}
```

## **Invalidação de Cache**

### **Eventos que Invalidam**
1. **Mudança de resposta**: Invalida controle e diagnóstico
2. **Mudança de INCC**: Invalida controle e diagnóstico  
3. **Carregamento concluído**: Invalida para recálculo

### **Implementação**
```typescript
// Invalidar cache do controle e diagnóstico afetados
invalidateCache('controle', controleId);

// Encontrar e invalidar o diagnóstico correspondente
const diagnostico = diagnosticos.find(d => {
  const diagnosticoControles = controles[d.id] || [];
  return diagnosticoControles.some(c => c.id === controleId);
});
if (diagnostico) {
  invalidateCache('diagnostico', diagnostico.id);
}
```

## **Integração com MaturityChip**

### **Cores por Faixa de Maturidade**
- **0.90-1.00**: Verde Escuro (#2E7D32) - Aprimorado
- **0.70-0.89**: Verde (#4CAF50) - Em Aprimoramento  
- **0.50-0.69**: Amarelo (#FFC107) - Intermediário
- **0.30-0.49**: Laranja (#FF9800) - Básico
- **0.00-0.29**: Vermelho (#FF5252) - Inicial

### **Uso no Componente**
```typescript
{node.maturityScore !== undefined && (
  <MaturityChip
    score={node.maturityScore}
    label={node.maturityLabel || ''}
    size="small"
    animated={true}
  />
)}
```

## **Performance**

### **Otimizações Implementadas**
1. **Cache com TTL**: Evita recálculos desnecessários
2. **Carregamento sob demanda**: Só carrega quando necessário
3. **Estados de loading**: Evita carregamentos duplicados
4. **Estimativas rápidas**: Evita bloqueios de UI

### **Métricas Esperadas**
- **Tempo inicial**: <100ms para estimativas
- **Carregamento real**: 200-500ms dependendo da rede
- **Memory usage**: Mínimo (cache com TTL)

## **Benefícios Alcançados**

### **1. UX Melhorada**
- ✅ Índices visíveis desde o carregamento
- ✅ Feedback visual durante carregamento
- ✅ Transição suave de estimativa para real
- ✅ Sem travamentos ou delays perceptíveis

### **2. Performance**
- ✅ Carregamento otimizado sob demanda
- ✅ Cache inteligente com invalidação
- ✅ Prevenção de loops infinitos
- ✅ Estados de loading controlados

### **3. Consistência**
- ✅ Sistema unificado para controles e diagnósticos
- ✅ Cores e labels padronizados
- ✅ Estimativas conservadoras e realistas
- ✅ Atualizações automáticas

## **Manutenção**

### **Logs de Debug (Removidos)**
Sistema foi implementado com logs detalhados para debug, mas foram completamente removidos após confirmação do funcionamento para manter performance em produção.

### **Testes Recomendados**
1. **Carregamento inicial**: Verificar estimativas
2. **Carregamento progressivo**: Verificar transições
3. **Mudanças de dados**: Verificar invalidação
4. **Estados de erro**: Verificar fallbacks

### **Pontos de Atenção**
- Monitorar performance do carregamento automático
- Verificar precisão das estimativas vs. valores reais
- Acompanhar invalidação do cache
- Observar comportamento em redes lentas 