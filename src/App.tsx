/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
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

// Import Admin Routes
import { DashboardLayout } from "./pages/Dashboard/Layout";
import { HomeEditor } from "./pages/Dashboard/HomeEditor";
import { SobreEditor } from "./pages/Dashboard/SobreEditor";
import { FooterEditor } from "./pages/Dashboard/FooterEditor";
import { ServicosEditor } from "./pages/Dashboard/ServicosEditor";
import { VagasParametrosEditor } from "./pages/Dashboard/VagasParametrosEditor";
import { VagasEditor } from "./pages/Dashboard/VagasEditor";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageLoader />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sobre" element={<Sobre />} />
          <Route path="area-restrita" element={<AreaRestrita />} />
          <Route path="contato" element={<Contato />} />
          
          <Route path="servicos">
            <Route path="jornal-de-ofertas" element={<JornalOfertas />} />
            <Route path="transparencia-salarial" element={<TransparenciaSalarial />} />
            <Route path="vagas" element={<VagasEmprego />} />
            <Route path="vagas/:id" element={<DetalhesVaga />} />
          </Route>
          
          <Route path="*" element={<div className="min-h-[50vh] flex items-center justify-center text-3xl font-bold font-sans text-[#0B3C8C]">404 - Página não encontrada</div>} />
        </Route>

        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<HomeEditor />} />
          <Route path="sobre" element={<SobreEditor />} />
          <Route path="rodape" element={<FooterEditor />} />
          <Route path="servicos" element={<ServicosEditor />} />
          <Route path="vagas/cadastrar" element={<VagasEditor />} />
          <Route path="vagas/parametros" element={<VagasParametrosEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
