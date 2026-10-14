import React, { useState, useEffect } from "react";
import { 
  Save, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Loader2, 
  Trophy, 
  Gift, 
  User, 
  ExternalLink, 
  Search,
  Award,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  CalendarDays,
  ArrowUpDown
} from "lucide-react";
import { SaveToast } from "../../components/ui/SaveToast";
import { FileUpload } from "../../components/ui/FileUpload";
import { MultiFileUpload } from "../../components/ui/MultiFileUpload";
import { generateEventDescription } from "../../services/geminiService";
import { getEventos, saveEvento, deleteEvento, sortGanhadoresByDate } from "../../services/eventosService";
import { EventoItem, GanhadorPremio, PREMIOS_FIXOS } from "../../types/evento";

export const EventosEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Alterações salvas com sucesso!");
  const [eventos, setEventos] = useState<EventoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedGanhadores, setExpandedGanhadores] = useState<Record<string, boolean>>({});
  const [ganhadoresPages, setGanhadoresPages] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getEventos();
      // Organiza automaticamente os ganhadores por data do sorteio
      const sortedData = data.map(ev => ({
        ...ev,
        ganhadores: sortGanhadoresByDate(ev.ganhadores || [], "asc", false)
      }));
      setEventos(sortedData);
      // Abre a seção de ganhadores para o primeiro evento por padrão
      if (sortedData.length > 0) {
        setExpandedGanhadores({ [sortedData[0].id]: true });
      }
    } catch (err: any) {
      console.error("Erro ao carregar eventos:", err);
      setLoadError(err.message || "Erro ao conectar com o banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvento = () => {
    const newId = `temp-${Date.now()}`;
    const newEvento: EventoItem = {
      id: newId,
      titulo: "Novo Evento Comemorativo",
      descricao: "Comemoração especial com sorteio de prêmios para nossos clientes e colaboradores.",
      imagem_capa: "",
      imagens: [],
      data_evento: new Date().toISOString().split("T")[0],
      total_premios: 42,
      ganhadores: []
    };
    setEventos([newEvento, ...eventos]);
    setExpandedGanhadores({ ...expandedGanhadores, [newId]: true });
  };

  const handleRemoveEvento = async (id: string) => {
    try {
      await deleteEvento(id);
      setEventos(eventos.filter(e => e.id !== id));
      setConfirmDeleteId(null);
      setToastMessage("Evento removido com sucesso!");
      setShowToast(true);
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const handleChangeEvento = (index: number, field: keyof EventoItem, value: any) => {
    const updated = [...eventos];
    updated[index] = { ...updated[index], [field]: value };
    setEventos(updated);
  };

  // Funções para gerenciamento de ganhadores de cada evento
  const handleAddGanhador = (eventoIndex: number) => {
    const evento = eventos[eventoIndex];
    const currentGanhadores = evento.ganhadores || [];
    const nextNum = currentGanhadores.length + 1;
    // Traz ciclicamente um dos 4 prêmios fixos como sugestão padrão
    const defaultPremio = PREMIOS_FIXOS[(nextNum - 1) % PREMIOS_FIXOS.length];

    const novoGanhador: GanhadorPremio = {
      id: `ganhador-${Date.now()}`,
      numero: nextNum,
      nome_ganhador: "",
      nome_premio: defaultPremio,
      foto_ganhador: "",
      data_sorteio: new Date().toISOString().split("T")[0],
      observacoes: ""
    };

    const updatedGanhadores = [...currentGanhadores, novoGanhador];
    handleChangeEvento(eventoIndex, "ganhadores", updatedGanhadores);
    setExpandedGanhadores({ ...expandedGanhadores, [evento.id]: true });

    // Exibe de 4 em 4: calcula a página do novo ganhador
    const targetPage = Math.ceil(updatedGanhadores.length / 4);
    setGanhadoresPages({ ...ganhadoresPages, [evento.id]: targetPage });

    // Rola a página até o campo criado
    setTimeout(() => {
      const el = document.getElementById(`ganhador-${novoGanhador.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const inputEl = el.querySelector("input[type='text']") as HTMLInputElement;
        if (inputEl) inputEl.focus();
      }
    }, 100);
  };

  const handleGenerate42Slots = (eventoIndex: number) => {
    const evento = eventos[eventoIndex];
    const totalSlots = evento.total_premios || 42;
    const existing = [...(evento.ganhadores || [])];
    
    // Cria os slots que faltam até atingir totalSlots distribuindo os 4 prêmios fixos
    const currentCount = existing.length;
    for (let i = currentCount + 1; i <= totalSlots; i++) {
      existing.push({
        id: `slot-${i}-${Date.now()}`,
        numero: i,
        nome_ganhador: "",
        nome_premio: PREMIOS_FIXOS[(i - 1) % PREMIOS_FIXOS.length],
        foto_ganhador: "",
        data_sorteio: new Date().toISOString().split("T")[0],
        observacoes: ""
      });
    }

    handleChangeEvento(eventoIndex, "ganhadores", existing);
    setExpandedGanhadores({ ...expandedGanhadores, [evento.id]: true });
    setGanhadoresPages({ ...ganhadoresPages, [evento.id]: 1 });
    setToastMessage(`Estrutura de ${totalSlots} prêmios preparada com os 4 prêmios fixos!`);
    setShowToast(true);
  };

  const handleChangeGanhador = (
    eventoIndex: number, 
    ganhadorIndex: number, 
    field: keyof GanhadorPremio, 
    value: any
  ) => {
    const updated = [...eventos];
    const ganhadores = [...(updated[eventoIndex].ganhadores || [])];
    ganhadores[ganhadorIndex] = { ...ganhadores[ganhadorIndex], [field]: value };
    updated[eventoIndex].ganhadores = ganhadores;
    setEventos(updated);
  };

  const handleRemoveGanhador = (eventoIndex: number, ganhadorIndex: number) => {
    const updated = [...eventos];
    const ganhadores = [...(updated[eventoIndex].ganhadores || [])];
    ganhadores.splice(ganhadorIndex, 1);
    updated[eventoIndex].ganhadores = ganhadores;
    setEventos(updated);
  };

  const handleSortGanhadoresByDate = (eventoIndex: number, order: "asc" | "desc" = "asc") => {
    const updated = [...eventos];
    const rawGanhadores = updated[eventoIndex].ganhadores || [];
    if (rawGanhadores.length === 0) return;

    // Ordena por data e renumera para manter a sequência perfeita dos prêmios
    const sorted = sortGanhadoresByDate(rawGanhadores, order, true);
    updated[eventoIndex].ganhadores = sorted;
    setEventos(updated);
    setExpandedGanhadores({ ...expandedGanhadores, [updated[eventoIndex].id]: true });
    setToastMessage(
      order === "asc"
        ? "Fotos e prêmios ordenados cronologicamente por data (do 1º sorteio ao mais recente)!"
        : "Fotos e prêmios ordenados por data (mais recentes primeiro)!"
    );
    setShowToast(true);
  };

  const handleGenerateAI = async (index: number, title: string, id: string) => {
    if (!title) {
      alert("Por favor, insira o título do evento primeiro.");
      return;
    }

    setGeneratingId(id);
    try {
      const description = await generateEventDescription(title);
      if (description) {
        handleChangeEvento(index, "descricao", description);
      }
    } finally {
      setGeneratingId(null);
    }
  };

  const handleSaveItem = async (index: number) => {
    const evento = eventos[index];
    setSavingId(evento.id);
    try {
      const saved = await saveEvento(evento);
      const updated = [...eventos];
      updated[index] = saved;
      setEventos(updated);
      setToastMessage("Evento e lista de ganhadores salvos com sucesso!");
      setShowToast(true);
    } catch (err: any) {
      alert("Erro ao salvar evento: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      for (const ev of eventos) {
        await saveEvento(ev);
      }
      setToastMessage("Todos os eventos e prêmios foram salvos com sucesso!");
      setShowToast(true);
      await loadData();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#0B3C8C] p-3 rounded-xl text-white shadow-md">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-sans text-gray-900">Gerenciador de Eventos & Ganhadores</h1>
              <span className="bg-[#D62828] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Especial 42 Anos
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Cadastre seus eventos, adicione os ganhadores e fotos dos 42 prêmios sorteados
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleAddEvento} 
            className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" /> Novo Evento
          </button>
          <button 
            onClick={handleSaveAll} 
            className="bg-[#0B3C8C] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] transition-colors shadow-sm text-sm"
          >
            <Save className="h-4 w-4" /> Salvar Tudo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3C8C]"></div>
          <p className="text-gray-500 font-medium text-sm">Carregando eventos e prêmios...</p>
        </div>
      ) : loadError ? (
        <div className="bg-red-50 border-2 border-red-200 p-8 rounded-2xl text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Erro ao carregar dados</h2>
          <p className="text-red-600 mb-6 max-w-md mx-auto">{loadError}</p>
          <button 
            onClick={loadData}
            className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {eventos.map((evento, index) => {
            const ganhadores = evento.ganhadores || [];
            const totalPremios = evento.total_premios || 42;
            const isExpanded = expandedGanhadores[evento.id] ?? true;

            return (
              <div 
                key={evento.id} 
                className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative"
              >
                {/* Cabeçalho do Card do Evento */}
                <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#0B3C8C] text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                      Evento #{index + 1}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 font-sans">
                      {evento.titulo || "Evento sem título"}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Link para ver a página pública com o carrossel */}
                    <a
                      href={`/eventos/${evento.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#0B3C8C] hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                      title="Abrir página pública do evento"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver no Site
                    </a>

                    <button 
                      onClick={() => setConfirmDeleteId(evento.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Excluir evento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Modal de confirmação de exclusão */}
                {confirmDeleteId === evento.id && (
                  <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-200">
                    <Trash2 className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir este evento?</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md">
                      Esta ação removerá o evento e todas as fotos dos prêmios cadastrados permanentemente.
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => handleRemoveEvento(evento.id)}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm"
                      >
                        Confirmar Exclusão
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-6 md:p-8 space-y-8">
                  {/* Seção 1: Dados Gerais do Evento */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#0B3C8C] mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#D62828]" />
                      Dados Gerais do Evento
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      <div className="md:col-span-6">
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                          Nome / Título do Evento *
                        </label>
                        <input 
                          type="text" 
                          value={evento.titulo}
                          onChange={(e) => handleChangeEvento(index, "titulo", e.target.value)}
                          placeholder="Ex: Confraternização 42 Anos de Aniversário"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B3C8C] outline-none text-sm font-medium"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                          Data do Evento
                        </label>
                        <input 
                          type="date" 
                          value={evento.data_evento}
                          onChange={(e) => handleChangeEvento(index, "data_evento", e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B3C8C] outline-none text-sm"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                          Total de Prêmios
                        </label>
                        <input 
                          type="number" 
                          min={1}
                          max={100}
                          value={evento.total_premios || 42}
                          onChange={(e) => handleChangeEvento(index, "total_premios", parseInt(e.target.value, 10) || 42)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B3C8C] outline-none text-sm font-bold text-[#D62828]"
                        />
                      </div>

                      <div className="md:col-span-12">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Descrição do Evento
                          </label>
                          <button 
                            onClick={() => handleGenerateAI(index, evento.titulo, evento.id)}
                            disabled={generatingId === evento.id}
                            className="text-xs font-bold text-[#0B3C8C] flex items-center gap-1.5 hover:text-[#D62828] transition-colors disabled:opacity-50"
                            title="Gerar descrição com IA"
                          >
                            {generatingId === evento.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                            IA Sugerir
                          </button>
                        </div>
                        <textarea 
                          value={evento.descricao}
                          onChange={(e) => handleChangeEvento(index, "descricao", e.target.value)}
                          placeholder="Conte detalhes sobre a comemoração e o sorteio de prêmios..."
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B3C8C] outline-none text-sm leading-relaxed"
                        />
                      </div>

                      <div className="md:col-span-12">
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                          Foto de Capa do Evento (Banner)
                        </label>
                        <FileUpload 
                          value={evento.imagem_capa}
                          onChange={(url) => handleChangeEvento(index, "imagem_capa", url)}
                          title="Foto de Capa do Evento"
                          folder="eventos"
                          heightClass="h-40"
                        />
                      </div>

                      <div className="md:col-span-12">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Galeria de Fotos do Evento (Imagens da Comemoração)
                          </label>
                          <span className="text-[11px] text-gray-400">
                            {(evento.imagens || []).length} fotos adicionadas
                          </span>
                        </div>
                        <MultiFileUpload 
                          value={evento.imagens || []}
                          onChange={(urls) => handleChangeEvento(index, "imagens", urls)}
                          folder="eventos/galeria"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                          Fotos e registros gerais da festa ou cerimônia que serão exibidas na galeria do evento.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Seção 2: Gerenciador dos 42 Prêmios & Ganhadores com Fotos */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-red-50/50 p-6 rounded-2xl border border-blue-100 mb-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-[#D62828] bg-white px-2.5 py-1 rounded-md shadow-sm">
                              Sorteio dos {totalPremios} Prêmios
                            </span>
                            <h4 className="text-lg font-bold text-gray-900 font-sans">
                              Ganhadores e Fotos com os Prêmios
                            </h4>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            A cada sorteio realizado, alimente este evento adicionando o nome do ganhador, o prêmio e a foto!
                          </p>
                        </div>

                        {/* Placar e Botões de Ação */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          {ganhadores.length > 1 && (
                            <div className="inline-flex rounded-xl shadow-sm border border-amber-300 overflow-hidden bg-amber-50">
                              <button
                                onClick={() => handleSortGanhadoresByDate(index, "asc")}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100 transition-colors"
                                title="Organizar todas as fotos e ganhadores em ordem cronológica por data (do 1º ao mais recente) e corrigir numeração sequencial (#1, #2, #3...)"
                              >
                                <CalendarDays className="w-3.5 h-3.5 text-amber-700" />
                                <span>Ordenar Fotos por Data</span>
                              </button>
                              <button
                                onClick={() => handleSortGanhadoresByDate(index, "desc")}
                                className="px-2.5 py-2 text-[10px] font-bold text-amber-900 hover:bg-amber-100 border-l border-amber-300 transition-colors"
                                title="Ordenar da data mais recente para a mais antiga"
                              >
                                <ArrowUpDown className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => handleAddGanhador(index)}
                            className="inline-flex items-center gap-2 bg-[#0B3C8C] hover:bg-[#082a63] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar Ganhador
                          </button>

                          {ganhadores.length === 0 && (
                            <button
                              onClick={() => handleGenerate42Slots(index)}
                              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm"
                              title="Cria automaticamente 42 posições para você ir preenchendo conforme forem sorteados"
                            >
                              <Gift className="w-4 h-4 text-amber-500" />
                              Gerar {totalPremios} Slots
                            </button>
                          )}

                          <button
                            onClick={() => setExpandedGanhadores({ ...expandedGanhadores, [evento.id]: !isExpanded })}
                            className="p-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            title={isExpanded ? "Ocultar lista" : "Expandir lista"}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Barra de Progresso dos Sorteios */}
                      <div className="mt-4 pt-4 border-t border-blue-100/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span>
                            <strong>{ganhadores.length}</strong> de <strong>{totalPremios}</strong> prêmios cadastrados
                          </span>
                        </div>

                        <div className="w-full sm:w-64 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-[#D62828] rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (ganhadores.length / totalPremios) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Lista de Ganhadores Cadastrados (Exibidos de 4 em 4) */}
                    {isExpanded && (
                      <div className="space-y-4">
                        {ganhadores.length > 0 ? (
                          <>
                            {(() => {
                              const itemsPerPage = 4;
                              const totalPages = Math.ceil(ganhadores.length / itemsPerPage) || 1;
                              const currentPage = Math.min(ganhadoresPages[evento.id] || 1, totalPages);
                              const startIndex = (currentPage - 1) * itemsPerPage;
                              const currentGanhadores = ganhadores.slice(startIndex, startIndex + itemsPerPage);

                              return (
                                <div className="space-y-4">
                                  {/* Controles de Paginação & Informação */}
                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                                    <div className="text-xs font-bold text-gray-700">
                                      Exibindo prêmios <span className="text-[#0B3C8C]">{startIndex + 1}</span> a <span className="text-[#0B3C8C]">{Math.min(ganhadores.length, startIndex + itemsPerPage)}</span> de <span className="text-[#0B3C8C]">{ganhadores.length}</span> (Página {currentPage} de {totalPages})
                                    </div>

                                    {/* Paginação Navegação */}
                                    {totalPages > 1 && (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => setGanhadoresPages({ ...ganhadoresPages, [evento.id]: Math.max(1, currentPage - 1) })}
                                          disabled={currentPage === 1}
                                          className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-40 transition-colors"
                                        >
                                          Anterior
                                        </button>
                                        <div className="flex items-center gap-1">
                                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                              key={page}
                                              type="button"
                                              onClick={() => setGanhadoresPages({ ...ganhadoresPages, [evento.id]: page })}
                                              className={`w-7 h-7 text-xs font-bold rounded-lg transition-all ${
                                                currentPage === page
                                                  ? "bg-[#0B3C8C] text-white shadow-xs"
                                                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                              }`}
                                            >
                                              {page}
                                            </button>
                                          ))}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => setGanhadoresPages({ ...ganhadoresPages, [evento.id]: Math.min(totalPages, currentPage + 1) })}
                                          disabled={currentPage === totalPages}
                                          className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-40 transition-colors"
                                        >
                                          Próxima
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Grid dos Ganhadores (4 por página) */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {currentGanhadores.map((ganhador, localIdx) => {
                                      const gIndex = startIndex + localIdx;
                                      return (
                                        <div 
                                          key={ganhador.id || gIndex}
                                          id={`ganhador-${ganhador.id}`}
                                          data-ganhador-id={ganhador.id}
                                          className="bg-gray-50/80 hover:bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 relative group/item"
                                        >
                                          {/* Header do Card do Ganhador */}
                                          <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="w-7 h-7 rounded-lg bg-[#D62828] text-white flex items-center justify-center font-black text-xs shadow-xs">
                                                #{ganhador.numero || gIndex + 1}
                                              </span>
                                              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Prêmio #{ganhador.numero || gIndex + 1} de {totalPremios}
                                              </span>
                                              {ganhador.data_sorteio && (
                                                <span className="text-[11px] bg-blue-50 text-[#0B3C8C] border border-blue-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                  <CalendarDays className="w-3 h-3 text-[#0B3C8C]" />
                                                  {new Date(ganhador.data_sorteio).toLocaleDateString('pt-BR')}
                                                </span>
                                              )}
                                            </div>

                                            <button
                                              onClick={() => handleRemoveGanhador(index, gIndex)}
                                              className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors"
                                              title="Remover ganhador"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Nome do Ganhador */}
                                            <div>
                                              <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-[#0B3C8C]" />
                                                Nome do Ganhador *
                                              </label>
                                              <input 
                                                type="text"
                                                value={ganhador.nome_ganhador}
                                                onChange={(e) => handleChangeGanhador(index, gIndex, "nome_ganhador", e.target.value)}
                                                placeholder="Ex: Carlos Eduardo"
                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0B3C8C] outline-none"
                                              />
                                            </div>

                                            {/* Nome do Prêmio com 4 Prêmios Fixos */}
                                            <div className="space-y-1.5">
                                              <div className="flex items-center justify-between">
                                                <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                                  <Gift className="w-3.5 h-3.5 text-amber-500" />
                                                  Nome do Prêmio *
                                                </label>
                                                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                                                  4 Prêmios Oficiais
                                                </span>
                                              </div>

                                              {/* 4 Botões Rápidos dos Prêmios Fixos */}
                                              <div className="grid grid-cols-2 gap-1.5">
                                                {PREMIOS_FIXOS.map((premio) => {
                                                  const isSelected = (ganhador.nome_premio || "").trim().toLowerCase() === premio.toLowerCase();
                                                  return (
                                                    <button
                                                      key={premio}
                                                      type="button"
                                                      onClick={() => handleChangeGanhador(index, gIndex, "nome_premio", premio)}
                                                      className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                                                        isSelected 
                                                          ? "bg-[#0B3C8C] text-white border-[#0B3C8C] shadow-sm font-bold ring-2 ring-[#0B3C8C]/20" 
                                                          : "bg-white hover:bg-blue-50/80 text-gray-700 border-gray-200 hover:border-blue-300"
                                                      }`}
                                                      title={`Selecionar ${premio}`}
                                                    >
                                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-amber-400" : "bg-gray-300"}`} />
                                                      <span className="truncate text-[11px] leading-tight">{premio}</span>
                                                    </button>
                                                  );
                                                })}
                                              </div>

                                              {/* Campo de Seleção / Digitação */}
                                              <div className="flex gap-1.5">
                                                <select
                                                  value={
                                                    PREMIOS_FIXOS.some(p => p.toLowerCase() === (ganhador.nome_premio || "").toLowerCase())
                                                      ? PREMIOS_FIXOS.find(p => p.toLowerCase() === (ganhador.nome_premio || "").toLowerCase())
                                                      : (ganhador.nome_premio ? "outro" : "")
                                                  }
                                                  onChange={(e) => {
                                                    if (e.target.value && e.target.value !== "outro") {
                                                      handleChangeGanhador(index, gIndex, "nome_premio", e.target.value);
                                                    }
                                                  }}
                                                  className="w-1/2 px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#0B3C8C] outline-none"
                                                >
                                                  <option value="">Escolher Prêmio Fixo...</option>
                                                  {PREMIOS_FIXOS.map((p) => (
                                                    <option key={p} value={p}>{p}</option>
                                                  ))}
                                                  <option value="outro">Personalizado...</option>
                                                </select>

                                                <input 
                                                  type="text"
                                                  list="premios-fixos-list"
                                                  value={ganhador.nome_premio}
                                                  onChange={(e) => handleChangeGanhador(index, gIndex, "nome_premio", e.target.value)}
                                                  placeholder="Digite ou ajuste..."
                                                  className="w-1/2 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#0B3C8C] outline-none"
                                                />
                                              </div>
                                            </div>
                                          </div>

                                          {/* Upload da Foto do Ganhador com o Prêmio */}
                                          <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                                              <ImageIcon className="w-3.5 h-3.5 text-[#D62828]" />
                                              Foto do Ganhador com o Prêmio
                                            </label>
                                            <FileUpload 
                                              value={ganhador.foto_ganhador}
                                              onChange={(url) => handleChangeGanhador(index, gIndex, "foto_ganhador", url)}
                                              title={`Foto do Ganhador #${ganhador.numero || gIndex + 1}`}
                                              folder="ganhadores"
                                              heightClass="h-36"
                                            />
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                            <div>
                                              <label className="block text-[11px] font-bold text-gray-500 mb-1">Data do Sorteio</label>
                                              <input 
                                                type="date"
                                                value={ganhador.data_sorteio || ""}
                                                onChange={(e) => handleChangeGanhador(index, gIndex, "data_sorteio", e.target.value)}
                                                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[11px] font-bold text-gray-500 mb-1">Observações (opcional)</label>
                                              <input 
                                                type="text"
                                                value={ganhador.observacoes || ""}
                                                onChange={(e) => handleChangeGanhador(index, gIndex, "observacoes", e.target.value)}
                                                placeholder="Ex: Loja Centro"
                                                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Botão "Adicionar Ganhador" sempre à frente da última criada / no rodapé da página atual */}
                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-2 border-t border-gray-200">
                                    <div className="text-xs text-gray-500 font-medium">
                                      ✨ O botão de adicionar novo ganhador acompanha sempre a última posição criada.
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleAddGanhador(index)}
                                      className="inline-flex items-center gap-2 bg-[#0B3C8C] hover:bg-[#082a63] text-white px-5 py-3 rounded-xl font-bold text-xs transition-colors shadow-md w-full sm:w-auto justify-center"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Adicionar Ganhador (Próximo)
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <Gift className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 font-bold text-sm">Nenhum ganhador cadastrado neste evento ainda.</p>
                            <p className="text-gray-400 text-xs mt-1">
                              Clique no botão "+ Adicionar Ganhador" acima ou abaixo para cadastrar a cada sorteio realizado!
                            </p>
                            <button
                              type="button"
                              onClick={() => handleAddGanhador(index)}
                              className="mt-4 inline-flex items-center gap-2 bg-[#0B3C8C] text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-[#082a63] transition-colors"
                            >
                              <Plus className="w-4 h-4" /> Adicionar Primeiro Ganhador
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Botão Salvar Este Evento */}
                  <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Salva alterações no evento e em todos os ganhadores cadastrados
                    </div>

                    <button 
                      onClick={() => handleSaveItem(index)}
                      disabled={savingId === evento.id}
                      className="w-full sm:w-auto px-8 py-3 bg-[#0B3C8C] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] disabled:opacity-50 transition-all shadow-md text-sm"
                    >
                      {savingId === evento.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Salvar Evento & Ganhadores
                    </button>
                  </div>

                </div>
              </div>
            );
          })}

          {eventos.length === 0 && (
            <div className="py-20 text-center bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8 shadow-sm">
              <Gift className="w-14 h-14 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum evento cadastrado</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                Crie a confraternização dos 42 anos da empresa e comece a cadastrar os 42 prêmios e fotos dos ganhadores!
              </p>
              <button
                onClick={handleAddEvento}
                className="inline-flex items-center gap-2 bg-[#0B3C8C] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#082a63] transition-colors"
              >
                <Plus className="w-4 h-4" /> Criar Primeiro Evento
              </button>
            </div>
          )}
        </div>
      )}

      <SaveToast 
        show={showToast} 
        onClose={() => setShowToast(false)} 
        message={toastMessage} 
      />
    </div>
  );
};
