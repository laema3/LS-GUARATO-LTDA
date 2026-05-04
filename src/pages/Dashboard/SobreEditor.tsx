import { Save, Upload, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { SaveToast } from "../../components/ui/SaveToast";
import { FileUpload } from "../../components/ui/FileUpload";
import { supabase } from "../../lib/supabase";
import { suggestText } from "../../services/geminiService";

export const SobreEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [bannerSobre, setBannerSobre] = useState("");
  const [imagemSobre, setImagemSobre] = useState("");
  const [historiaTitle, setHistoriaTitle] = useState("Histórico de Confiança");
  const [historiaDesc, setHistoriaDesc] = useState("O LS Guarato nasceu com uma missão simples...");
  const [missao, setMissao] = useState("");
  const [visao, setVisao] = useState("");
  const [valores, setValores] = useState("");
  const [loadingAiField, setLoadingAiField] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const handleAiSuggest = async (field: string) => {
    setLoadingAiField(field);
    let suggestion = "";
    if (field === "historia") {
      suggestion = await suggestText("história da empresa", `Título: ${historiaTitle}`, "80 palavras");
      if (suggestion && !suggestion.startsWith("Erro")) setHistoriaDesc(suggestion);
    } else if (field === "missao") {
      suggestion = await suggestText("missão da empresa", "Deve ser inspiradora e focar no cliente", "20 palavras");
      if (suggestion && !suggestion.startsWith("Erro")) setMissao(suggestion);
    } else if (field === "visao") {
      suggestion = await suggestText("visão da empresa", "Deve ser voltada ao futuro e crescimento na região", "20 palavras");
      if (suggestion && !suggestion.startsWith("Erro")) setVisao(suggestion);
    } else if (field === "valores") {
      suggestion = await suggestText("valores da empresa", "Liste 5 valores essenciais, um por linha", "5 palavras por linha");
      if (suggestion && !suggestion.startsWith("Erro")) setValores(suggestion);
    }
    setLoadingAiField(null);
  };

  const loadData = async () => {
    const { data } = await supabase.from('sobre_settings').select('*').eq('id', 1).single();
    if (data) {
      if (data.banner_image) setBannerSobre(data.banner_image);
      if (data.historia_title) setHistoriaTitle(data.historia_title);
      if (data.historia_description) setHistoriaDesc(data.historia_description);
      if (data.historia_image) setImagemSobre(data.historia_image);
      if (data.missao) setMissao(data.missao);
      if (data.visao) setVisao(data.visao);
      if (data.valores) setValores(data.valores);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase.from('sobre_settings').upsert({
      id: 1,
      banner_image: bannerSobre,
      historia_title: historiaTitle,
      historia_description: historiaDesc,
      historia_image: imagemSobre,
      missao: missao,
      visao: visao,
      valores: valores
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
        <h1 className="text-2xl font-bold font-sans text-gray-900">Editar Página Sobre</h1>
        <button onClick={handleSave} className="bg-[#0B3C8C] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] transition-colors">
          <Save className="h-5 w-5" /> Salvar Alterações
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <h2 className="text-xl font-bold font-sans text-gray-900 mb-6">Banner da Página</h2>
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload da Imagem do Topo (Banner)</label>
            <FileUpload
              value={bannerSobre}
              onChange={setBannerSobre}
              title="Selecionar Banner"
              accept="image/*"
              type="image"
              folder="sobre"
              heightClass="h-48"
            />
         </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <h2 className="text-xl font-bold font-sans text-gray-900 mb-6">Nossa História</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input type="text" value={historiaTitle} onChange={(e) => setHistoriaTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" />
               </div>
               <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <button 
                      onClick={() => handleAiSuggest("historia")}
                      disabled={loadingAiField === "historia"}
                      className="text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {loadingAiField === "historia" ? "Gerando..." : "Sugerir com IA"}
                    </button>
                  </div>
                  <textarea value={historiaDesc} onChange={(e) => setHistoriaDesc(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none h-48 focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" />
               </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Upload de Imagem Lado Direito</label>
               <FileUpload
                 value={imagemSobre}
                 onChange={setImagemSobre}
                 title="Selecionar imagem para o Sobre"
                 accept="image/*"
                 type="image"
                 folder="sobre"
                 heightClass="h-[18rem]"
               />
            </div>
         </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <h2 className="text-xl font-bold font-sans text-gray-900 mb-6">Missão, Visão e Valores</h2>
         <div className="space-y-6">
            <div>
               <div className="flex justify-between items-end mb-1">
                 <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                   Missão 
                 </label>
                 <button 
                   onClick={() => handleAiSuggest("missao")}
                   disabled={loadingAiField === "missao"}
                   className="text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                 >
                   <Sparkles className="h-3.5 w-3.5" />
                   {loadingAiField === "missao" ? "Gerando..." : "Sugerir com IA"}
                 </button>
               </div>
               <textarea value={missao} onChange={(e) => setMissao(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" />
            </div>
            <div>
               <div className="flex justify-between items-end mb-1">
                 <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                   Visão
                 </label>
                 <button 
                   onClick={() => handleAiSuggest("visao")}
                   disabled={loadingAiField === "visao"}
                   className="text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                 >
                   <Sparkles className="h-3.5 w-3.5" />
                   {loadingAiField === "visao" ? "Gerando..." : "Sugerir com IA"}
                 </button>
               </div>
               <textarea value={visao} onChange={(e) => setVisao(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" />
            </div>
            <div>
               <div className="flex justify-between items-end mb-1">
                 <label className="block text-sm font-medium text-gray-700">Valores (um por linha)</label>
                 <button 
                   onClick={() => handleAiSuggest("valores")}
                   disabled={loadingAiField === "valores"}
                   className="text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                 >
                   <Sparkles className="h-3.5 w-3.5" />
                   {loadingAiField === "valores" ? "Gerando..." : "Sugerir com IA"}
                 </button>
               </div>
               <textarea value={valores} onChange={(e) => setValores(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none h-40 focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all leading-relaxed" />
            </div>
         </div>
      </div>
      <SaveToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
