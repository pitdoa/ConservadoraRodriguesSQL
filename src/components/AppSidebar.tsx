
import { Building2, Calendar, Users, FileText, BarChart3, AlertTriangle, Home, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "#dashboard",
    icon: Home,
  },
  {
    title: "Funcionárias",
    url: "#funcionarias",
    icon: Users,
  },
  {
    title: "Condomínios",
    url: "#condominios",
    icon: Building2,
  },
  {
    title: "Escalas",
    url: "#escalas",
    icon: Calendar,
  },
  {
    title: "Faltas",
    url: "#faltas",
    icon: AlertTriangle,
  },
  {
    title: "Relatórios",
    url: "#relatorios",
    icon: BarChart3,
  },

];

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-5">
        <div className="leading-none">
          <h2 className="text-lg font-bold" style={{ color: '#0e2f1f' }}>CONSERVADORA</h2>
          <p className="text-base font-semibold" style={{ color: '#fbbd23' }}>RODRIGUES</p>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 font-medium">
            Sistema de Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => onSectionChange(item.url.replace('#', ''))}
                    isActive={activeSection === item.url.replace('#', '')}
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
