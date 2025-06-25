import { useEffect } from 'react';

export const useAuthTranslation = () => {
  useEffect(() => {
    const translateAuthTexts = () => {
      // Mapeamento de traduções
      const translations: Record<string, string> = {
        'Sign in to your account': 'Acesse sua conta',
        'Sign up for your account': 'Criar sua conta',
        'Sign in': 'Entrar',
        'Sign up': 'Cadastrar',
        'Email': 'E-mail',
        'Password': 'Senha',
        'Remember me': 'Lembrar-me',
        'Forgot your password?': 'Esqueceu a senha?',
        'No account? Sign up': 'Não tem conta? Cadastre-se',
        'Create account': 'Criar conta',
        'Confirm Password': 'Confirmar Senha',
        'Reset your password': 'Redefinir sua senha',
        'Send code': 'Enviar código',
        'Back to Sign In': 'Voltar ao Login',
        'Enter your email': 'Digite seu e-mail',
        'Enter your password': 'Digite sua senha',
        'Confirmation Code': 'Código de Confirmação',
        'Create a new account': 'Criar uma nova conta',
        'Already have an account?': 'Já tem uma conta?',
        'Register': 'Cadastrar',
        // Variações adicionais que podem aparecer
        'Create your account': 'Criar sua conta',
        'Sign up for an account': 'Criar uma conta',
        'Join us': 'Junte-se a nós',
        'Get started': 'Começar'
      };

      // Função para substituir texto em elementos
      const replaceTextInElement = (element: Element) => {
        // Verificar se é um nó de texto
        if (element.nodeType === Node.TEXT_NODE) {
          const textContent = element.textContent?.trim();
          if (textContent && translations[textContent]) {
            element.textContent = translations[textContent];
          }
          return;
        }

        // Para elementos, verificar text content direto
        const directText = element.textContent?.trim();
        if (directText && translations[directText]) {
          // Se o elemento só tem texto (sem filhos HTML), substituir diretamente
          if (element.children.length === 0) {
            element.textContent = translations[directText];
            return;
          }
        }

        // Recursivamente verificar filhos
        Array.from(element.childNodes).forEach(child => {
          if (child.nodeType === Node.TEXT_NODE) {
            const textContent = child.textContent?.trim();
            if (textContent && translations[textContent]) {
              child.textContent = translations[textContent];
            }
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            replaceTextInElement(child as Element);
          }
        });
      };

      // Aplicar traduções
      const authElements = document.querySelectorAll('[data-testid*="auth"], .MuiCard-root, .MuiPaper-root');
      authElements.forEach(element => {
        replaceTextInElement(element);
      });

      // Tradução específica para elementos comuns
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        const text = heading.textContent?.trim();
        if (text && translations[text]) {
          heading.textContent = translations[text];
        }
      });

      // Tradução para botões
      const buttons = document.querySelectorAll('button, input[type="submit"]');
      buttons.forEach(button => {
        const text = button.textContent?.trim();
        if (text && translations[text]) {
          button.textContent = translations[text];
        }
      });

      // Tradução para labels
      const labels = document.querySelectorAll('label');
      labels.forEach(label => {
        const text = label.textContent?.trim();
        if (text && translations[text]) {
          label.textContent = translations[text];
        }
      });
    };

    // Executar imediatamente
    translateAuthTexts();

    // Executar após um pequeno delay para garantir que o componente foi renderizado
    const timer = setTimeout(translateAuthTexts, 100);

    // Observer para mudanças no DOM (caso o componente re-renderize)
    const observer = new MutationObserver(() => {
      translateAuthTexts();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
}; 