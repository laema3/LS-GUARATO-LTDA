/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Sobre } from "./pages/Sobre";
import { AreaRestrita } from "./pages/AreaRestrita";
import { JornalOfertas } from "./pages/JornalOfertas";
import { TransparenciaSalarial } from "./pages/TransparenciaSalarial";
import { VagasEmprego } from "./pages/VagasEmprego";
import { DetalhesVaga } from "./pages/DetalhesVaga";
import { Setores } from "./pages/Setores";
import { Eventos } from "./pages/Eventos";
import { Contato } from "./pages/Contato";
import { NotFound } from "./pages/NotFound";
import { PageLoader } from "./components/ui/Loader";
import Maintenance from "./pages/Maintenance";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

// Import Admin Routes
import { DashboardLayout } from "./pages/Dashboard/Layout";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { HomeEditor } from "./pages/Dashboard/HomeEditor";
import { SobreEditor } from "./pages/Dashboard/SobreEditor";
import { FooterEditor } from "./pages/Dashboard/FooterEditor";
import { CabecalhoEditor } from "./pages/Dashboard/CabecalhoEditor";
import { ServicosEditor } from "./pages/Dashboard/ServicosEditor";
import { SetoresEditor } from "./pages/Dashboard/SetoresEditor";
import { EventosEditor } from "./pages/Dashboard/EventosEditor";
import { VagasParametrosEditor } from "./pages/Dashboard/VagasParametrosEditor";
import { VagasEditor } from "./pages/Dashboard/VagasEditor";
import { CandidatosList } from "./pages/Dashboard/CandidatosList";
import { ConfiguracoesEditor } from "./pages/Dashboard/ConfiguracoesEditor";
import { MensagensSacList } from "./pages/Dashboard/MensagensSacList";
import { UsuariosEditor } from "./pages/Dashboard/UsuariosEditor";
import { Login } from "./pages/Dashboard/Login";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const ExternalRedirect = ({ url }: { url: string }) => {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);
  return null;
};

export default function App() {
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);

  useEffect(() => {
    // Se o banco não estiver configurado (URL placeholder), evita requisições e mantém em manutenção
    if (!isSupabaseConfigured) {
      setMaintenanceMode(true);
      return;
    }

    const checkMaintenance = async () => {
      try {
        const { data, error } = await supabase.from('footer_settings').select('manutencao_ativa').eq('id', 1).maybeSingle();
        
        if (!error && data) {
          // Se o banco estiver configurado, respeitamos o valor do banco
          setMaintenanceMode(data.manutencao_ativa);
        } else {
          // Se houver erro ou não encontrar o registro, mantemos em manutenção por precaução
          setMaintenanceMode(true);
        }
      } catch (err) {
        // Se houver erro de conexão total, mantemos em manutenção
        setMaintenanceMode(true);
        console.error("Erro ao verificar manutenção:", err);
      }
    };
    checkMaintenance();
  }, []);

  if (maintenanceMode === null) {
      return (
        <div className="fixed inset-0 z-[100] bg-[#0B3C8C] flex flex-col items-center justify-center">
            <div className="animate-pulse">
                <ShoppingCart className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-white font-sans font-bold text-2xl mt-4 tracking-wider">
                ABASTECENDO...
            </h2>
        </div>
      );
  }

  return (
    <BrowserRouter>
      {/* PageLoader tem seu próprio timer interno, não deve bloquear eternamente */}
      <PageLoader />
      <ScrollToTop />
      
      <Routes>
        {/* Redirecionamento da URL antiga para a nova */}
        <Route 
          path="/vagas-de-empregos-disponiveis" 
          element={<ExternalRedirect url="https://www.guarato.com.br/servicos/vagas" />} 
        />

        {/* Rotas administrativas sempre disponíveis */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="home" element={<HomeEditor />} />
          <Route path="cabecalho" element={<CabecalhoEditor />} />
          <Route path="ajustes" element={<ConfiguracoesEditor />} />
          <Route path="sobre" element={<SobreEditor />} />
          <Route path="rodape" element={<FooterEditor />} />
          <Route path="servicos" element={<ServicosEditor />} />
          <Route path="setores" element={<SetoresEditor />} />
          <Route path="eventos" element={<EventosEditor />} />
          <Route path="candidatos" element={<CandidatosList />} />
          <Route path="sac" element={<MensagensSacList />} />
          <Route path="vagas/cadastrar" element={<VagasEditor />} />
          <Route path="vagas/parametros" element={<VagasParametrosEditor />} />
          <Route path="usuarios" element={<UsuariosEditor />} />
        </Route>

        {/* Parte Pública do Site */}
        {maintenanceMode ? (
          <Route path="*" element={<Maintenance />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="area-restrita" element={<AreaRestrita />} />
            <Route path="sobre" element={<Sobre />} />
            <Route path="contato" element={<Contato />} />
            
            <Route path="servicos">
              <Route path="jornal-de-ofertas" element={<JornalOfertas />} />
              <Route path="transparencia-salarial" element={<TransparenciaSalarial />} />
              <Route path="setores" element={<Setores />} />
              <Route path="eventos" element={<Eventos />} />
              <Route path="vagas" element={<VagasEmprego />} />
              <Route path="vagas/:id" element={<DetalhesVaga />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
