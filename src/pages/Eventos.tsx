import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, ChevronRight, X, ChevronLeft, CalendarDays, Trophy, Gift, Sparkles, Award } from "lucide-react";
import { getEventos, isValidImageUrl } from "../services/eventosService";
import { EventoItem } from "../types/evento";

export const Eventos = () => {
  const [eventos, setEventos] = useState<EventoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEventos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEventos();
        setEventos(data);
      } catch (err: any) {
        console.error("Erro ao carregar eventos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadEventos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <div className="relative py-16 text-center text-white overflow-hidden bg-[#0B3C8C]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1600')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C8C] via-black/40 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center">
          <Calendar className="h-16 w-16 mb-4 text-[#D62828]" />
          <h1 className="text-4xl md:text-6xl font-bold font-sans mb-4 uppercase tracking-tight text-[#D62828]">Eventos & Comemorações</h1>
          <p className="max-w-2xl mx-auto px-4 text-xl text-gray-200">
            Celebre momentos especiais com o LS Guarato. Confira nossas campanhas, sorteios comemorativos e ganhadores!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 flex-grow relative">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3C8C]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-50 text-red-600 p-8 rounded-2xl inline-block max-w-2xl border border-red-100">
              <p className="font-bold text-xl mb-4">Erro ao carregar eventos</p>
              <p className="text-lg opacity-90 leading-relaxed">
                Tivemos um problema ao conectar com o banco de dados.
              </p>
              <p className="mt-4 text-sm font-mono bg-red-100 p-2 rounded">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative">
            {eventos.length > 0 ? (
              eventos.map((evento, idx) => {
                const totalGanhadores = (evento.ganhadores || []).length;
                const totalPremios = evento.total_premios || 42;

                return (
                  <motion.div
                    key={evento.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => navigate(`/eventos/${evento.id}`)}
                    className="group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-2xl transition-all cursor-pointer flex flex-col"
                  >
                    <div className="relative h-64 overflow-hidden bg-gray-900">
                      <img 
                        src={isValidImageUrl(evento.imagem_capa) ? evento.imagem_capa : "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"} 
                        alt={evento.titulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Badge do Evento */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-[#D62828] text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>{evento.titulo.includes("42") ? "42 Anos" : "Especial"}</span>
                        </div>
                      </div>

                      {/* Contador de Prêmios */}
                      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-white">
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span>{totalGanhadores} de {totalPremios} prêmios sorteados</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div>
                        {evento.data_evento && (
                          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold mb-2 uppercase tracking-wider">
                            <CalendarDays className="h-4 w-4 text-[#D62828]" />
                            {new Date(evento.data_evento).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-[#0B3C8C] mb-3 leading-snug group-hover:text-[#D62828] transition-colors">
                          {evento.titulo}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                          {evento.descricao || "Acompanhe todas as fotos dos ganhadores e prêmios sorteados nesta comemoração."}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[#0B3C8C] font-bold text-sm group-hover:text-[#D62828] transition-colors">
                        <span className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-[#D62828]" />
                          Ver Carrossel de Fotos
                        </span>
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">Nenhum evento cadastrado no momento.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
