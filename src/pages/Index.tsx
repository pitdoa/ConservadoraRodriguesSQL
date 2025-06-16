import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Login } from "@/components/Login";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { Funcionarias } from "@/components/Funcionarias";
import { Condominios } from "@/components/Condominios";
import { Escalas } from "@/components/Escalas";
import { Faltas } from "@/components/Faltas";
import { Relatorios } from "@/components/Relatorios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, LogOut } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Rocket } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'funcionarias':
        return <Funcionarias />;
      case 'condominios':
        return <Condominios />;
      case 'escalas':
        return <Escalas />;
      case 'faltas':
        return <Faltas />;
      case 'relatorios':
        return <Relatorios />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 bg-white border-b border-border flex items-center justify-between">
            <SidebarTrigger />
            <div className="flex items-center gap-5">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Rocket className="h-3 w-3 text-muted-foreground" />
                Versão 1.0.1
              </p>
              <Button 
                variant="outline" 
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto h-[calc(100vh-100px)]">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

// Componente temporário para seções em desenvolvimento
const ComingSoon = ({ title }: { title: string }) => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground">Esta funcionalidade estará disponível em breve</p>
    </div>
    <Card className="text-center py-20">
      <CardContent>
        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
        <h3 className="text-xl font-medium text-foreground mb-3">Em Desenvolvimento</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Estamos trabalhando para trazer esta funcionalidade para você. 
          Enquanto isso, explore as outras seções do sistema.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default Index;
