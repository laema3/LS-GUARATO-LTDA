import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Calendar, 
  ArrowLeft, 
  Search, 
  Gift, 
  Trophy, 
  Sparkles, 
  User, 
  Award, 
  Share2, 
  CheckCircle2,
  CalendarDays
} from "lucide-react";
import { getEventoById, getEventos } from "../services/eventosService";
import { EventoItem, GanhadorPremio } from "../types/evento";
import { GanhadoresCarrossel } from "../components/GanhadoresCarrossel";

export const DetalhesEvento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [evento, setEvento] = useState<EventoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (id) {
          const data = await getEventoById(id);
          setEvento(data);
        } else {
          const list = await getEventos();
          setEvento(list[0] || null);
        }
      } catch (err) {
        console.error("Erro ao carregar evento:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3C8C] mx-auto"></div>
          <p className="text-gray-500 font-medium">Carregando evento e lista de prêmios...</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-xl mx-auto px-4 text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Evento não encontrado</h2>
          <p className="text-gray-600 mb-6">O evento solicitado não foi encontrado ou ainda não foi publicado.</p>
          <Link 
            to="/servicos/eventos" 
            className="inline-flex items-center gap-2 bg-[#0B3C8C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#082a63] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Ver todos os eventos
          </Link>
        </div>
      </div>
    );
  }

  const ganhadores = evento.ganhadores || [];
  const totalPremios = evento.total_premios || 42;

  // Filtragem de busca
  const filteredGanhadores = ganhadores.filter(g => {
    const term = searchTerm.toLowerCase();
    return (
      (g.nome_ganhador || "").toLowerCase().includes(term) ||
      (g.nome_premio || "").toLowerCase().includes(term) ||
      String(g.numero || "").includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Banner Principal do Evento */}
      <div className="relative py-16 md:py-20 text-white overflow-hidden bg-[#0B3C8C]">
        {evento.imagem_capa && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 transition-transform duration-1000"
            style={{ backgroundImage: `url('${evento.imagem_capa}')` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C8C] via-[#0B3C8C]/80 to-[#082a63]/90" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Navegação e Voltar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link 
              to="/servicos/eventos" 
              className="inline-flex items-center gap-2 text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm text-sm font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para Eventos
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm text-sm font-bold transition-colors"
              title="Copiar link da página"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink ? "Link Copiado!" : "Compartilhar"}
            </button>
          </div>

          <div className="max-w-3xl space-y-4">
            {/* Badges Comemorativas */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#D62828] text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Edição Especial 42 Anos
              </span>

              {evento.data_evento && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-blue-100 backdrop-blur-sm">
                  <CalendarDays className="w-3.5 h-3.5 text-amber-300" />
                  {new Date(evento.data_evento).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-sans tracking-tight text-white leading-tight">
              {evento.titulo}
            </h1>

            <p className="text-lg md:text-xl text-blue-100 font-light leading-relaxed">
              {evento.descricao || "Acompanhe todos os prêmios e ganhadores sorteados nesta grande comemoração."}
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-12 flex-grow w-full space-y-16">
        
        {/* Seção 1: O Carrossel dos Ganhadores com Fotos */}
        <section>
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[#D62828] font-black text-xs uppercase tracking-widest block mb-1">
                Carrossel Oficial dos Ganhadores
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-sans text-gray-900 flex items-center gap-2">
                <Trophy className="w-7 h-7 text-amber-500" />
                Ganhadores e Fotos com os Prêmios
              </h2>
            </div>
            <p className="text-sm text-gray-500 max-w-md">
              A cada sorteio realizado, a foto do ganhador é atualizada aqui para você celebrar conosco!
            </p>
          </div>

          <GanhadoresCarrossel 
            ganhadores={ganhadores}
            totalPremios={totalPremios}
            tituloEvento={evento.titulo}
          />
        </section>

        {/* Seção 2: Grade Completa com Busca de Ganhadores */}
        {ganhadores.length > 0 && (
          <section className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 font-sans flex items-center gap-2">
                  <Gift className="w-6 h-6 text-[#D62828]" />
                  Lista de Todos os {ganhadores.length} Ganhadores Contemplados
                </h3>
                <p className="text-sm text-gray-500">
                  Consulte abaixo os prêmios já sorteados até o momento
                </p>
              </div>

              {/* Barra de Pesquisa */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar ganhador ou prêmio..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C8C] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Grade de Cards */}
            {filteredGanhadores.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGanhadores.map((g, idx) => (
                  <motion.div
                    key={g.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (idx % 8) * 0.05 }}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all overflow-hidden flex flex-col"
                  >
                    {/* Foto com Badge de Número */}
                    <div className="relative h-48 bg-gray-900 overflow-hidden">
                      {g.foto_ganhador ? (
                        <img
                          src={g.foto_ganhador}
                          alt={`${g.nome_ganhador} - ${g.nome_premio}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                          <Gift className="w-10 h-10 mb-1" />
                          <span className="text-xs">Sem foto</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-[#D62828] text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                        Prêmio #{g.numero || idx + 1}
                      </div>
                    </div>

                    {/* Dados do Ganhador */}
                    <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
                          Prêmio
                        </span>
                        <h4 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
                          {g.nome_premio}
                        </h4>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
                          <User className="w-3.5 h-3.5 text-[#0B3C8C]" />
                          Ganhador(a)
                        </div>
                        <p className="font-bold text-[#0B3C8C] text-sm truncate">
                          {g.nome_ganhador}
                        </p>
                        {g.data_sorteio && (
                          <span className="text-[11px] text-gray-400 block mt-1">
                            Sorteado em {new Date(g.data_sorteio).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Nenhum ganhador encontrado para "{searchTerm}".</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-3 text-sm text-[#0B3C8C] font-bold hover:underline"
                >
                  Limpar pesquisa
                </button>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
};
