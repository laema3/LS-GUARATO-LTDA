import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Building2, Heart, CheckSquare } from "lucide-react";
import { SaveToast } from "../../components/ui/SaveToast";
import { supabase } from "../../lib/supabase";

export const VagasParametrosEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [empresas, setEmpresas] = useState<string[]>([]);
  const [beneficios, setBeneficios] = useState<string[]>([]);
  const [criterios, setCriterios] = useState<string[]>([]);

  const [newEmpresa, setNewEmpresa] = useState("");
  const [newBeneficio, setNewBeneficio] = useState("");
  const [newCriterio, setNewCriterio] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase.from('vagas_parametros').select('*').eq('id', 1).single();
    if (data) {
      if (data.empresas) setEmpresas(data.empresas);
      if (data.beneficios) setBeneficios(data.beneficios);
      if (data.criterios) setCriterios(data.criterios);
    } else {
      setEmpresas(["Matriz (Uberaba)", "Filial (Uberlândia)"]);
      setBeneficios(["Vale Transporte", "Plano de Saúde Coparticipativo", "Refeição no Local", "Desconto em Compras"]);
      setCriterios(["Ensino Médio Completo", "Disponibilidade de horário", "Experiência prévia"]);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase.from('vagas_parametros').upsert({
      id: 1,
      empresas,
      beneficios,
      criterios
    });
    if (!error) setShowToast(true);
    else alert("Erro ao salvar paramêtros: " + error.message);
  };

  const handleAdd = (type: "empresa" | "beneficio" | "criterio") => {
    if (type === "empresa" && newEmpresa.trim()) {
      setEmpresas([...empresas, newEmpresa.trim()]);
      setNewEmpresa("");
    } else if (type === "beneficio" && newBeneficio.trim()) {
      setBeneficios([...beneficios, newBeneficio.trim()]);
      setNewBeneficio("");
    } else if (type === "criterio" && newCriterio.trim()) {
      setCriterios([...criterios, newCriterio.trim()]);
      setNewCriterio("");
    }
  };

  const handleEdit = (type: "empresa" | "beneficio" | "criterio", index: number, oldValue: string) => {
    const newValue = prompt("Editar valor:", oldValue);
    if (newValue === null || newValue.trim() === "") return;
    
    if (type === "empresa") {
      const newArr = [...empresas];
      newArr[index] = newValue.trim();
      setEmpresas(newArr);
    } else if (type === "beneficio") {
      const newArr = [...beneficios];
      newArr[index] = newValue.trim();
      setBeneficios(newArr);
    } else if (type === "criterio") {
      const newArr = [...criterios];
      newArr[index] = newValue.trim();
      setCriterios(newArr);
    }
  };

  const handleRemove = (type: "empresa" | "beneficio" | "criterio", index: number) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    if (type === "empresa") {
      setEmpresas(empresas.filter((_, i) => i !== index));
    } else if (type === "beneficio") {
      setBeneficios(beneficios.filter((_, i) => i !== index));
    } else if (type === "criterio") {
      setCriterios(criterios.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <h1 className="text-2xl font-bold font-sans text-gray-900">Parâmetros das Vagas</h1>
        <button onClick={handleSave} className="bg-[#0B3C8C] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] transition-colors">
          <Save className="h-5 w-5" /> Salvar Parâmetros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Empresas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold font-sans text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#0B3C8C]" /> Empresas / Lojas
          </h2>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newEmpresa}
              onChange={(e) => setNewEmpresa(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd("empresa")}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
              placeholder="Nome da Loja" 
            />
            <button 
              onClick={() => handleAdd("empresa")}
              className="bg-[#0B3C8C] text-white px-4 py-2 rounded-lg hover:bg-[#082a63] transition-colors shrink-0"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <ul className="space-y-2 border-t border-gray-100 pt-4 max-h-[300px] overflow-y-auto">
            {empresas.map((item, index) => (
              <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-700">{item}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit("empresa", index, item)} className="text-gray-500 hover:text-[#0B3C8C] p-1 rounded-md hover:bg-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button onClick={() => handleRemove("empresa", index)} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
            {empresas.length === 0 && <p className="text-sm text-gray-500 italic text-center py-4">Nenhuma empresa cadastrada</p>}
          </ul>
        </div>

        {/* Benefícios */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold font-sans text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#D62828]" /> Benefícios
          </h2>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newBeneficio}
              onChange={(e) => setNewBeneficio(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd("beneficio")}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
              placeholder="Novo Benefício" 
            />
            <button 
              onClick={() => handleAdd("beneficio")}
              className="bg-[#0B3C8C] text-white px-4 py-2 rounded-lg hover:bg-[#082a63] transition-colors shrink-0"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <ul className="space-y-2 border-t border-gray-100 pt-4 max-h-[300px] overflow-y-auto">
            {beneficios.map((item, index) => (
              <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-700">{item}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit("beneficio", index, item)} className="text-gray-500 hover:text-[#0B3C8C] p-1 rounded-md hover:bg-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button onClick={() => handleRemove("beneficio", index)} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
            {beneficios.length === 0 && <p className="text-sm text-gray-500 italic text-center py-4">Nenhum benefício cadastrado</p>}
          </ul>
        </div>

        {/* Critérios */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
          <h2 className="text-xl font-bold font-sans text-gray-900 mb-4 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-[#0B3C8C]" /> Critérios / Requisitos
          </h2>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newCriterio}
              onChange={(e) => setNewCriterio(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd("criterio")}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
              placeholder="Novo Critério (ex: CNH Categoria B)" 
            />
            <button 
              onClick={() => handleAdd("criterio")}
              className="bg-[#0B3C8C] text-white px-4 py-2 rounded-lg hover:bg-[#082a63] transition-colors shrink-0"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 border-t border-gray-100 pt-4">
            {criterios.map((item, index) => (
              <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-700">{item}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit("criterio", index, item)} className="text-gray-500 hover:text-[#0B3C8C] p-1 rounded-md hover:bg-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button onClick={() => handleRemove("criterio", index)} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
            {criterios.length === 0 && <p className="text-sm text-gray-500 italic text-center py-4 md:col-span-2">Nenhum critério cadastrado</p>}
          </ul>
        </div>
      </div>
      <SaveToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
