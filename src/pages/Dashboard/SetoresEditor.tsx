import { Save, Plus, Trash2, LayoutGrid, Sparkles, Loader2, Images } from "lucide-react";
import React, { useState, useEffect } from "react";
import { SaveToast } from "../../components/ui/SaveToast";
import { FileUpload } from "../../components/ui/FileUpload";
import { MultiFileUpload } from "../../components/ui/MultiFileUpload";
import { supabase } from "../../lib/supabase";
import { generateSectorDescription } from "../../services/geminiService";

export const SetoresEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [setores, setSetores] = useState<any[]>([]);
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
      const { data, error } = await supabase.from('setores').select('*').order('nome');
      if (error) throw error;
      if (data) setSetores(data);
    } catch (err: any) {
      console.error("Erro ao carregar setores:", err);
      let msg = err.message;
      if (msg.includes("column") || msg.includes("cache")) {
        msg = "Erro de Banco de Dados: As colunas 'descricao' (tipo Text), 'imagem' (tipo Text) e 'imagens' (tipo Text Array - text[]) precisam ser criadas na tabela 'setores' no painel do Supabase para que os dados apareçam.";
      }
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSetores([...setores, { nome: "", descricao: "", imagem: "", imagens: [], id: `temp-${Date.now()}` }]);
  };

  const handleRemove = async (id: string, index: number) => {
    if (typeof id === 'string' && id.startsWith('temp-')) {
      setSetores(setores.filter((_, i) => i !== index));
      setConfirmDeleteId(null);
      return;
    }

    try {
      const { error } = await supabase.from('setores').delete().eq('id', id);
      if (!error) {
        setSetores(setores.filter((_, i) => i !== index));
        setConfirmDeleteId(null);
      } else {
        alert("Erro ao excluir: " + error.message);
      }
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newSetores = [...setores];
    newSetores[index] = { ...newSetores[index], [field]: value };
    setSetores(newSetores);
  };

  const handleGenerateAI = async (index: number, sectorName: string, id: string) => {
    if (!sectorName) {
      alert("Por favor, insira o nome do setor primeiro.");
      return;
    }

    setGeneratingId(id);
    try {
      const description = await generateSectorDescription(sectorName);
      if (description) {
        handleChange(index, 'descricao', description);
      }
    } finally {
      setGeneratingId(null);
    }
  };

  const handleSaveItem = async (index: number) => {
    const setor = setores[index];
    setSavingId(setor.id);
    try {
      const payload: any = {
        nome: setor.nome,
        descricao: setor.descricao,
        imagem: setor.imagem,
        imagens: setor.imagens || []
      };
      
      let result;
      if (typeof setor.id === 'string' && !setor.id.startsWith('temp-')) {
        result = await supabase.from('setores').update(payload).eq('id', setor.id);
      } else {
        result = await supabase.from('setores').insert([payload]);
      }

      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setShowToast(true);
      loadData();
    } catch (err: any) {
      let msg = err.message;
      if (msg.includes("column") && msg.includes("descricao")) {
        msg = "A coluna 'descricao' não foi encontrada na tabela 'setores' do Supabase. Adicione-a como tipo 'text'.";
      } else if (msg.includes("column") && msg.includes("imagem")) {
        msg = "A coluna 'imagem' não foi encontrada na tabela 'setores' do Supabase. Adicione-a como tipo 'text'.";
      } else if (msg.includes("column") && msg.includes("imagens")) {
        msg = "A coluna 'imagens' não foi encontrada na tabela 'setores' do Supabase. Adicione-a como tipo 'text[]' (Array de Texto).";
      }
      alert("Erro ao salvar setor: " + msg);
    } finally {
      setSavingId(null);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      for (const setor of setores) {
        const payload: any = {
          nome: setor.nome,
          descricao: setor.descricao,
          imagem: setor.imagem,
          imagens: setor.imagens || []
        };
        
        let result;
        if (typeof setor.id === 'string' && !setor.id.startsWith('temp-')) {
          result = await supabase.from('setores').update(payload).eq('id', setor.id);
        } else {
          result = await supabase.from('setores').insert([payload]);
        }

        if (result.error) {
          throw new Error(`Erro no setor "${setor.nome}": ${result.error.message}`);
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
             <LayoutGrid className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sans text-gray-900">Gerenciar Setores</h1>
            <p className="text-sm text-gray-500">Adicione e edite os departamentos exibidos no site</p>
          </div>
        </div>
        <div className="flex gap-3">
            <button onClick={handleAdd} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                <Plus className="h-5 w-5" /> Adicionar Setor
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
          {setores.map((setor, index) => (
            <div key={setor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group">
              {/* Header do Card */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Setor #{index + 1}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setConfirmDeleteId(setor.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Overlay de Confirmação de Exclusão */}
              {confirmDeleteId === setor.id && (
                <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-200">
                  <Trash2 className="h-10 w-10 text-red-500 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir este setor?</h3>
                  <p className="text-sm text-gray-500 mb-6">Esta ação não pode ser desfeita e removerá o setor do site.</p>
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => handleRemove(setor.id, index)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Setor</label>
                  <input 
                    type="text" 
                    value={setor.nome}
                    onChange={(e) => handleChange(index, 'nome', e.target.value)}
                    placeholder="Ex: Padaria e Confeitaria"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-bold text-gray-700">Descrição</label>
                    <button 
                      onClick={() => handleGenerateAI(index, setor.nome, setor.id)}
                      disabled={generatingId === setor.id}
                      className="text-xs font-bold text-[#0B3C8C] flex items-center gap-1.5 hover:text-[#D62828] transition-colors disabled:opacity-50"
                      title="Gerar descrição com IA"
                    >
                      {generatingId === setor.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      IA Gerar
                    </button>
                  </div>
                  <textarea 
                    value={setor.descricao}
                    onChange={(e) => handleChange(index, 'descricao', e.target.value)}
                    placeholder="Breve descrição dos produtos deste setor..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none resize-none text-sm leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Foto de Capa</label>
                    <FileUpload 
                      value={setor.imagem}
                      onChange={(url) => handleChange(index, 'imagem', url)}
                      title="Foto Principal"
                      folder="setores"
                      heightClass="h-40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Imagens do Slide (Interno)</label>
                    <MultiFileUpload 
                      value={setor.imagens || []}
                      onChange={(urls) => handleChange(index, 'imagens', urls as any)}
                      folder="setores"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Fotos que aparecerão quando o cliente clicar para conhecer o setor.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => handleSaveItem(index)}
                    disabled={savingId === setor.id}
                    className="w-full py-2.5 bg-[#0B3C8C] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] disabled:opacity-50 transition-all shadow-sm"
                  >
                    {savingId === setor.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          ))}
          {setores.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-500">Nenhum setor cadastrado. Clique em "Adicionar Setor" para começar.</p>
            </div>
          )}
        </div>
      )}

      <SaveToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
