import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Info, LayoutDashboard, FileText, LogOut, Briefcase, Settings2, Settings, MessageSquare, Users, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [candidatosCount, setCandidatosCount] = useState(0);
  const [sacCount, setSacCount] = useState(0);

  useEffect(() => {
    const checkAuthAndCounts = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/admin/login");
          return;
        }

        const email = (session.user.email || '').toLowerCase().trim();
        setUserEmail(email || null);

        // Buscar o papel do usuário
        let userRole = 'operator'; // Default
        try {
          if (email) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .ilike('email', email)
              .maybeSingle();
            
            if (profile?.role) {
                userRole = profile.role;
            }
          }
          
          if (email === 'camillasites@gmail.com') {
            userRole = 'admin';
          }
        } catch (err) {
          if (email === 'camillasites@gmail.com') {
            userRole = 'admin';
          }
        }
        
        setRole(userRole);

        // Buscar contadores de forma independente para não travar a UI
        supabase.from('candidatos').select('*', { count: 'exact', head: true })
          .then(
            res => setCandidatosCount(res.count || 0),
            err => console.error("Erro count candidatos:", err)
          );
          
        supabase.from('mensagens_contato').select('*', { count: 'exact', head: true })
          .then(
            res => setSacCount(res.count || 0),
            err => console.error("Erro count mensagens:", err)
          );

        // Verificação de segurança: se a rota atual for adminOnly e o usuário for operador
        const currentPath = location.pathname;
        const adminOnlyPaths = [
          "/admin/ajustes", 
          "/admin/usuarios", 
          "/admin/cabecalho",
          "/admin/home",
          "/admin/sobre",
          "/admin/rodape",
          "/admin/servicos"
        ];
        const isAdminRoute = adminOnlyPaths.some(path => currentPath.startsWith(path));
        
        if (isAdminRoute && userRole === 'operator') {
          navigate("/admin");
        }
      } catch (err) {
        console.error("Erro crítico no checkAuthAndCounts:", err);
        // Mesmo em erro, marcar carregamento concluído
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndCounts();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const menuConfig = [
    { name: "Ajustes da Empresa", path: "/admin/ajustes", icon: Settings, adminOnly: true },
    { name: "Cabeçalho e Logo", path: "/admin/cabecalho", icon: LayoutDashboard, adminOnly: true },
    { name: "Candidatos / Currículos", path: "/admin/candidatos", icon: Briefcase },
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
    { name: "Página Home", path: "/admin/home", icon: Home, adminOnly: true },
    { name: "Página Sobre", path: "/admin/sobre", icon: Info, adminOnly: true },
    { name: "Rodapé", path: "/admin/rodape", icon: LayoutDashboard, adminOnly: true },
    { name: "SAC / Mensagens", path: "/admin/sac", icon: MessageSquare },
    { name: "Serviços (PDFs)", path: "/admin/servicos", icon: FileText, adminOnly: true },
    { name: "Setores da Loja", path: "/admin/setores", icon: LayoutGrid, adminOnly: true },
    { name: "Vagas: Cadastrar", path: "/admin/vagas/cadastrar", icon: Briefcase },
    { name: "Vagas: Parâmetros", path: "/admin/vagas/parametros", icon: Settings2 },
    { name: "Usuários do Sistema", path: "/admin/usuarios", icon: Users, adminOnly: true },
  ];

  const menu = menuConfig
    .filter(item => !item.adminOnly || role === 'admin')
    .sort((a, b) => {
      if (a.name === "Dashboard") return -1;
      if (b.name === "Dashboard") return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-[#0B3C8C] text-white flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold font-sans tracking-tight text-[#D62828]">Painel Admin</h2>
          <p className="text-sm text-blue-200 mt-1">LS Guarato</p>
          
          <div className="mt-6 p-3 bg-white/10 rounded-lg border border-white/10">
            <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider mb-1">Usuário Logado</p>
            <p className="text-xs font-medium truncate" title={userEmail || ''}>{userEmail}</p>
            <div className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${role === 'admin' ? 'bg-[#D62828] text-white' : 'bg-green-500 text-white'}`}>
              {role === 'admin' ? 'Administrador' : 'Operador'}
            </div>
          </div>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-white/20 font-bold text-white' : 'text-white hover:bg-white/10'}`}
              >
                <item.icon className="h-5 w-5 text-white shrink-0" />
                <span className="flex-1">{item.name}</span>
                {(item.path === "/admin/candidatos" && candidatosCount > 0) && (
                    <span className="bg-[#D62828] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ml-auto">
                        {candidatosCount}
                    </span>
                )}
                {(item.path === "/admin/sac" && sacCount > 0) && (
                    <span className="bg-[#D62828] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ml-auto">
                        {sacCount}
                    </span>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/20">
          <Link 
            to="/" 
            className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors mb-2"
          >
            <Home className="h-5 w-5 text-white shrink-0" />
            Voltar para o Site
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 text-white shrink-0" />
            Sair do Painel
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Outlet />
      </main>
</div>
  );
};
