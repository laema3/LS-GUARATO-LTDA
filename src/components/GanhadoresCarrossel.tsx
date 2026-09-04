import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Gift, 
  User, 
  Calendar, 
  Maximize2, 
  X, 
  Play, 
  Pause, 
  Sparkles,
  Award
} from "lucide-react";
import { GanhadorPremio } from "../types/evento";

interface GanhadoresCarrosselProps {
  ganhadores: GanhadorPremio[];
  totalPremios?: number;
  tituloEvento?: string;
}

export const GanhadoresCarrossel: React.FC<GanhadoresCarrosselProps> = ({
  ganhadores = [],
  totalPremios = 42,
  tituloEvento = "Sorteio de Prêmios"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Ordena os ganhadores pelo número do prêmio
  const sortedGanhadores = [...ganhadores].sort((a, b) => (a.numero || 0) - (b.numero || 0));
  const currentWinner = sortedGanhadores[currentIndex];

  // Autoplay do carrossel
  useEffect(() => {
    if (!isPlaying || sortedGanhadores.length <= 1 || isZoomOpen) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sortedGanhadores.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, sortedGanhadores.length, isZoomOpen]);

  // Centraliza a miniatura selecionada na barra de rolagem
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [currentIndex]);

  const handlePrev = () => {
    if (sortedGanhadores.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + sortedGanhadores.length) % sortedGanhadores.length);
  };

  const handleNext = () => {
    if (sortedGanhadores.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % sortedGanhadores.length);
  };

  if (sortedGanhadores.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 shadow-sm max-w-4xl mx-auto my-8">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Gift className="w-10 h-10 animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Sorteios em Andamento!</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
          Os <strong>{totalPremios} prêmios</strong> estão sendo sorteados. Assim que cada ganhador for premiado e tirar a foto, ela aparecerá aqui no carrossel oficial!
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#0B3C8C] rounded-full text-sm font-bold">
          <Sparkles className="w-4 h-4 text-[#D62828]" />
          Acompanhe em tempo real
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Placar de Progresso */}
      <div className="bg-gradient-to-r from-[#0B3C8C] via-[#082a63] to-[#D62828] text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Trophy className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">Placar Oficial</span>
            <h3 className="text-xl md:text-2xl font-bold font-sans">
              {sortedGanhadores.length} de {totalPremios} Prêmios Sorteados
            </h3>
          </div>
        </div>

        {/* Barra de Progresso visual */}
        <div className="w-full md:w-80 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-semibold text-white/80">
            <span>Progresso dos Sorteios</span>
            <span>{Math.round((sortedGanhadores.length / totalPremios) * 100)}%</span>
          </div>
          <div className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (sortedGanhadores.length / totalPremios) * 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Carrossel Principal */}
      <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] md:min-h-[520px]">
          
          {/* Lado Esquerdo: Imagem do Ganhador com o Prêmio */}
          <div className="lg:col-span-7 relative bg-black flex items-center justify-center overflow-hidden min-h-[340px] md:min-h-[480px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentWinner?.id || currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full flex items-center justify-center relative group"
              >
                {currentWinner?.foto_ganhador ? (
                  <img
                    src={currentWinner.foto_ganhador}
                    alt={`${currentWinner.nome_ganhador} - ${currentWinner.nome_premio}`}
                    className="w-full h-full object-contain max-h-[560px] cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setIsZoomOpen(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-950">
                    <Gift className="w-20 h-20 text-gray-600 mb-4 animate-pulse" />
                    <p className="text-lg font-medium text-gray-300">Foto sendo processada</p>
                    <p className="text-sm text-gray-500">Logo estará disponível!</p>
                  </div>
                )}

                {/* Overlay sutil para destaque */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Botão de Zoom / Ampliar */}
                {currentWinner?.foto_ganhador && (
                  <button
                    onClick={() => setIsZoomOpen(true)}
                    className="absolute top-4 right-4 z-10 p-2.5 bg-black/50 hover:bg-black/80 text-white rounded-xl backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-110"
                    title="Ver em tamanho ampliado"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                )}

                {/* Badge do Número do Prêmio sobre a foto */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#D62828] text-white px-3.5 py-1.5 rounded-full shadow-lg font-bold text-sm">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Prêmio #{currentWinner?.numero || currentIndex + 1} de {totalPremios}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Setas de navegação direta sobre a imagem */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-[#D62828] text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-110 focus:outline-none"
              aria-label="Ganhador anterior"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-[#D62828] text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-110 focus:outline-none"
              aria-label="Próximo ganhador"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          {/* Lado Direito: Informações do Ganhador e Prêmio */}
          <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-between text-white bg-gradient-to-b from-gray-900 to-gray-950 border-t lg:border-t-0 lg:border-l border-gray-800">
            <div>
              {/* Header do Card */}
              <div className="flex items-center justify-between gap-2 mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ganhador Contemplado
                </span>

                {/* Controles de Reprodução */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isPlaying 
                        ? "bg-white/10 text-white hover:bg-white/20" 
                        : "bg-[#D62828] text-white"
                    }`}
                    title={isPlaying ? "Pausar reprodução automática" : "Iniciar reprodução automática"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isPlaying ? "Pausar" : "Auto"}</span>
                  </button>
                </div>
              </div>

              {/* Informações detalhadas com animação */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWinner?.id || currentIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Nome do Prêmio */}
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-bold uppercase tracking-wider mb-2">
                      <Gift className="w-5 h-5" />
                      Prêmio Sorteado
                    </div>
                    <h2 className="text-2xl md:text-4xl font-extrabold font-sans text-white tracking-tight leading-tight">
                      {currentWinner?.nome_premio || "Super Prêmio"}
                    </h2>
                  </div>

                  {/* Nome do Ganhador */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                      <User className="w-4 h-4 text-[#D62828]" />
                      Ganhador(a)
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                      {currentWinner?.nome_ganhador || "Cliente Especial"}
                    </p>

                    {currentWinner?.observacoes && (
                      <p className="text-sm text-gray-400 mt-2 italic">
                        "{currentWinner.observacoes}"
                      </p>
                    )}
                  </div>

                  {/* Data do sorteio se houver */}
                  {currentWinner?.data_sorteio && (
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Sorteado em: {new Date(currentWinner.data_sorteio).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Barra de Controle de Posição */}
            <div className="pt-8 mt-6 border-t border-gray-800 flex items-center justify-between">
              <span className="text-sm text-gray-400 font-medium">
                Ganhador <strong className="text-white text-base">{currentIndex + 1}</strong> de <strong className="text-white text-base">{sortedGanhadores.length}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                  title="Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 bg-[#D62828] hover:bg-red-700 text-white rounded-xl transition-all"
                  title="Próximo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Barra Inferior com Miniaturas dos Ganhadores */}
        <div className="bg-black/80 backdrop-blur-md p-4 border-t border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-400 px-2">
            <span className="uppercase tracking-wider">Navegação Rápida entre os {sortedGanhadores.length} Ganhadores</span>
            <span>Clique para visualizar</span>
          </div>

          <div 
            ref={thumbnailsRef}
            className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
          >
            {sortedGanhadores.map((item, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={item.id || idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`relative flex-shrink-0 flex items-center gap-3 px-3 py-2 rounded-xl transition-all border text-left ${
                    isActive 
                      ? "bg-[#0B3C8C] border-amber-400 text-white shadow-lg ring-2 ring-amber-400/40 scale-105" 
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/30"
                  }`}
                  style={{ minWidth: "160px", maxWidth: "220px" }}
                >
                  {/* Foto miniatura */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border border-white/20">
                    {item.foto_ganhador ? (
                      <img src={item.foto_ganhador} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Gift className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="overflow-hidden flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                      Prêmio #{item.numero || idx + 1}
                    </span>
                    <p className="text-xs font-bold truncate text-white">
                      {item.nome_ganhador}
                    </p>
                    <p className="text-[10px] text-gray-300 truncate">
                      {item.nome_premio}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Lightbox de Zoom da Foto */}
      <AnimatePresence>
        {isZoomOpen && currentWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsZoomOpen(false)}
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/30 text-white rounded-full transition-colors z-20"
              title="Fechar ampliação"
            >
              <X className="w-7 h-7" />
            </button>

            <div 
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentWinner.foto_ganhador}
                alt={currentWinner.nome_ganhador}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/20"
              />

              <div className="mt-4 text-center text-white bg-black/60 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-sm mb-1">
                  <Award className="w-4 h-4" />
                  <span>Prêmio #{currentWinner.numero || currentIndex + 1} de {totalPremios} - {currentWinner.nome_premio}</span>
                </div>
                <h4 className="text-xl font-bold">{currentWinner.nome_ganhador}</h4>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
