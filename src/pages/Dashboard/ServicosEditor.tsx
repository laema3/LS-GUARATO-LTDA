import { Save, FileText, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { SaveToast } from "../../components/ui/SaveToast";
import { FileUpload } from "../../components/ui/FileUpload";
import { supabase } from "../../lib/supabase";

export const ServicosEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [encartePdf, setEncartePdf] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [pdfsTransparencia, setPdfsTransparencia] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('servicos_settings').select('*').eq('id', 1).maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setEncartePdf(data.encarte_pdf || "");
        setDataInicio(data.data_inicio || "");
        setDataFim(data.data_fim || "");
        setPdfsTransparencia(data.transparencia_pdfs || {});
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const setSevenDaysValidity = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    setDataInicio(formatDate(today));
    setDataFim(formatDate(nextWeek));
  };

  const handleEncarteChange = (url: string) => {
    setEncartePdf(url);
    if (url) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (!dataFim || dataFim < todayStr) {
        setSevenDaysValidity();
      }
    }
  };

  const handleSave = async () => {
    if (loading) return;
    
    try {
      setIsSaving(true);

      let finalInicio = dataInicio;
      let finalFim = dataFim;
      const todayStr = new Date().toISOString().split('T')[0];

      if (encartePdf && (!finalFim || finalFim < todayStr)) {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        finalInicio = today.toISOString().split('T')[0];
        finalFim = nextWeek.toISOString().split('T')[0];
        setDataInicio(finalInicio);
        setDataFim(finalFim);
      }

      const { error } = await supabase.from('servicos_settings').upsert({
        id: 1,
        encarte_pdf: encartePdf,
        data_inicio: finalInicio,
        data_fim: finalFim,
        transparencia_pdfs: pdfsTransparencia
      });

      if (error) throw error;
      setShowToast(true);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePdfTransparencia = (key: string, url: string) => {
    setPdfsTransparencia(prev => ({ ...prev, [key]: url }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <h1 className="text-2xl font-bold font-sans text-gray-900">Editar Serviços Institucionais</h1>
        <button 
          onClick={handleSave} 
          disabled={loading || isSaving}
          className={`bg-[#0B3C8C] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${loading || isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#082a63]'}`}
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         {loading ? (
           <div className="flex flex-col items-center justify-center py-12">
             <Loader2 className="h-8 w-8 text-[#0B3C8C] animate-spin mb-2" />
             <p className="text-gray-500 font-medium">Carregando dados...</p>
           </div>
         ) : (
           <>
             <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
               <div>
                 <h2 className="text-xl font-bold font-sans text-gray-900">Jornal de Ofertas</h2>
                 <p className="text-gray-500 text-sm mt-1">Faça o upload do encarte promocional atual (PDF). Ele será exibido e disponibilizado para download na página "Jornal de Ofertas".</p>
               </div>
               <button 
                 type="button" 
                 onClick={setSevenDaysValidity}
                 className="text-xs bg-blue-50 text-[#0B3C8C] hover:bg-blue-100 font-bold px-3 py-1.5 rounded border border-blue-200 transition-colors shrink-0 self-start sm:self-auto"
               >
                 + Renovar para +7 Dias
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Data Inicial de Exibição</label>
                  <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Data Final de Exibição</label>
                  <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
             </div>
             
             <FileUpload
                value={encartePdf}
                onChange={handleEncarteChange}
                title="Upload do Encarte (PDF)"
                accept="application/pdf"
                type="pdf"
                folder="encartes"
             />
           </>
         )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <div className="mb-8">
           <h2 className="text-xl font-bold font-sans text-gray-900 border-b border-gray-100 pb-3">Transparência Salarial (3 Anos)</h2>
           <p className="text-gray-500 text-sm mt-3">Cadastre os relatórios em PDF de transparência salarial referentes aos últimos 3 anos, divididos por semestre.</p>
         </div>
         
         <div className="space-y-6">
            {[2026, 2025, 2024].map((year) => (
              <div key={year} className="border border-gray-200 rounded-xl p-6 bg-gray-50 relative overflow-hidden">
                 <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D62828]"></div>
                 <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2 pl-2">
                   <FileText className="h-5 w-5 text-[#D62828]" /> Ano Referência: {year}
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2">
                     <div className="bg-white p-4 rounded-lg border border-gray-200">
                       <label className="block text-sm font-bold text-gray-700 mb-3">Relatório 1º Semestre</label>
                       <FileUpload
                         value={pdfsTransparencia[`${year}-1`]}
                         onChange={(url) => updatePdfTransparencia(`${year}-1`, url)}
                         title="Selecionar PDF"
                         accept="application/pdf"
                         type="pdf"
                         folder="transparencia"
                         heightClass="h-24"
                       />
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                       <label className="block text-sm font-bold text-gray-700 mb-3">Relatório 2º Semestre</label>
                       <FileUpload
                         value={pdfsTransparencia[`${year}-2`]}
                         onChange={(url) => updatePdfTransparencia(`${year}-2`, url)}
                         title="Selecionar PDF"
                         accept="application/pdf"
                         type="pdf"
                         folder="transparencia"
                         heightClass="h-24"
                       />
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>
      <SaveToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
