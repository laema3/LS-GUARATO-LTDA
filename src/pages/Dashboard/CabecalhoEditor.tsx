import { Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import { SaveToast } from "../../components/ui/SaveToast";
import { FileUpload } from "../../components/ui/FileUpload";
import { supabase } from "../../lib/supabase";

export const CabecalhoEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [logoCabecalho, setLogoCabecalho] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data, error } = await supabase.from('header_settings').select('*').eq('id', 1).single();
    if (data && data.logo) {
      setLogoCabecalho(data.logo);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase.from('header_settings').upsert({
      id: 1,
      logo: logoCabecalho,
    });

    if (!error) {
      setShowToast(true);
    } else {
      if (error.code === '42P01') {
         alert("A tabela 'header_settings' não existe no Supabase. Crie uma tabela 'header_settings' com as colunas: id (int, primary key) e logo (text).");
      } else {
         alert("Erro ao salvar: " + error.message);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <h1 className="text-2xl font-bold font-sans text-gray-900">Editar Cabeçalho</h1>
        <button onClick={handleSave} className="bg-[#0B3C8C] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] transition-colors">
          <Save className="h-5 w-5" /> Salvar Alterações
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <h2 className="text-xl font-bold font-sans text-gray-900 mb-6">Logomarca Principal</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logomarca (Branca/Header)</label>
                  <div className="bg-[#0B3C8C] rounded-xl p-2 border border-gray-900">
                    <FileUpload
                      value={logoCabecalho}
                      onChange={setLogoCabecalho}
                      title="Trocar Logotipo do Cabeçalho"
                      accept="*/*"
                      type="image"
                      bucket="assets"
                      folder="cabecalho"
                      heightClass="h-28"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ou cole o link (URL) da imagem:</label>
                    <input 
                      type="text" 
                      value={logoCabecalho} 
                      onChange={(e) => setLogoCabecalho(e.target.value)}
                      placeholder="Ex: https://meusite.com/logo.png"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Dica: Utilize uma versão da sua logomarca que contraste bem com o fundo azul escuro do cabeçalho. Você pode enviar a imagem ou colocar o link direto acima.</p>
               </div>
            </div>
         </div>
      </div>

      <SaveToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
