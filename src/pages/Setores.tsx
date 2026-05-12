import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, ChevronRight, X, ChevronLeft } from "lucide-react";
import { supabase } from "../lib/supabase";

export const Setores = () => {
  const [setores, setSetores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<any | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadSetores = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.from('setores').select('*').order('nome');
        if (error) throw error;
        if (data) setSetores(data);
      } catch (err: any) {
        console.error("Erro ao carregar setores:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadSetores();
  }, []);

  const openSector = (setor: any) => {
    setSelectedSector(setor);
    setCurrentImageIndex(0);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSector?.imagens || selectedSector.imagens.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % selectedSector.imagens.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSector?.imagens || selectedSector.imagens.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + selectedSector.imagens.length) % selectedSector.imagens.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <div className="relative py-16 text-center text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1600')" }}
        ></div>
        <div className="absolute inset-0 bg-[#0B3C8C]/80"></div>
        <div className="relative z-10 flex flex-col items-center">
          <Store className="h-16 w-16 mb-4 text-[#D62828]" />
          <h1 className="text-4xl md:text-6xl font-bold font-sans mb-4 uppercase tracking-tight text-[#D62828]">Nossos Setores</h1>
          <p className="text-blue-100 max-w-2xl mx-auto px-4 text-xl">
            Conheça todos os departamentos do LS Guarato. Qualidade e frescor em cada corredor.
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
              <p className="font-bold text-xl mb-4">Erro ao carregar setores</p>
              <p className="text-lg opacity-90 leading-relaxed">
                Parece que o banco de dados ainda não foi configurado corretamente. 
                Se você for o administrador, verifique se a tabela 'setores' possui as colunas 'descricao' (tipo text) e 'imagens' (tipo text[]).
              </p>
              <p className="mt-4 text-sm font-mono bg-red-100 p-2 rounded">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative">
            {setores.length > 0 ? (
              setores.map((setor, idx) => (
                <motion.div
                  key={setor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => openSector(setor)}
                  className="group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={(setor.imagens && setor.imagens.length > 0) ? setor.imagens[0] : (setor.imagem || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800")} 
                      alt={setor.nome}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-lg shadow-lg border border-white/20">
                        <h3 className="text-sm md:text-base font-black text-[#D62828] font-sans uppercase tracking-widest leading-none">
                          {setor.nome}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-6 leading-relaxed line-clamp-2">
                      {setor.descricao || "Produtos selecionados com o padrão de qualidade que você já conhece."}
                    </p>
                    <div className="flex items-center text-[#0B3C8C] font-bold group-hover:gap-3 transition-all pointer-events-none">
                      Conhecer setor <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-lg">Nenhum setor cadastrado no momento.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Setor com Slide */}
      <AnimatePresence>
        {selectedSector && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedSector(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedSector(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                title="Fechar"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Área do Slide */}
              <div className="w-full md:w-3/5 bg-gray-900 relative flex items-center justify-center min-h-[300px]">
                {selectedSector.imagens && selectedSector.imagens.length > 0 ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={currentImageIndex}
                        src={selectedSector.imagens[currentImageIndex]}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-contain"
                      />
                    </AnimatePresence>
                    
                    {selectedSector.imagens.length > 1 && (
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
                        
                        {/* Indicadores */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {selectedSector.imagens.map((_: any, i: number) => (
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
                    src={selectedSector.imagem || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"} 
                    className="w-full h-full object-contain"
                    alt={selectedSector.nome}
                  />
                )}
              </div>

              {/* Conteúdo */}
              <div className="w-full md:w-2/5 p-8 flex flex-col">
                <h2 className="text-3xl font-bold text-[#0B3C8C] font-sans mb-4 uppercase tracking-tight">{selectedSector.nome}</h2>
                <div className="h-1 w-20 bg-[#D62828] mb-6 rounded-full" />
                <p className="text-gray-600 leading-relaxed text-lg flex-grow overflow-y-auto pr-2 custom-scrollbar">
                  {selectedSector.descricao || "Conheça nosso setor de excelência, onde selecionamos os melhores produtos para você e sua família."}
                </p>
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <Store className="h-6 w-6 text-[#D62828]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Localização</p>
                    <p className="font-bold text-[#0B3C8C]">LS Guarato - Loja Principal</p>
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
