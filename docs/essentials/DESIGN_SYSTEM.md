# Design System - FPSI

## Visão Geral

O Design System do FPSI (Framework de Privacidade e Segurança da Informação) é baseado no Material-UI com o tema Refine Blue, proporcionando uma experiência consistente e moderna em toda a aplicação.

## Tema Base

- **Tema Light**: `RefineThemes.Blue`
- **Tema Dark**: `RefineThemes.BlueDark`
- **Localização**: Português Brasil (pt-BR)

## Paleta de Cores

### Cores Primárias
- **Primary**: Material-UI Blue (configurado via Refine Blue Theme)
- **Secondary**: Material-UI Secondary (configurado via Refine Blue Theme)

### Gradientes Padrão
```typescript
// Gradiente principal - usado em botões e elementos de destaque
background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`

// Gradiente suave - usado em backgrounds de seções
background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`

// Gradiente para hero sections
background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`
```

## Tipografia

### Títulos de Página (Page Headers)

**Padrão Principal** - Usado em páginas como "Programas":
```typescript
<Typography 
  variant="h3" 
  component="h1" 
  sx={{ 
    fontWeight: 'bold',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    mb: 1
  }}
>
  Título da Página
</Typography>
```

**Padrão Alternativo** - Usado em páginas como "Responsáveis":
```typescript
<Typography
  variant={isMobile ? "h5" : "h4"}
  fontWeight="bold"
  sx={{
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: 1
  }}
>
  Título da Página
</Typography>
```

### Hierarquia Tipográfica

1. **H1/H2**: Títulos principais de página (com gradiente)
2. **H3**: Títulos de seção
3. **H4**: Subtítulos importantes
4. **H5/H6**: Títulos de componentes e cards
5. **Body1**: Texto padrão
6. **Body2**: Texto secundário e descrições
7. **Caption**: Textos pequenos e metadados

## Componentes

### Cards

**Card Padrão**:
```typescript
<Card
  sx={{
    height: '100%',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: 4,
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: 6,
    }
  }}
>
```

**Card com Gradiente de Fundo**:
```typescript
<Card
  sx={{
    background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    borderRadius: 4,
  }}
>
```

### Botões

**Botão Principal**:
```typescript
<Button
  variant="contained"
  sx={{
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: 2,
    boxShadow: 3,
    '&:hover': {
      boxShadow: 6,
      transform: 'translateY(-2px)',
    }
  }}
>
```

**FAB (Floating Action Button)**:
```typescript
<Fab
  sx={{
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    boxShadow: 4,
    '&:hover': {
      boxShadow: 8,
      transform: 'scale(1.1)',
    },
    transition: 'all 0.3s ease-in-out',
  }}
>
```

### Accordions

Utilizam o hook `useThemeColors()` para estilos consistentes:

```typescript
import { useThemeColors } from '@/components/diagnostico/hooks/useThemeColors';

const { accordionStyles } = useThemeColors();

<Accordion sx={accordionStyles}>
```

### Dialogs/Modals

```typescript
<Dialog
  PaperProps={{
    sx: {
      borderRadius: 3,
      boxShadow: 8,
    }
  }}
>
```

## Layout e Espaçamento

### Container Padrão
```typescript
<Container maxWidth="lg" sx={{ py: 4 }}>
```

### Espaçamentos Padrão
- **Padding de seção**: `py: 4`
- **Margin bottom de elementos**: `mb: 2, mb: 3, mb: 4`
- **Gap em stacks**: `gap: 1, gap: 2`
- **Border radius padrão**: `borderRadius: 2, borderRadius: 3, borderRadius: 4`

## Animações e Transições

### Transições Padrão
```typescript
transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
transition: 'all 0.3s ease-in-out'
```

### Hover Effects
- **Cards**: `transform: 'translateY(-8px)'`
- **Botões**: `transform: 'translateY(-2px)'`
- **FABs**: `transform: 'scale(1.1)'`

## Estados e Feedback

### Loading States
- Uso de `Skeleton` components para carregamento
- `CircularProgress` para operações

### Toast/Snackbar
```typescript
<Snackbar
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert 
    severity={severity}
    sx={{ 
      width: '100%',
      borderRadius: 2,
      boxShadow: 4,
    }}
  >
```

## Responsividade

### Breakpoints
- **xs**: 0px (mobile)
- **sm**: 600px (tablet)
- **md**: 900px (desktop pequeno)
- **lg**: 1200px (desktop)
- **xl**: 1536px (desktop grande)

### Grid System
```typescript
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4}>
```

## Acessibilidade

- Uso de `aria-label` em botões sem texto
- Contraste adequado entre cores
- Suporte a modo escuro
- Navegação por teclado

## Utilities

### Hook de Cores do Tema
```typescript
import { useThemeColors } from '@/components/diagnostico/hooks/useThemeColors';

const { 
  getContrastTextColor,
  getBackgroundContrastColor,
  accordionStyles,
  theme 
} = useThemeColors();
```

### Utilitários de Design System
```typescript
import { 
  getTitleStyles, 
  getCardStyles, 
  getButtonStyles,
  getGradientBackground 
} from '@/lib/utils/designSystem';

// Aplicar estilos de título
const titleStyles = getTitleStyles(theme, 'secondary', isMobile);

// Aplicar estilos de card
const cardStyles = getCardStyles(theme, 'gradient');
```

### Context de Modo de Cor
```typescript
import { ColorModeContext } from '@contexts/color-mode';

const { mode, setMode } = useContext(ColorModeContext);
```

## Componentes Padronizados

### PageTitle
Componente para títulos padronizados:

```typescript
import { PageTitle } from '@/components/common';

// Título principal da página
<PageTitle variant="secondary" icon={<SecurityIcon />}>
  Diagnóstico
</PageTitle>

// Título de seção
<PageTitle variant="section-header">
  Configurações
</PageTitle>
```

### StandardCard
Componente de card padronizado:

```typescript
import { StandardCard } from '@/components/common';

<StandardCard variant="gradient">
  <CardContent>Conteúdo do card</CardContent>
</StandardCard>
```

### StandardButton
Componentes de botão padronizados:

```typescript
import { StandardButton, StandardFab } from '@/components/common';

// Botão principal
<StandardButton buttonVariant="primary" startIcon={<AddIcon />}>
  Criar Programa
</StandardButton>

// FAB
<StandardFab>
  <AddIcon />
</StandardFab>
```

## Boas Práticas

1. **Consistência**: Sempre use os padrões definidos
2. **Responsividade**: Teste em diferentes tamanhos de tela
3. **Acessibilidade**: Considere usuários com necessidades especiais
4. **Performance**: Use lazy loading e otimizações quando necessário
5. **Manutenibilidade**: Prefira componentes reutilizáveis

## Exemplos de Implementação

### Página com Header Padrão
```typescript
<Container maxWidth="lg" sx={{ py: 4 }}>
  <Box sx={{ mb: 6 }}>
    <Typography 
      variant="h3" 
      component="h1" 
      sx={{ 
        fontWeight: 'bold',
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        mb: 1
      }}
    >
      Título da Página
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Descrição da página
    </Typography>
    <Divider sx={{ mt: 2 }} />
  </Box>
  
  {/* Conteúdo da página */}
</Container>
```
