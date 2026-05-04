import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Store, MapPin, Phone, Mail, Instagram, Facebook, Settings, FileText, Briefcase, ShieldCheck, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

const Header = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [logo, setLogo] = useState("");
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
    setIsServicesOpen(false);
  }, [location]);

  useEffect(() => {
    const loadHeader = async () => {
      const { data } = await supabase.from('header_settings').select('*').eq('id', 1).single();
      if (data && data.logo) {
        setLogo(data.logo);
      }
    };
    loadHeader();
  }, []);

  const navLinks = [
    { name: "Home", path: "/", icon: Store },
    { name: "Sobre", path: "/sobre", icon: Store },
  ];

  const serviceLinks = [
    { name: "Jornal de Ofertas", path: "/servicos/jornal-de-ofertas", icon: FileText },
    { name: "Transparência Salarial", path: "/servicos/transparencia-salarial", icon: TrendingUp },
    { name: "Vagas de Empregos", path: "/servicos/vagas", icon: Briefcase },
  ];

  const actionLinks = [
    { name: "Área Restrita", path: "/area-restrita", icon: ShieldCheck },
    { name: "Contato", path: "/contato", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B3C8C] shadow-lg text-white">
      <div className="container mx-auto px-4">
        <div className="flex py-4 min-h-[5rem] items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt="LS GUARATO" className="h-[78px] md:h-[84px] object-contain" />
            ) : (
              <>
                <Store className="h-8 w-8 text-[#D62828]" />
                <span className="font-sans font-bold text-2xl tracking-tight">LS GUARATO</span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={cn(
                  "flex items-center gap-2 hover:text-white transition-colors text-[#D62828]",
                  location.pathname === link.path && "text-white underline underline-offset-4 decoration-2"
                )}
              >
                <link.icon className="h-5 w-5 text-[#D62828]" />
                {link.name}
              </Link>
            ))}

            {/* Dropdown Menu */}
            <div className="relative group">
              <button 
                className={cn(
                  "flex items-center gap-2 hover:text-white transition-colors text-[#D62828]",
                  location.pathname.startsWith('/servicos') && "text-white"
                )}
              >
                <Store className="h-5 w-5 text-[#D62828]" />
                Serviços <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden text-gray-800">
                {serviceLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 hover:text-[#0B3C8C] transition-colors border-b border-gray-100 last:border-0"
                  >
                    <link.icon className="h-4 w-4 text-[#D62828]" />
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {actionLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={cn(
                  "flex items-center gap-2 hover:text-white transition-colors text-[#D62828]",
                  location.pathname === link.path && "text-white underline underline-offset-4 decoration-2"
                )}
              >
                <link.icon className="h-5 w-5 text-[#D62828]" />
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-md"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-[#082a63] border-t border-white/10">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="flex items-center gap-2 text-lg font-medium py-2 text-[#D62828]">
                <link.icon className="h-5 w-5 text-[#D62828]" />
                {link.name}
              </Link>
            ))}
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="flex items-center justify-between text-lg font-medium py-2 text-[#D62828]"
              >
                <span className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-[#D62828]" /> Serviços
                </span>
                <ChevronDown className={cn("h-5 w-5 transition-transform", isServicesOpen && "rotate-180")} />
              </button>
              {isServicesOpen && (
                <div className="pl-4 flex flex-col gap-3 py-2 border-l-2 border-[#D62828]">
                  {serviceLinks.map((link) => (
                    <Link key={link.path} to={link.path} className="flex items-center gap-2 text-white/80">
                      <link.icon className="h-4 w-4 text-[#D62828]" />
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {actionLinks.map((link) => (
              <Link key={link.path} to={link.path} className="flex items-center gap-2 text-lg font-medium py-2 text-[#D62828]">
                <link.icon className="h-5 w-5 text-[#D62828]" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => {
  const [logo, setLogo] = useState("");
  const [descricao, setDescricao] = useState("Sua família merece o melhor. Qualidade, variedade e economia em um só lugar.");
  const [endereco, setEndereco] = useState("Rua João Pinheiro, 256\nCentro, Uberaba - MG\nCEP: 38010-040");
  const [telefone, setTelefone] = useState("(34) 3318-7000");
  const [email, setEmail] = useState("contato@lsguarato.com.br");
  const [linkLoja, setLinkLoja] = useState("#");
  const [linkGoogle, setLinkGoogle] = useState("#");
  const [linkApple, setLinkApple] = useState("#");

  useEffect(() => {
    const loadFooter = async () => {
      const { data } = await supabase.from('footer_settings').select('*').eq('id', 1).single();
      if (data) {
        if (data.logo) setLogo(data.logo);
        if (data.descricao) setDescricao(data.descricao);
        if (data.endereco) setEndereco(data.endereco);
        if (data.telefone) setTelefone(data.telefone);
        if (data.email) setEmail(data.email);
        if (data.link_loja) setLinkLoja(data.link_loja);
        if (data.link_google_play) setLinkGoogle(data.link_google_play);
        if (data.link_app_store) setLinkApple(data.link_app_store);
      }
    };
    loadFooter();
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1 border-b md:border-b-0 border-gray-800 pb-8 md:pb-0">
            <Link to="/" className="flex items-center gap-2 mb-4 text-white">
              {logo ? (
                <img src={logo} alt="LS GUARATO" className="h-10 object-contain" />
              ) : (
                <>
                  <Store className="h-8 w-8 text-[#D62828]" />
                  <span className="font-sans font-bold text-2xl">LS GUARATO</span>
                </>
              )}
            </Link>
            <p className="text-sm mb-6 max-w-xs">{descricao}</p>
            <div className="flex gap-4">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-[#D62828] hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-[#D62828] hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 font-sans uppercase tracking-wider">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#D62828] shrink-0 mt-0.5" />
                <span className="text-sm whitespace-pre-line">{endereco}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#D62828] shrink-0" />
                <span className="text-sm">{telefone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#D62828] shrink-0" />
                <span className="text-sm">{email}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 font-sans uppercase tracking-wider">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><Link to="/sobre" className="hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link to="/servicos/vagas" className="hover:text-white transition-colors">Trabalhe Conosco</Link></li>
              <li><Link to="/servicos/jornal-de-ofertas" className="hover:text-white transition-colors">Jornal de Ofertas</Link></li>
              <li><Link to="/area-restrita" className="hover:text-white transition-colors">Área Restrita (RH)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 font-sans uppercase tracking-wider">Compre Online</h4>
            <p className="text-sm mb-4">Baixe nosso app ou acesse a loja virtual para comprar sem sair de casa.</p>
            <div className="flex flex-col gap-3">
              <a href={linkLoja} target="_blank" rel="noopener noreferrer" className="bg-[#0B3C8C] hover:bg-[#082a63] text-white py-2 px-4 rounded font-medium text-center transition-colors shadow-md">
                Acessar Loja Virtual
              </a>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <a href={linkGoogle} target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-white rounded p-2 flex items-center justify-center transition-colors">
                  <span className="text-xs font-semibold">Google Play</span>
                </a>
                <a href={linkApple} target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-white rounded p-2 flex items-center justify-center transition-colors">
                  <span className="text-xs font-semibold">App Store</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} LS Guarato Supermercados. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-gray-500 hover:text-white transition-colors" title="Painel Administrativo">
              <Settings className="h-5 w-5" />
            </Link>
            <div className="text-sm text-gray-500">
              Design e Desenvolvimento Moderno
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
