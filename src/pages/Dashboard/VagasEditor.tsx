import React, { useState, useEffect } from "react";
import { Save, Briefcase, PlusCircle, Trash2, Edit, X, AlertTriangle } from "lucide-react";
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
    ativa: boolean;
  }>({
    cargo: "",
    empresa: "",
    remuneracao: "",
    cargaHoraria: "",
    observacoes: "",
    beneficios: [],
    criterios: [],
    ativa: true,
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      cargo: "",
      empresa: empresas[0] || "",
      remuneracao: "",
      cargaHoraria: "",
      observacoes: "",
      beneficios: [],
      criterios: [],
      ativa: true,
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
      ativa: vaga.ativa !== undefined ? vaga.ativa : true,
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

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleDeleteConfirmation = async () => {
    if (deleteId) {
      await supabase.from('vagas').delete().eq('id', deleteId);
      loadVagas();
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cargo || !formData.empresa || !formData.remuneracao || !formData.cargaHoraria || !formData.observacoes) {
      setAlertMessage("Por favor, preencha todos os campos obrigatórios (incluindo observações).");
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
        criterios: formData.criterios,
        ativa: formData.ativa
      }).eq('id', editId);
      
      if (!error) {
        loadVagas();
        resetForm();
        setShowToast(true);
      } else {
        setAlertMessage("Erro ao atualizar vaga: " + error.message);
      }
    } else {
      const { error } = await supabase.from('vagas').insert([{
        cargo: formData.cargo,
        empresa: formData.empresa,
        remuneracao: formData.remuneracao,
        carga_horaria: formData.cargaHoraria,
        observacoes: formData.observacoes,
        beneficios: formData.beneficios,
        criterios: formData.criterios,
        ativa: formData.ativa
      }]);

      if (!error) {
        loadVagas();
        resetForm();
        setShowToast(true);
      } else {
         setAlertMessage("Erro ao salvar vaga: " + error.message);
      }
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const toggleVagaStatus = async (vaga: any) => {
    const { error } = await supabase.from('vagas').update({
      ativa: !vaga.ativa
    }).eq('id', vaga.id);
    
    if (!error) {
      loadVagas();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-lg font-bold text-gray-900">Excluir Vaga</h3>
              </div>
              <button type="button" onClick={() => setDeleteId(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleDeleteConfirmation}
                className="px-4 py-2 bg-[#0B3C8C] hover:bg-[#082a63] text-white rounded-lg font-medium transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 text-center">
             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
               <AlertTriangle className="h-6 w-6 text-red-600" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">Atenção</h3>
             <p className="text-gray-600 mb-6">{alertMessage}</p>
             <button 
               type="button"
               onClick={() => setAlertMessage(null)}
               className="w-full px-4 py-2 bg-[#0B3C8C] hover:bg-[#082a63] text-white rounded-lg font-medium transition-colors"
             >
               Entendi
             </button>
          </div>
        </div>
      )}

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

            <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
               <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors cursor-pointer" 
                    onClick={() => setFormData({...formData, ativa: !formData.ativa})}
                    style={{ backgroundColor: formData.ativa ? '#0B3C8C' : '#D1D5DB' }}>
                 <span className={`${formData.ativa ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
               </div>
               <span className="text-sm font-bold text-[#0B3C8C]">
                 {formData.ativa ? 'Vaga Habilitada (Ficará visível no site)' : 'Vaga Desabilitada (Ficará oculta no site)'}
               </span>
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
                 className="bg-[#0B3C8C] hover:bg-[#082a63] text-white px-8 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
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
                  Carga: <span className="font-medium text-gray-700">{vaga.carga_horaria}</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleVagaStatus(vaga)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    vaga.ativa 
                      ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {vaga.ativa ? 'HABILITADA' : 'DESABILITADA'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(vaga)} className="text-gray-400 hover:text-[#0B3C8C] p-1.5 rounded-md hover:bg-blue-50 transition-colors">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(vaga.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
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
