import { Save, Plus, Trash2, Calendar, Sparkles, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { SaveToast } from "../../components/ui/SaveToast";
import { FileUpload } from "../../components/ui/FileUpload";
import { MultiFileUpload } from "../../components/ui/MultiFileUpload";
import { supabase } from "../../lib/supabase";
import { generateEventDescription } from "../../services/geminiService";

export const EventosEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.from('eventos').select('*').order('titulo');
      if (error) throw error;
      if (data) setEventos(data);
    } catch (err: any) {
      console.error("Erro ao carregar eventos:", err);
      let msg = err.message;
      if (msg.includes("relation \"public.eventos\" does not exist")) {
        msg = "A tabela 'eventos' não existe no banco de dados. Por favor, crie-a no editor SQL do Supabase.";
      }
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEventos([...eventos, { titulo: "", descricao: "", imagem_capa: "", imagens: [], data_evento: "", id: `temp-${Date.now()}` }]);
  };

  const handleRemove = async (id: string, index: number) => {
    if (typeof id === 'string' && id.startsWith('temp-')) {
      setEventos(eventos.filter((_, i) => i !== index));
      setConfirmDeleteId(null);
      return;
    }

    try {
      const { error } = await supabase.from('eventos').delete().eq('id', id);
      if (!error) {
        setEventos(eventos.filter((_, i) => i !== index));
        setConfirmDeleteId(null);
      } else {
        alert("Erro ao excluir: " + error.message);
      }
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newEventos = [...eventos];
    newEventos[index] = { ...newEventos[index], [field]: value };
    setEventos(newEventos);
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
        handleChange(index, 'descricao', description);
      }
    } finally {
      setGeneratingId(null);
    }
  };

  const handleSaveItem = async (index: number) => {
    const evento = eventos[index];
    setSavingId(evento.id);
    try {
      const payload: any = {
        titulo: evento.titulo,
        descricao: evento.descricao,
        imagem_capa: evento.imagem_capa,
        imagens: evento.imagens || [],
        data_evento: evento.data_evento || null
      };
      
      let result;
      if (typeof evento.id === 'string' && !evento.id.startsWith('temp-')) {
        result = await supabase.from('eventos').update(payload).eq('id', evento.id);
      } else {
        result = await supabase.from('eventos').insert([payload]);
      }

      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setShowToast(true);
      loadData();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      for (const evento of eventos) {
        const payload: any = {
          titulo: evento.titulo,
          descricao: evento.descricao,
          imagem_capa: evento.imagem_capa,
          imagens: evento.imagens || [],
          data_evento: evento.data_evento || null
        };
        
        let result;
        if (typeof evento.id === 'string' && !evento.id.startsWith('temp-')) {
          result = await supabase.from('eventos').update(payload).eq('id', evento.id);
        } else {
          result = await supabase.from('eventos').insert([payload]);
        }

        if (result.error) {
          throw new Error(`Erro no evento "${evento.titulo}": ${result.error.message}`);
        }
      }
      setShowToast(true);
      loadData();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-50 p-3 rounded-lg text-[#D62828]">
             <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sans text-gray-900">Gerenciar Eventos</h1>
            <p className="text-sm text-gray-500">Adicione e edite os eventos especiais da loja</p>
          </div>
        </div>
        <div className="flex gap-3">
            <button onClick={handleAdd} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                <Plus className="h-5 w-5" /> Adicionar Evento
            </button>
            <button onClick={handleSave} className="bg-[#0B3C8C] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] transition-colors">
                <Save className="h-5 w-5" /> Salvar Tudo
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3C8C]"></div>
        </div>
      ) : loadError ? (
        <div className="bg-red-50 border-2 border-red-200 p-8 rounded-xl text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Erro ao carregar dados</h2>
          <p className="text-red-600 mb-6 max-w-md mx-auto">{loadError}</p>
          <button 
            onClick={loadData}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {eventos.map((evento, index) => (
            <div key={evento.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Evento #{index + 1}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setConfirmDeleteId(evento.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {confirmDeleteId === evento.id && (
                <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-200">
                  <Trash2 className="h-10 w-10 text-red-500 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir este evento?</h3>
                  <p className="text-sm text-gray-500 mb-6">Esta ação removerá o evento do site permanentemente.</p>
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => handleRemove(evento.id, index)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Título do Evento</label>
                    <input 
                      type="text" 
                      value={evento.titulo}
                      onChange={(e) => handleChange(index, 'titulo', e.target.value)}
                      placeholder="Ex: Páscoa Premiada"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Data (Opcional)</label>
                    <input 
                      type="date" 
                      value={evento.data_evento}
                      onChange={(e) => handleChange(index, 'data_evento', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-bold text-gray-700">Descrição do Evento</label>
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
                    onChange={(e) => handleChange(index, 'descricao', e.target.value)}
                    placeholder="Conte mais sobre as atrações do evento..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none resize-none text-sm leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Foto de Capa</label>
                    <FileUpload 
                      value={evento.imagem_capa}
                      onChange={(url) => handleChange(index, 'imagem_capa', url)}
                      title="Foto Principal"
                      folder="eventos"
                      heightClass="h-40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Fotos do Evento (Slide)</label>
                    <MultiFileUpload 
                      value={evento.imagens || []}
                      onChange={(urls) => handleChange(index, 'imagens', urls as any)}
                      folder="eventos"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => handleSaveItem(index)}
                    disabled={savingId === evento.id}
                    className="w-full py-2.5 bg-[#0B3C8C] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] disabled:opacity-50 transition-all shadow-sm"
                  >
                    {savingId === evento.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar Evento
                  </button>
                </div>
              </div>
            </div>
          ))}
          {eventos.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-500">Nenhum evento cadastrado. Clique em "Adicionar Evento" para começar.</p>
            </div>
          )}
        </div>
      )}

      <SaveToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
