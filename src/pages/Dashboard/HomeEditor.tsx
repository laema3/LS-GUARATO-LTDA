import { useState, useEffect } from "react";
import { Upload, Sparkles, Plus, Trash2, Save } from "lucide-react";
import { suggestSlideDescription, suggestText } from "../../services/geminiService";
import { SaveToast } from "../../components/ui/SaveToast";
import { FileUpload } from "../../components/ui/FileUpload";
import { supabase } from "../../lib/supabase";

export const HomeEditor = () => {
  const [slides, setSlides] = useState<any[]>([
    { id: 1, title: "", description: "", image: "" }
  ]);
  const [sobre, setSobre] = useState({ title: "", description: "", image: "" });
  const [loadingAiId, setLoadingAiId] = useState<number | null>(null);
  const [loadingSobreAi, setLoadingSobreAi] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase.from('home_settings').select('*').eq('id', 1).single();
    if (data) {
      if (data.slides && data.slides.length > 0) setSlides(data.slides);
      setSobre({
        title: data.sobre_title || "",
        description: data.sobre_description || "",
        image: data.sobre_image || ""
      });
    }
  };

  const handleSave = async () => {
    const { error } = await supabase.from('home_settings').upsert({
      id: 1,
      slides,
      sobre_title: sobre.title,
      sobre_description: sobre.description,
      sobre_image: sobre.image
    });

    if (!error) {
      setShowToast(true);
    } else {
      alert("Erro ao salvar: " + error.message);
    }
  };

  const handleAddSlide = () => {
    if (slides.length >= 5) return;
    setSlides([...slides, { id: Date.now(), title: "", description: "", image: "" }]);
  };

  const handleRemoveSlide = (id: number) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  const updateSlide = (id: number, field: string, value: string) => {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAiSuggest = async (id: number, contextValue: string, fieldType: 'title' | 'description' | 'cta') => {
    setLoadingAiId(id);
    let suggestion = "";
    
    if (fieldType === 'description') {
       suggestion = await suggestText("descrição curta para um banner/slide de supermercado", `Tema do banner: ${contextValue}`, "20 palavras");
    } else if (fieldType === 'title') {
       suggestion = await suggestText("título impactante para um banner publicitário de supermercado", `Tema esperado: ${contextValue || "promoções"}`, "5 palavras");
    } else if (fieldType === 'cta') {
       suggestion = await suggestText("texto de botão (call to action) para uma página de supermercado", `Ação desejada: ${contextValue || "ver ofertas"}`, "3 palavras");
    }
    
    if (suggestion && !suggestion.startsWith("Erro")) {
       updateSlide(id, fieldType, suggestion);
    }
    setLoadingAiId(null);
  };

  const handleAiSuggestSobre = async () => {
    setLoadingSobreAi(true);
    const suggestion = await suggestText(
      "Resumo sobre nós para a página principal", 
      `Título: ${sobre.title || 'Supermercado LS Guarato'}`, 
      "30 palavras"
    );
    if (suggestion && !suggestion.startsWith("Erro")) {
      setSobre(prev => ({...prev, description: suggestion}));
    }
    setLoadingSobreAi(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <h1 className="text-2xl font-bold font-sans text-gray-900">Editar Página Home</h1>
        <button onClick={handleSave} className="bg-[#0B3C8C] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] transition-colors">
          <Save className="h-5 w-5" /> Salvar Alterações
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold font-sans text-gray-900">Slides do Banner Principal</h2>
              <p className="text-gray-500 text-sm">Adicione até 5 imagens no carrossel inicial ({slides.length}/5)</p>
            </div>
            {slides.length < 5 && (
              <button onClick={handleAddSlide} className="text-[#0B3C8C] font-semibold flex items-center gap-1 hover:underline p-2 rounded-md hover:bg-blue-50 transition-colors">
                <Plus className="h-5 w-5" /> Novo Slide
              </button>
            )}
         </div>

         <div className="space-y-6">
           {slides.map((slide, idx) => (
             <div key={slide.id} className="border border-gray-200 rounded-lg p-6 relative bg-gray-50/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700">Slide {idx + 1}</h3>
                  {slides.length > 1 && (
                    <button 
                      onClick={() => handleRemoveSlide(slide.id)} 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors"
                      title="Remover slide"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 flex flex-col">
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-medium text-gray-700">Título da Oferta/Banner</label>
                        <button 
                          onClick={() => handleAiSuggest(slide.id, slide.description || "promoções", "title")}
                          disabled={!slide.title && !slide.description || loadingAiId === slide.id}
                          className="text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Sugerir c/ IA
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={slide.title}
                        onChange={(e) => updateSlide(slide.id, "title", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
                        placeholder="Ex: Festival de Carnes"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-medium text-gray-700">Texto do Botão (CTA)</label>
                        <button 
                          onClick={() => handleAiSuggest(slide.id, slide.title, "cta")}
                          disabled={!slide.title || loadingAiId === slide.id}
                          className="text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Sugerir c/ IA
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={slide.cta || ""}
                        onChange={(e) => updateSlide(slide.id, "cta", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
                        placeholder="Ex: Confira as Ofertas"
                      />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link do Botão</label>
                      <input 
                        type="text" 
                        value={slide.link || ""}
                        onChange={(e) => updateSlide(slide.id, "link", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
                        placeholder="Ex: /servicos/jornal-de-ofertas"
                      />
                    </div>
                    <div className="flex-1 flex flex-col pt-1">
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-medium text-gray-700">Descrição Curta</label>
                        <button 
                          onClick={() => handleAiSuggest(slide.id, slide.title, "description")}
                          disabled={!slide.title || loadingAiId === slide.id}
                          className="text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Sugerir c/ IA
                        </button>
                      </div>
                      <textarea 
                        value={slide.description}
                        onChange={(e) => updateSlide(slide.id, "description", e.target.value)}
                        className="w-full h-full min-h-[80px] px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
                        placeholder="Descrição da oferta..."
                      />
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Slide</label>
                     <FileUpload
                        value={slide.image}
                        onChange={(url) => updateSlide(slide.id, "image", url)}
                        title="Clique para fazer upload"
                        accept="image/*"
                        type="image"
                        folder="slides"
                     />
                  </div>
                </div>
             </div>
           ))}
         </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <div className="mb-6">
           <h2 className="text-xl font-bold font-sans text-gray-900">Seção "Sobre Nós"</h2>
           <p className="text-gray-500 text-sm">Aparece logo abaixo do menu de facilidades na home</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título da Seção</label>
                  <input 
                    type="text" 
                    value={sobre.title}
                    onChange={(e) => setSobre({...sobre, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
                    placeholder="Ex: Tradição e Qualidade"
                  />
               </div>
               <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-gray-700">Texto Descritivo</label>
                    <button 
                      onClick={handleAiSuggestSobre}
                      disabled={loadingSobreAi}
                      className="text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {loadingSobreAi ? "Gerando..." : "Sugerir com IA"}
                    </button>
                  </div>
                  <textarea 
                    value={sobre.description}
                    onChange={(e) => setSobre({...sobre, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none transition-all" 
                    placeholder="Resumo sobre a empresa..."
                  />
               </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Imagem em Destaque</label>
               <FileUpload
                 value={sobre.image}
                 onChange={(url) => setSobre({...sobre, image: url})}
                 title="Upload da Fachada/Imagem"
                 accept="image/*"
                 type="image"
                 folder="home"
                 heightClass="h-[13.5rem]"
               />
            </div>
         </div>
      </div>
      
      <SaveToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
