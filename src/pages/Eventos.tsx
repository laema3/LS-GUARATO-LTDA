import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, ChevronRight, X, ChevronLeft, CalendarDays } from "lucide-react";
import { supabase } from "../lib/supabase";

export const Eventos = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadEventos = async () => {
      try {
        setLoading(true);
        setError(null);
        // Order by title alphabetically
        const { data, error } = await supabase.from('eventos').select('*').order('titulo');
        if (error) throw error;
        if (data) setEventos(data);
      } catch (err: any) {
        console.error("Erro ao carregar eventos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadEventos();
  }, []);

  const openEvent = (evento: any) => {
    setSelectedEvent(evento);
    setCurrentImageIndex(0);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedEvent?.imagens || selectedEvent.imagens.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % selectedEvent.imagens.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedEvent?.imagens || selectedEvent.imagens.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + selectedEvent.imagens.length) % selectedEvent.imagens.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <div className="relative py-16 text-center text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1600')" }}
        ></div>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 flex flex-col items-center">
          <Calendar className="h-16 w-16 mb-4 text-[#D62828]" />
          <h1 className="text-4xl md:text-6xl font-bold font-sans mb-4 uppercase tracking-tight text-[#D62828]">Eventos & Datas Especiais</h1>
          <p className="max-w-2xl mx-auto px-4 text-xl text-gray-200">
            Celebre momentos especiais com o LS Guarato. Confira o que preparamos para você e sua família.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 flex-grow relative">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3C8C]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-50 text-red-600 p-8 rounded-2xl inline-block max-w-2xl border border-red-100">
              <p className="font-bold text-xl mb-4">Erro ao carregar eventos</p>
              <p className="text-lg opacity-90 leading-relaxed">
                Tivemos um problema ao conectar com o banco de dados. Verifique a tabela 'eventos'.
              </p>
              <p className="mt-4 text-sm font-mono bg-red-100 p-2 rounded">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative">
            {eventos.length > 0 ? (
              eventos.map((evento, idx) => (
                <motion.div
                  key={evento.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => openEvent(evento)}
                  className="group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={evento.imagem_capa || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"} 
                      alt={evento.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-lg shadow-lg border border-white/20">
                        <h3 className="text-sm md:text-base font-black text-[#D62828] font-sans uppercase tracking-widest leading-none">
                          {evento.titulo}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {evento.data_evento && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm font-bold mb-3 uppercase tracking-wider">
                        <CalendarDays className="h-4 w-4 text-[#D62828]" />
                        {new Date(evento.data_evento).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    <p className="text-gray-600 mb-6 leading-relaxed line-clamp-2">
                      {evento.descricao || "Participe de momentos inesquecíveis com programações especiais para você."}
                    </p>
                    <div className="flex items-center text-[#0B3C8C] font-bold group-hover:gap-3 transition-all pointer-events-none">
                      Ver detalhes <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-lg">Nenhum evento cadastrado no momento.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                title="Fechar"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="w-full md:w-3/5 bg-gray-900 relative flex items-center justify-center min-h-[300px]">
                {selectedEvent.imagens && selectedEvent.imagens.length > 0 ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={currentImageIndex}
                        src={selectedEvent.imagens[currentImageIndex]}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-contain"
                      />
                    </AnimatePresence>
                    
                    {selectedEvent.imagens.length > 1 && (
                      <>
                        <button 
                          onClick={prevImage}
                          className="absolute left-4 p-2 bg-white/10 hover:bg-white/30 text-white rounded-full transition-colors border border-white/20"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button 
                          onClick={nextImage}
                          className="absolute right-4 p-2 bg-white/10 hover:bg-white/30 text-white rounded-full transition-colors border border-white/20"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                        
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {selectedEvent.imagens.map((_: any, i: number) => (
                            <div 
                              key={i} 
                              className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-6 bg-[#D62828]' : 'w-1.5 bg-white/50'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <img 
                    src={selectedEvent.imagem_capa || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800"} 
                    className="w-full h-full object-contain"
                    alt={selectedEvent.titulo}
                  />
                )}
              </div>

              <div className="w-full md:w-2/5 p-8 flex flex-col">
                <h2 className="text-3xl font-bold text-[#0B3C8C] font-sans mb-4 uppercase tracking-tight">{selectedEvent.titulo}</h2>
                {selectedEvent.data_evento && (
                  <div className="flex items-center gap-2 text-gray-500 font-bold mb-4 uppercase tracking-wider text-sm">
                    <CalendarDays className="h-4 w-4 text-[#D62828]" />
                    {new Date(selectedEvent.data_evento).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
                <div className="h-1 w-20 bg-[#D62828] mb-6 rounded-full" />
                <p className="text-gray-600 leading-relaxed text-lg flex-grow overflow-y-auto pr-2 custom-scrollbar">
                  {selectedEvent.descricao || "Um evento incrível preparado com todo carinho para nossos clientes."}
                </p>
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-[#D62828]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informação</p>
                    <p className="font-bold text-[#0B3C8C]">Visite-nos para participar!</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
