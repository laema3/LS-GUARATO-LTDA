import { useState, useEffect } from "react";
import { Save, Briefcase, PlusCircle, Trash2, Edit } from "lucide-react";
import { SaveToast } from "../../components/ui/SaveToast";
import { supabase } from "../../lib/supabase";

export const VagasEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [empresas, setEmpresas] = useState<string[]>([]);
  const [beneficiosList, setBeneficiosList] = useState<string[]>([]);
  const [criteriosList, setCriteriosList] = useState<string[]>([]);

  const [vagasCadastradas, setVagasCadastradas] = useState<any[]>([]);

  useEffect(() => {
    loadParametros();
    loadVagas();
  }, []);

  const loadParametros = async () => {
    const { data } = await supabase.from('vagas_parametros').select('*').eq('id', 1).single();
    if (data) {
      if (data.empresas) setEmpresas(data.empresas);
      if (data.beneficios) setBeneficiosList(data.beneficios);
      if (data.criterios) setCriteriosList(data.criterios);
      setFormData(prev => ({ ...prev, empresa: data.empresas?.[0] || "" }));
    }
  };

  const loadVagas = async () => {
    const { data } = await supabase.from('vagas').select('*').order('created_at', { ascending: false });
    if (data) setVagasCadastradas(data);
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    cargo: string;
    empresa: string;
    remuneracao: string;
    cargaHoraria: string;
    observacoes: string;
    beneficios: string[];
    criterios: string[];
  }>({
    cargo: "",
    empresa: "",
    remuneracao: "",
    cargaHoraria: "",
    observacoes: "",
    beneficios: [],
    criterios: [],
  });

  const resetForm = () => {
    setFormData({
      cargo: "",
      empresa: empresas[0] || "",
      remuneracao: "",
      cargaHoraria: "",
      observacoes: "",
      beneficios: [],
      criterios: [],
    });
    setEditId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (vaga: any) => {
    setEditId(vaga.id);
    setFormData({
      cargo: vaga.cargo || "",
      empresa: vaga.empresa || "",
      remuneracao: vaga.remuneracao || "",
      cargaHoraria: vaga.carga_horaria || "",
      observacoes: vaga.observacoes || "",
      beneficios: vaga.beneficios || [],
      criterios: vaga.criterios || [],
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCheckboxChange = (field: "beneficios" | "criterios", value: string) => {
    setFormData(prev => {
      const currentList = prev[field];
      if (currentList.includes(value)) {
        return { ...prev, [field]: currentList.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...currentList, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cargo || !formData.empresa || !formData.remuneracao || !formData.cargaHoraria || !formData.observacoes) {
      alert("Por favor, preencha todos os campos obrigatórios (incluindo observações).");
      return;
    }
    
    if (editId) {
      const { error } = await supabase.from('vagas').update({
        cargo: formData.cargo,
        empresa: formData.empresa,
        remuneracao: formData.remuneracao,
        carga_horaria: formData.cargaHoraria,
        observacoes: formData.observacoes,
        beneficios: formData.beneficios,
        criterios: formData.criterios
      }).eq('id', editId);
      
      if (!error) {
        loadVagas();
        resetForm();
        setShowToast(true);
      } else {
        alert("Erro ao atualizar vaga: " + error.message);
      }
    } else {
      const { error } = await supabase.from('vagas').insert([{
        cargo: formData.cargo,
        empresa: formData.empresa,
        remuneracao: formData.remuneracao,
        carga_horaria: formData.cargaHoraria,
        observacoes: formData.observacoes,
        beneficios: formData.beneficios,
        criterios: formData.criterios
      }]);

      if (!error) {
        loadVagas();
        resetForm();
        setShowToast(true);
      } else {
        alert("Erro ao salvar vaga: " + error.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta vaga?")) {
      await supabase.from('vagas').delete().eq('id', id);
      loadVagas();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <h1 className="text-2xl font-bold font-sans text-gray-900">Cadastrar Vagas</h1>
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-[#0B3C8C] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] transition-colors"
          >
            <PlusCircle className="h-5 w-5" /> Nova Vaga
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-[#0B3C8C]/20 border-t-4 border-t-[#0B3C8C]">
          <h2 className="text-xl font-bold font-sans text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#D62828]" /> {editId ? "Editar Vaga de Emprego" : "Nova Vaga de Emprego"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.cargo}
                    onChange={e => setFormData({...formData, cargo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
                    placeholder="Ex: Operador de Caixa"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa / Loja *</label>
                  <select 
                    required
                    value={formData.empresa}
                    onChange={e => setFormData({...formData, empresa: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all bg-white" 
                  >
                    {empresas.map(emp => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remuneração *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.remuneracao}
                    onChange={e => setFormData({...formData, remuneracao: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
                    placeholder="Ex: R$ 2.000,00 ou A combinar"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carga Horária *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.cargaHoraria}
                    onChange={e => setFormData({...formData, cargaHoraria: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
                    placeholder="Ex: 44h semanais (Escala 6x1)"
                  />
               </div>
            </div>

            {/* Checkboxes Beneficios */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
               <label className="block text-sm font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Benefícios (Selecione)</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {beneficiosList.map(ben => (
                   <label key={ben} className="flex items-center gap-2 cursor-pointer group">
                     <input 
                       type="checkbox" 
                       checked={formData.beneficios.includes(ben)}
                       onChange={() => handleCheckboxChange("beneficios", ben)}
                       className="w-4 h-4 text-[#0B3C8C] rounded border-gray-300 focus:ring-[#0B3C8C]" 
                     />
                     <span className="text-sm text-gray-700 group-hover:text-gray-900">{ben}</span>
                   </label>
                 ))}
               </div>
            </div>

            {/* Checkboxes Critérios */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
               <label className="block text-sm font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Critérios / Requisitos (Selecione)</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {criteriosList.map(crit => (
                   <label key={crit} className="flex items-center gap-2 cursor-pointer group">
                     <input 
                       type="checkbox" 
                       checked={formData.criterios.includes(crit)}
                       onChange={() => handleCheckboxChange("criterios", crit)}
                       className="w-4 h-4 text-[#0B3C8C] rounded border-gray-300 focus:ring-[#0B3C8C]" 
                     />
                     <span className="text-sm text-gray-700 group-hover:text-gray-900">{crit}</span>
                   </label>
                 ))}
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Observações *</label>
               <textarea 
                 required
                 value={formData.observacoes}
                 onChange={e => setFormData({...formData, observacoes: e.target.value})}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none min-h-[100px] focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
                 placeholder="Ex: Vaga também extensiva para PCD. Necessário apresentar referências..."
               />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
               <button 
                 type="button" 
                 onClick={resetForm}
                 className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
               >
                 Cancelar
               </button>
               <button 
                 type="submit"
                 className="bg-[#D62828] hover:bg-[#b52020] text-white px-8 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
               >
                 <Save className="h-5 w-5" /> {editId ? "Atualizar Vaga" : "Salvar Vaga"}
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Vagas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold font-sans text-gray-900">Vagas Cadastradas</h2>
          <span className="bg-[#0B3C8C]/10 text-[#0B3C8C] py-1 px-3 rounded-full text-sm font-bold">{vagasCadastradas.length} vagas</span>
        </div>
        <div className="divide-y divide-gray-100">
          {vagasCadastradas.map(vaga => (
            <div key={vaga.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50/50 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-100 text-[#0B3C8C] rounded-full uppercase tracking-wide">
                    {vaga.empresa}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{vaga.cargo}</h3>
                <p className="text-sm text-gray-500">
                  Remuneração: <span className="font-medium text-gray-700">{vaga.remuneracao}</span> • 
                  Carga: <span className="font-medium text-gray-700">{vaga.cargaHoraria}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(vaga)} className="text-gray-500 hover:text-[#0B3C8C] p-2 rounded-md hover:bg-blue-50 transition-colors">
                  <Edit className="h-5 w-5" />
                </button>
                <button onClick={() => handleDelete(vaga.id)} className="text-gray-500 hover:text-red-500 p-2 rounded-md hover:bg-red-50 transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          {vagasCadastradas.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Nenhuma vaga cadastrada.
            </div>
          )}
        </div>
      </div>
      <SaveToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
