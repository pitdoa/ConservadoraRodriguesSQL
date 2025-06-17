import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AppSidebar from './components/AppSidebar';
import Condominios from './components/Condominios';
import Dashboard from './components/Dashboard';
import Escalas from './components/Escalas';
import Faltas from './components/Faltas';
import Funcionarias from './components/Funcionarias';
import Relatorios from './components/Relatorios';
import Login from './components/Login';
import { Toaster } from './components/ui/toaster';

// Componente para proteger rotas que exigem login
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  // Enquanto verifica a autenticação, mostra uma mensagem
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Carregando...</div>;
  }

  // Se não estiver autenticado, redireciona para a tela de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, mostra o conteúdo da rota
  return children;
}

// Layout principal do sistema (com a barra lateral)
function MainLayout({ children }: { children: JSX.Element }) {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <AppSidebar />
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

function App() {
  return (
    // O AuthProvider envolve toda a aplicação
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota pública de Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Agrupador para todas as rotas protegidas */}
          <Route 
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/condominios" element={<Condominios />} />
                    <Route path="/funcionarias" element={<Funcionarias />} />
                    <Route path="/escalas" element={<Escalas />} />
                    <Route path="/faltas" element={<Faltas />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    {/* Qualquer outra rota não encontrada dentro do sistema, volta para o Dashboard */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
