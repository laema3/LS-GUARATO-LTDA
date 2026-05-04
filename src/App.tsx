/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Sobre } from "./pages/Sobre";
import { AreaRestrita } from "./pages/AreaRestrita";
import { JornalOfertas } from "./pages/JornalOfertas";
import { TransparenciaSalarial } from "./pages/TransparenciaSalarial";
import { VagasEmprego } from "./pages/VagasEmprego";
import { DetalhesVaga } from "./pages/DetalhesVaga";
import { Contato } from "./pages/Contato";
import { PageLoader } from "./components/ui/Loader";
import Maintenance from "./pages/Maintenance";
import { supabase } from "./lib/supabase";

// Import Admin Routes
import { DashboardLayout } from "./pages/Dashboard/Layout";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { HomeEditor } from "./pages/Dashboard/HomeEditor";
import { SobreEditor } from "./pages/Dashboard/SobreEditor";
import { FooterEditor } from "./pages/Dashboard/FooterEditor";
import { CabecalhoEditor } from "./pages/Dashboard/CabecalhoEditor";
import { ServicosEditor } from "./pages/Dashboard/ServicosEditor";
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

export default function App() {
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        console.log("Checking maintenance mode...");
        const { data, error } = await supabase.from('footer_settings').select('manutencao_ativa').eq('id', 1);
        console.log("Maintenance check result:", data, error);
        
        // Se houver erro ou não encontrar, assumimos false para não travar
        if (error || !data || data.length === 0) {
          setMaintenanceMode(false);
          return;
        }
        
        setMaintenanceMode(data[0].manutencao_ativa);
      } catch (err) {
        console.error("Erro ao verificar modo manutenção:", err);
        setMaintenanceMode(false);
      }
    };
    checkMaintenance();

    const channel = supabase
      .channel('maintenance-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'footer_settings' }, (payload) => {
        if (payload.new && 'manutencao_ativa' in payload.new) {
          setMaintenanceMode(payload.new.manutencao_ativa);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      {true && (
        <Routes>
          {/* Rotas administrativas movem para cima para prioridade */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="home" element={<HomeEditor />} />
            <Route path="cabecalho" element={<CabecalhoEditor />} />
            <Route path="ajustes" element={<ConfiguracoesEditor />} />
            <Route path="sobre" element={<SobreEditor />} />
            <Route path="rodape" element={<FooterEditor />} />
            <Route path="servicos" element={<ServicosEditor />} />
            <Route path="candidatos" element={<CandidatosList />} />
            <Route path="sac" element={<MensagensSacList />} />
            <Route path="vagas/cadastrar" element={<VagasEditor />} />
            <Route path="vagas/parametros" element={<VagasParametrosEditor />} />
            <Route path="usuarios" element={<UsuariosEditor />} />
          </Route>

          <Route path="/admin/login" element={<Login />} />

          <Route path="/" element={maintenanceMode ? <Maintenance /> : <Layout />}>
            <Route index element={<Home />} />
            <Route path="area-restrita" element={<AreaRestrita />} />
            <Route path="sobre" element={<Sobre />} />
            <Route path="contato" element={<Contato />} />
            
            <Route path="servicos">
              <Route path="jornal-de-ofertas" element={<JornalOfertas />} />
              <Route path="transparencia-salarial" element={<TransparenciaSalarial />} />
              <Route path="vagas" element={<VagasEmprego />} />
              <Route path="vagas/:id" element={<DetalhesVaga />} />
            </Route>
            
            <Route path="*" element={<div className="min-h-[50vh] flex items-center justify-center text-3xl font-bold font-sans text-[#0B3C8C]">404 - Página não encontrada</div>} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}
