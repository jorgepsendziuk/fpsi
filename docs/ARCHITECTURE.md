# Documentação de Arquitetura - FPSI

## 1. Diagrama de Contexto

O FPSI é uma ferramenta web que permite às organizações gerenciar e avaliar sua conformidade com a LGPD através de diagnósticos de maturidade e gestão de controles de segurança.

### Principais Stakeholders:
- Usuários (Gestores de Segurança, DPOs)
- Administradores do Sistema
- Equipe de Desenvolvimento
- Equipe de Operações

### Integrações Externas:
- Supabase (Autenticação e Banco de Dados)
- Serviços de Email (Notificações)
- Serviços de Backup

## 2. Diagrama de Containers

### 2.1 Frontend (Next.js)
- **Aplicação Web**: Interface do usuário construída com Next.js e Material-UI
- **Gerenciamento de Estado**: Context API e Hooks personalizados
- **Autenticação**: Integração com Supabase Auth
- **Armazenamento Local**: LocalStorage para cache e preferências

### 2.2 Backend (Supabase)
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage para arquivos
- **API**: RESTful endpoints

### 2.3 Infraestrutura
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Monitoramento**: Vercel Analytics
- **Logs**: Vercel Logs

## 3. Diagrama de Componentes

### 3.1 Módulo de Autenticação
- `AuthProvider`: Gerenciamento de estado de autenticação
- `LoginForm`: Formulário de login
- `RegisterForm`: Formulário de registro
- `PasswordReset`: Recuperação de senha

### 3.2 Módulo de Diagnóstico
- `DiagnosticoContainer`: Lógica de negócio
- `DiagnosticoForm`: Formulário de diagnóstico
- `DiagnosticoList`: Lista de diagnósticos
- `DiagnosticoDetail`: Detalhes do diagnóstico

### 3.3 Módulo de Controles
- `ControleContainer`: Lógica de negócio
- `ControleForm`: Formulário de controle
- `ControleList`: Lista de controles
- `ControleDetail`: Detalhes do controle

### 3.4 Módulo de Responsáveis
- `ResponsavelContainer`: Lógica de negócio
- `ResponsavelForm`: Formulário de responsável
- `ResponsavelList`: Lista de responsáveis
- `ResponsavelDetail`: Detalhes do responsável

### 3.5 Módulo de Relatórios
- `RelatorioContainer`: Lógica de negócio
- `RelatorioGenerator`: Gerador de relatórios
- `RelatorioViewer`: Visualizador de relatórios
- `RelatorioExport`: Exportação de relatórios

## 4. Diagrama de Código

### 4.1 Estrutura de Diretórios
```
src/
├── app/                    # Aplicação principal
│   ├── auth/              # Módulo de autenticação
│   ├── diagnostico/       # Módulo de diagnóstico
│   ├── controle/          # Módulo de controles
│   ├── responsavel/       # Módulo de responsáveis
│   └── relatorio/         # Módulo de relatórios
├── components/            # Componentes compartilhados
├── contexts/             # Contextos React
├── providers/            # Provedores de serviços
└── utils/               # Utilitários globais
```

### 4.2 Padrões de Implementação

#### Componentes React
```typescript
// Exemplo de componente
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```

#### Hooks Personalizados
```typescript
// Exemplo de hook
const useDiagnostico = (id: string) => {
  const [diagnostico, setDiagnostico] = useState<IDiagnostico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDiagnostico = async () => {
      try {
        const data = await supabase
          .from('diagnosticos')
          .select('*')
          .eq('id', id)
          .single();
        setDiagnostico(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostico();
  }, [id]);

  return { diagnostico, loading, error };
};
```

#### Contextos
```typescript
// Exemplo de contexto
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 4.3 Fluxos de Dados

#### Autenticação
1. Usuário acessa a aplicação
2. Sistema verifica token JWT
3. Se inválido, redireciona para login
4. Se válido, carrega dados do usuário

#### Diagnóstico
1. Usuário inicia novo diagnóstico
2. Sistema carrega controles disponíveis
3. Usuário preenche avaliações
4. Sistema calcula maturidade
5. Dados são salvos no Supabase

#### Controles
1. Usuário acessa lista de controles
2. Sistema carrega controles do banco
3. Usuário pode criar/editar/excluir
4. Alterações são sincronizadas

#### Relatórios
1. Usuário solicita relatório
2. Sistema gera PDF/Excel
3. Arquivo é disponibilizado para download
4. Log é registrado no sistema

## 5. Considerações Técnicas

### 5.1 Segurança
- Autenticação via Supabase Auth
- Autorização baseada em roles
- Validação de inputs
- Sanitização de outputs
- Proteção contra CSRF
- Rate limiting

### 5.2 Performance
- Lazy loading de componentes
- Caching de dados
- Otimização de imagens
- Minificação de assets
- CDN para arquivos estáticos

### 5.3 Escalabilidade
- Arquitetura serverless
- Banco de dados otimizado
- Caching em múltiplas camadas
- Load balancing automático
- Monitoramento proativo

### 5.4 Manutenibilidade
- Código modular
- Documentação atualizada
- Testes automatizados
- CI/CD configurado
- Logs centralizados 