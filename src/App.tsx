/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import React, { useState, useEffect, Suspense, lazy } from "react";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { PageLoader } from "./components/ui/Loader";
import Maintenance from "./pages/Maintenance";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

// Lazy loading das páginas públicas secundárias (só baixa quando o visitante clica no menu)
const Sobre = lazy(() => import("./pages/Sobre").then(m => ({ default: m.Sobre })));
const AreaRestrita = lazy(() => import("./pages/AreaRestrita").then(m => ({ default: m.AreaRestrita })));
const JornalOfertas = lazy(() => import("./pages/JornalOfertas").then(m => ({ default: m.JornalOfertas })));
const TransparenciaSalarial = lazy(() => import("./pages/TransparenciaSalarial").then(m => ({ default: m.TransparenciaSalarial })));
const VagasEmprego = lazy(() => import("./pages/VagasEmprego").then(m => ({ default: m.VagasEmprego })));
const DetalhesVaga = lazy(() => import("./pages/DetalhesVaga").then(m => ({ default: m.DetalhesVaga })));
const Setores = lazy(() => import("./pages/Setores").then(m => ({ default: m.Setores })));
const Eventos = lazy(() => import("./pages/Eventos").then(m => ({ default: m.Eventos })));
const DetalhesEvento = lazy(() => import("./pages/DetalhesEvento").then(m => ({ default: m.DetalhesEvento })));
const Contato = lazy(() => import("./pages/Contato").then(m => ({ default: m.Contato })));
const NotFound = lazy(() => import("./pages/NotFound").then(m => ({ default: m.NotFound })));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade").then(m => ({ default: m.PoliticaPrivacidade })));

// Lazy loading das rotas do painel administrativo (não afeta o carregamento dos visitantes)
const DashboardLayout = lazy(() => import("./pages/Dashboard/Layout").then(m => ({ default: m.DashboardLayout })));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard").then(m => ({ default: m.Dashboard })));
const HomeEditor = lazy(() => import("./pages/Dashboard/HomeEditor").then(m => ({ default: m.HomeEditor })));
const SobreEditor = lazy(() => import("./pages/Dashboard/SobreEditor").then(m => ({ default: m.SobreEditor })));
const FooterEditor = lazy(() => import("./pages/Dashboard/FooterEditor").then(m => ({ default: m.FooterEditor })));
const CabecalhoEditor = lazy(() => import("./pages/Dashboard/CabecalhoEditor").then(m => ({ default: m.CabecalhoEditor })));
const ServicosEditor = lazy(() => import("./pages/Dashboard/ServicosEditor").then(m => ({ default: m.ServicosEditor })));
const SetoresEditor = lazy(() => import("./pages/Dashboard/SetoresEditor").then(m => ({ default: m.SetoresEditor })));
const EventosEditor = lazy(() => import("./pages/Dashboard/EventosEditor").then(m => ({ default: m.EventosEditor })));
const VagasParametrosEditor = lazy(() => import("./pages/Dashboard/VagasParametrosEditor").then(m => ({ default: m.VagasParametrosEditor })));
const VagasEditor = lazy(() => import("./pages/Dashboard/VagasEditor").then(m => ({ default: m.VagasEditor })));
const CandidatosList = lazy(() => import("./pages/Dashboard/CandidatosList").then(m => ({ default: m.CandidatosList })));
const ConfiguracoesEditor = lazy(() => import("./pages/Dashboard/ConfiguracoesEditor").then(m => ({ default: m.ConfiguracoesEditor })));
const MensagensSacList = lazy(() => import("./pages/Dashboard/MensagensSacList").then(m => ({ default: m.MensagensSacList })));
const UsuariosEditor = lazy(() => import("./pages/Dashboard/UsuariosEditor").then(m => ({ default: m.UsuariosEditor })));
const Login = lazy(() => import("./pages/Dashboard/Login").then(m => ({ default: m.Login })));

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

        {/* Rotas administrativas sob demanda com Suspense */}
        <Route 
          path="/admin/login" 
          element={
            <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Carregando painel...</div>}>
              <Login />
            </Suspense>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-600">Carregando painel administrativo...</div>}>
              <DashboardLayout />
            </Suspense>
          }
        >
          <Route index element={<Suspense fallback={null}><Dashboard /></Suspense>} />
          <Route path="home" element={<Suspense fallback={null}><HomeEditor /></Suspense>} />
          <Route path="cabecalho" element={<Suspense fallback={null}><CabecalhoEditor /></Suspense>} />
          <Route path="ajustes" element={<Suspense fallback={null}><ConfiguracoesEditor /></Suspense>} />
          <Route path="sobre" element={<Suspense fallback={null}><SobreEditor /></Suspense>} />
          <Route path="rodape" element={<Suspense fallback={null}><FooterEditor /></Suspense>} />
          <Route path="servicos" element={<Suspense fallback={null}><ServicosEditor /></Suspense>} />
          <Route path="setores" element={<Suspense fallback={null}><SetoresEditor /></Suspense>} />
          <Route path="eventos" element={<Suspense fallback={null}><EventosEditor /></Suspense>} />
          <Route path="candidatos" element={<Suspense fallback={null}><CandidatosList /></Suspense>} />
          <Route path="sac" element={<Suspense fallback={null}><MensagensSacList /></Suspense>} />
          <Route path="vagas/cadastrar" element={<Suspense fallback={null}><VagasEditor /></Suspense>} />
          <Route path="vagas/parametros" element={<Suspense fallback={null}><VagasParametrosEditor /></Suspense>} />
          <Route path="usuarios" element={<Suspense fallback={null}><UsuariosEditor /></Suspense>} />
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
            <Route path="politica-de-privacidade" element={<PoliticaPrivacidade />} />
            
            {/* Rotas de Eventos Diretas */}
            <Route path="eventos" element={<Eventos />} />
            <Route path="eventos/:id" element={<DetalhesEvento />} />
            
            <Route path="servicos">
              <Route path="jornal-de-ofertas" element={<JornalOfertas />} />
              <Route path="transparencia-salarial" element={<TransparenciaSalarial />} />
              <Route path="setores" element={<Setores />} />
              <Route path="eventos" element={<Eventos />} />
              <Route path="eventos/:id" element={<DetalhesEvento />} />
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
