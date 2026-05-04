import { Save, Building } from "lucide-react";
import { useState, useEffect } from "react";
import { SaveToast } from "../../components/ui/SaveToast";
import { supabase } from "../../lib/supabase";

export const ConfiguracoesEditor = () => {
  const [showToast, setShowToast] = useState(false);
  
  // We reuse footer_settings for company data since it already has address, phone, email, etc.
  // And expand it if needed via JSON or use the existing columns.
  const [empresa, setEmpresa] = useState({
    descricao: "",
    endereco: "",
    telefone: "",
    email: "",
    link_loja: "",
    link_google_play: "",
    link_app_store: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase.from('footer_settings').select('*').eq('id', 1).single();
    if (data) {
      setEmpresa({
        descricao: data.descricao || "",
        endereco: data.endereco || "",
        telefone: data.telefone || "",
        email: data.email || "",
        link_loja: data.link_loja || "",
        link_google_play: data.link_google_play || "",
        link_app_store: data.link_app_store || ""
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmpresa({ ...empresa, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const { error } = await supabase.from('footer_settings').update({
      descricao: empresa.descricao,
      endereco: empresa.endereco,
      telefone: empresa.telefone,
      email: empresa.email,
      link_loja: empresa.link_loja,
      link_google_play: empresa.link_google_play,
      link_app_store: empresa.link_app_store
    }).eq('id', 1);

    // Se estiver vazio/não houver registro ainda
    if (error && error.code !== 'PGRST116') {
       // tenta insert
       const { error: errInsert } = await supabase.from('footer_settings').insert([{
         id: 1, ...empresa
       }]);
       if (!errInsert) {
          setShowToast(true);
       } else {
          alert("Erro ao salvar dados da empresa: " + errInsert.message);
       }
    } else if (!error) {
       setShowToast(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-3 rounded-lg text-[#0B3C8C]">
             <Building className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sans text-gray-900">Ajustes da Empresa</h1>
            <p className="text-sm text-gray-500">Informações de contato e dados gerais (afetam rodapé e o site)</p>
          </div>
        </div>
        <button onClick={handleSave} className="bg-[#0B3C8C] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] transition-colors whitespace-nowrap">
          <Save className="h-5 w-5" /> Salvar Alterações
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Principal (SAC / Atendimento)</label>
              <input 
                type="text" 
                name="telefone"
                value={empresa.telefone}
                onChange={handleChange}
                placeholder="Ex: (34) 3318-7000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Principal</label>
              <input 
                type="text" 
                name="email"
                value={empresa.email}
                onChange={handleChange}
                placeholder="Ex: contato@lsguarato.com.br"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
              <textarea 
                name="endereco"
                value={empresa.endereco}
                onChange={handleChange}
                rows={2}
                placeholder="Ex: Rua João Pinheiro, 256 - Centro, Uberaba - MG..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none resize-none" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Curta (Rodapé)</label>
              <textarea 
                name="descricao"
                value={empresa.descricao}
                onChange={handleChange}
                rows={3}
                placeholder="Há anos servindo a comunidade com produtos de qualidade..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none resize-none" 
              />
            </div>
         </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
         <h2 className="text-xl font-bold font-sans text-gray-900 border-b border-gray-100 pb-3">Links e Aplicativos</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Link do E-commerce (Comprar Online)</label>
              <input 
                type="text" 
                name="link_loja"
                value={empresa.link_loja}
                onChange={handleChange}
                placeholder="Ex: https://loja.lsguarato.com.br"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Google Play (Android)</label>
              <input 
                type="text" 
                name="link_google_play"
                value={empresa.link_google_play}
                onChange={handleChange}
                placeholder="Link do App na Play Store"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link App Store (iOS)</label>
              <input 
                type="text" 
                name="link_app_store"
                value={empresa.link_app_store}
                onChange={handleChange}
                placeholder="Link do App na App Store"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none" 
              />
            </div>
         </div>
      </div>

      <SaveToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
