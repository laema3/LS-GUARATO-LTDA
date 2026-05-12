import { FileText, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const JornalOfertas = () => {
  const [encartePdf, setEncartePdf] = useState("");

  useEffect(() => {
    const loadEncarte = async () => {
      if (!isSupabaseConfigured) return;
      const { data } = await supabase.from('servicos_settings').select('encarte_pdf').eq('id', 1).single();
      if (data && data.encarte_pdf) {
        setEncartePdf(data.encarte_pdf);
      }
    };
    loadEncarte();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="relative py-12 text-center text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1600')" }}
        ></div>
        <div className="absolute inset-0 bg-[#0B3C8C]/80"></div>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 flex flex-col items-center">
          <FileText className="h-16 w-16 mb-4" />
          <h1 className="text-3xl md:text-5xl font-bold font-sans mb-4 uppercase tracking-wider text-[#D62828]">Jornal de Ofertas</h1>
          <p className="text-red-100 max-w-xl mx-auto px-4 text-lg">
            Confira nossas promoções vigentes e economia garantida para a sua família.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-5xl mx-auto bg-white p-4 md:p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#D62828]">Encarte Semanal</h2>
              <p className="text-gray-500">Válido até domingo</p>
            </div>
            {encartePdf ? (
              <a href={encartePdf} target="_blank" rel="noopener noreferrer" className="bg-[#0B3C8C] hover:bg-[#082a63] text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-md">
                <Download className="h-5 w-5" />
                Baixar em PDF
              </a>
            ) : (
              <button disabled className="bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2">
                <Download className="h-5 w-5" />
                Sem encarte
              </button>
            )}
          </div>

          <div className="w-full aspect-[3/4] md:aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden border border-gray-300 relative flex items-center justify-center">
            {encartePdf ? (
              <iframe src={encartePdf} className="w-full h-full" title="Jornal de Ofertas"></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-100 p-8 text-center">
                <FileText className="h-24 w-24 mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2 text-[#D62828]">Nenhum Encarte Disponível</h3>
                <p>O encarte promocional da semana ainda não foi publicado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
