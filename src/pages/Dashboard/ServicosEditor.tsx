import { Save, FileText } from "lucide-react";
import React, { useState, useEffect } from "react";
import { SaveToast } from "../../components/ui/SaveToast";
import { FileUpload } from "../../components/ui/FileUpload";
import { supabase } from "../../lib/supabase";

export const ServicosEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [encartePdf, setEncartePdf] = useState("");
  const [pdfsTransparencia, setPdfsTransparencia] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase.from('servicos_settings').select('*').eq('id', 1).single();
    if (data) {
      if (data.encarte_pdf) setEncartePdf(data.encarte_pdf);
      if (data.transparencia_pdfs) setPdfsTransparencia(data.transparencia_pdfs);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase.from('servicos_settings').upsert({
      id: 1,
      encarte_pdf: encartePdf,
      transparencia_pdfs: pdfsTransparencia
    });

    if (!error) {
      setShowToast(true);
    } else {
      alert("Erro ao salvar: " + error.message);
    }
  };

  const updatePdfTransparencia = (key: string, url: string) => {
    setPdfsTransparencia(prev => ({ ...prev, [key]: url }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <h1 className="text-2xl font-bold font-sans text-gray-900">Editar Serviços Institucionais</h1>
        <button onClick={handleSave} className="bg-[#0B3C8C] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#082a63] transition-colors">
          <Save className="h-5 w-5" /> Salvar Alterações
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <div className="mb-6">
           <h2 className="text-xl font-bold font-sans text-gray-900 border-b border-gray-100 pb-3">Jornal de Ofertas</h2>
           <p className="text-gray-500 text-sm mt-3">Faça o upload do encarte promocional atual (PDF). Ele será exibido e disponibilizado para download na página "Jornal de Ofertas".</p>
         </div>
         
         <FileUpload
            value={encartePdf}
            onChange={setEncartePdf}
            title="Upload do Encarte (PDF)"
            accept="application/pdf"
            type="pdf"
            folder="encartes"
         />
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
