import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

// Define a estrutura dos dados do usuário
interface User {
  id: string;
  email: string;
  role: string;
}

// Define a estrutura da resposta que o backend envia no login
interface AuthResponse {
    token: string;
    user: User;
}

// Define tudo que o nosso Contexto de Autenticação vai fornecer para a aplicação
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

// Cria o Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o Provedor, que é o componente que vai "abraçar" a aplicação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Começa carregando

  // Função para verificar se existe um token válido no navegador
  const checkAuth = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    
    if (token) {
      try {
        // Se tem token, vai no backend na rota '/me' para validar
        // e pegar os dados atualizados do usuário.
        const userData = await apiClient.get<User>('/me');
        setUser(userData);
      } catch (error) {
        // Se o token for inválido (expirado, etc), limpa tudo.
        console.error("Falha na autenticação com token:", error);
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
    setLoading(false); // Termina o carregamento
  }, []);

  // Roda a verificação de autenticação assim que o app carrega
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Função de Login
  const login = async (email: string, password: string) => {
    // Chama a rota de login no backend
    const response = await apiClient.post<AuthResponse, any>('/auth/login', { email, password });
    if (response.token && response.user) {
        // Se o login der certo, salva o token e os dados do usuário
        localStorage.setItem('authToken', response.token);
        setUser(response.user);
    }
  };

  // Função de Logout
  const logout = () => {
    // Limpa o token e os dados do usuário
    localStorage.removeItem('authToken');
    setUser(null);
    // Manda o usuário de volta pra tela de login
    window.location.href = '/login';
  };

  // Monta o objeto com tudo que o Provedor vai oferecer
  const value = { 
      user, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!user // 'isAuthenticated' é true se 'user' não for nulo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar o uso do contexto em outros componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};