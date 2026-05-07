import React, { useState, useEffect } from "react";
import { Save, PlusCircle, Trash2, Edit, X, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { SaveToast } from "../../components/ui/SaveToast";
import { FileUpload } from "../../components/ui/FileUpload";
import { supabase } from "../../lib/supabase";

export const SetoresEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [setores, setSetores] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    titulo: "",
    descricao: "",
    fotos: [] as string[]
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadSetores();
  }, []);

  const loadSetores = async () => {
    const { data } = await supabase.from('setores').select('*').order('nome');
    if (data) setSetores(data);
  };

  const resetForm = () => {
    setFormData({ nome: "", titulo: "", descricao: "", fotos: [] });
    setEditId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await supabase.from('setores').update(formData).eq('id', editId);
    } else {
      await supabase.from('setores').insert([formData]);
    }
    loadSetores();
    resetForm();
    setShowToast(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await supabase.from('setores').delete().eq('id', deleteId);
      loadSetores();
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold">Gerenciar Setores</h1>
             <button onClick={() => setIsFormOpen(true)} className="bg-[#0B3C8C] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> Adicionar Setor
            </button>
        </div>

        {isFormOpen && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
                <input required placeholder="Nome do Setor" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-2 border rounded" />
                <input required placeholder="Título" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full p-2 border rounded" />
                <textarea required placeholder="Descrição" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full p-2 border rounded h-24" />
                
                <h3 className="font-bold">Fotos (Máximo 10)</h3>
                <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <FileUpload
                            key={i}
                            value={formData.fotos[i] || ""}
                            onChange={(val) => {
                                const newFotos = [...formData.fotos];
                                newFotos[i] = val;
                                setFormData({...formData, fotos: newFotos.filter(f => f)});
                            }}
                            title={`Foto ${i + 1}`}
                            accept="image/*"
                            type="image"
                            bucket="assets"
                            folder="setores"
                        />
                    ))}
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Salvar</button>
                    <button type="button" onClick={resetForm} className="bg-gray-200 px-4 py-2 rounded">Cancelar</button>
                </div>
            </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
            {setores.map(setor => (
                <div key={setor.id} className="p-4 flex justify-between items-center">
                    <span>{setor.nome}</span>
                    <div className="flex gap-2">
                        <button onClick={() => { setEditId(setor.id); setFormData(setor); setIsFormOpen(true); }}><Edit className="h-5 w-5 text-gray-500"/></button>
                        <button onClick={() => setDeleteId(setor.id)}><Trash2 className="h-5 w-5 text-red-500"/></button>
                    </div>
                </div>
            ))}
        </div>
        <SaveToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
