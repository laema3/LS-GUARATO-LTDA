import { Save, Upload, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { SaveToast } from "../../components/ui/SaveToast";
import { FileUpload } from "../../components/ui/FileUpload";
import { supabase } from "../../lib/supabase";
import { suggestText } from "../../services/geminiService";

export const FooterEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [logoRodape, setLogoRodape] = useState("");
  const [descricao, setDescricao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [linkLoja, setLinkLoja] = useState("");
  const [linkGoogle, setLinkGoogle] = useState("");
  const [linkApple, setLinkApple] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const handleAiSuggest = async () => {
    setLoadingAi(true);
    const suggestion = await suggestText("descricao curta do rodapé", "Deve ser pequena, informando que a loja tem tradição e qualidade, focada no LS Guarato", "20 palavras");
    if (suggestion && !suggestion.startsWith("Erro")) setDescricao(suggestion);
    setLoadingAi(false);
  };

  const loadData = async () => {
    const { data } = await supabase.from('footer_settings').select('*').eq('id', 1).single();
    if (data) {
      if (data.logo) setLogoRodape(data.logo);
      if (data.descricao) setDescricao(data.descricao);
      if (data.endereco) setEndereco(data.endereco);
      if (data.telefone) setTelefone(data.telefone);
      if (data.email) setEmail(data.email);
      if (data.link_loja) setLinkLoja(data.link_loja);
      if (data.link_google_play) setLinkGoogle(data.link_google_play);
      if (data.link_app_store) setLinkApple(data.link_app_store);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase.from('footer_settings').upsert({
      id: 1,
      logo: logoRodape,
      descricao: descricao,
      endereco: endereco,
      telefone: telefone,
      email: email,
      link_loja: linkLoja,
      link_google_play: linkGoogle,
      link_app_store: linkApple
    });

    if (!error) {
      setShowToast(true);
    } else {
      alert("Erro ao salvar: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <h1 className="text-2xl font-bold font-sans text-gray-900">Editar Rodapé</h1>
        <button onClick={handleSave} className="bg-[#0B3C8C] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] transition-colors">
          <Save className="h-5 w-5" /> Salvar Alterações
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <h2 className="text-xl font-bold font-sans text-gray-900 mb-6">Informações Gerais</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logomarca (Branca/Rodapé)</label>
                  <div className="bg-gray-900 rounded-xl p-2 border border-gray-900">
                    <FileUpload
                      value={logoRodape}
                      onChange={setLogoRodape}
                      title="Trocar Logotipo do Rodapé"
                      accept="*/*"
                      type="image"
                      bucket="assets"
                      folder="rodape"
                      heightClass="h-28"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ou cole o link (URL) da imagem:</label>
                    <input 
                      type="text" 
                      value={logoRodape} 
                      onChange={(e) => setLogoRodape(e.target.value)}
                      placeholder="Ex: https://meusite.com/logo-branca.png"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Você pode enviar a imagem ou colocar o link direto acima.</p>
               </div>
               <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-gray-700">Descrição Curta</label>
                    <button 
                      onClick={handleAiSuggest}
                      disabled={loadingAi}
                      className="text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {loadingAi ? "Gerando..." : "Sugerir com IA"}
                    </button>
                  </div>
                  <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" />
               </div>
            </div>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                  <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Principal</label>
                  <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contato</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" />
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <h2 className="text-xl font-bold font-sans text-gray-900 mb-6">Links e Botões de Aplicativo</h2>
         <div className="space-y-5">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Link do Botão "Acessar Loja Virtual"</label>
               <input type="url" value={linkLoja} onChange={(e) => setLinkLoja(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" placeholder="https://loja.lsguarato.com.br" />
               <p className="text-xs text-gray-500 mt-1">Este link redireciona para o e-commerce externo.</p>
            </div>
            <div className="pt-4 border-t border-gray-100">
               <label className="block text-sm font-medium text-gray-700 mb-1">Link do Aplicativo na Google Play Store</label>
               <input type="url" value={linkGoogle} onChange={(e) => setLinkGoogle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" placeholder="https://play.google.com/store/apps/details?id=..." />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Link do Aplicativo na Apple App Store</label>
               <input type="url" value={linkApple} onChange={(e) => setLinkApple(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" placeholder="https://apps.apple.com/br/app/..." />
            </div>
         </div>
      </div>
      <SaveToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
