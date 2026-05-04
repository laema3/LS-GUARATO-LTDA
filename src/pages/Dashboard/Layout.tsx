import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Info, LayoutDashboard, FileText, LogOut, Briefcase, Settings2, Settings, MessageSquare } from "lucide-react";

export const DashboardLayout = () => {
  const location = useLocation();

  const menu = [
    { name: "Ajustes da Empresa", path: "/admin/ajustes", icon: Settings },
    { name: "Cabeçalho e Logo", path: "/admin/cabecalho", icon: LayoutDashboard },
    { name: "Candidatos / Currículos", path: "/admin/candidatos", icon: Briefcase },
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
    { name: "Página Home", path: "/admin/home", icon: Home },
    { name: "Página Sobre", path: "/admin/sobre", icon: Info },
    { name: "Rodapé", path: "/admin/rodape", icon: LayoutDashboard },
    { name: "SAC / Mensagens", path: "/admin/sac", icon: MessageSquare },
    { name: "Serviços (PDFs)", path: "/admin/servicos", icon: FileText },
    { name: "Vagas: Cadastrar", path: "/admin/vagas/cadastrar", icon: Briefcase },
    { name: "Vagas: Parâmetros", path: "/admin/vagas/parametros", icon: Settings2 },
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-[#0B3C8C] text-white flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold font-sans tracking-tight">Painel Admin</h2>
          <p className="text-sm text-blue-200 mt-1">LS Guarato</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {menu.map(item => {
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
              >
                <item.icon className="h-5 w-5 text-yellow-400 shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/20">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <LogOut className="h-5 w-5 text-yellow-400 shrink-0" />
            Voltar ao Site
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Outlet />
      </main>
    </div>
  );
};
