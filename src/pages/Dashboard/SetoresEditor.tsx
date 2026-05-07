import { Save, Plus, Trash2, LayoutGrid } from "lucide-react";
import React, { useState, useEffect } from "react";
import { SaveToast } from "../../components/ui/SaveToast";
import { FileUpload } from "../../components/ui/FileUpload";
import { supabase } from "../../lib/supabase";

export const SetoresEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [setores, setSetores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('setores').select('*').order('nome');
      if (data) setSetores(data);
    } catch (err) {
      console.error("Erro ao carregar setores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSetores([...setores, { nome: "", descricao: "", imagem: "", id: `temp-${Date.now()}` }]);
  };

  const handleRemove = async (id: string, index: number) => {
    if (typeof id === 'string' && id.startsWith('temp-')) {
      setSetores(setores.filter((_, i) => i !== index));
      return;
    }

    if (confirm("Deseja realmente excluir este setor?")) {
      const { error } = await supabase.from('setores').delete().eq('id', id);
      if (!error) {
        setSetores(setores.filter((_, i) => i !== index));
      } else {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newSetores = [...setores];
    newSetores[index] = { ...newSetores[index], [field]: value };
    setSetores(newSetores);
  };

  const handleSave = async () => {
    try {
      for (const setor of setores) {
        const payload: any = {
          nome: setor.nome,
          descricao: setor.descricao,
          imagem: setor.imagem
        };
        
        if (typeof setor.id === 'string' && !setor.id.startsWith('temp-')) {
          await supabase.from('setores').update(payload).eq('id', setor.id);
        } else {
          await supabase.from('setores').insert([payload]);
        }
      }
      setShowToast(true);
      loadData();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {setores.map((setor, index) => (
            <div key={setor.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4 relative group">
              <button 
                onClick={() => handleRemove(setor.id, index)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-5 w-5" />
              </button>

              <div className="space-y-4">
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                  <textarea 
                    value={setor.descricao}
                    onChange={(e) => handleChange(index, 'descricao', e.target.value)}
                    placeholder="Breve descrição dos produtos deste setor..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Imagem do Setor</label>
                  <FileUpload 
                    value={setor.imagem}
                    onChange={(url) => handleChange(index, 'imagem', url)}
                    title="Selecionar Imagem"
                    folder="setores"
                    heightClass="h-40"
                  />
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
