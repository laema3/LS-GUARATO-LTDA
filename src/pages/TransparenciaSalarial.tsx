import { FileText, Download, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const TransparenciaSalarial = () => {
  const [pdfsTransparencia, setPdfsTransparencia] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadPdfs = async () => {
      if (!isSupabaseConfigured) return;
      const { data } = await supabase.from('servicos_settings').select('transparencia_pdfs').eq('id', 1).single();
      if (data && data.transparencia_pdfs) {
        setPdfsTransparencia(data.transparencia_pdfs);
      }
    };
    loadPdfs();
  }, []);

  const years = [2026, 2025, 2024];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[#0B3C8C] py-12 text-center text-white relative">
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white/10 p-4 rounded-full mb-4">
             <TrendingUp className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-sans mb-4 uppercase tracking-wider text-[#D62828]">Transparência Salarial</h1>
          <p className="text-blue-100 max-w-2xl mx-auto px-4 text-lg">
            Em conformidade com a legislação vigente, o LS Guarato disponibiliza os relatórios de transparência salarial e de critérios remuneratórios.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 flex-grow">
        <div className="max-w-4xl mx-auto grid gap-8">
          {years.map((year, idx) => {
            const firstPdf = pdfsTransparencia[`${year}-1`];
            const secondPdf = pdfsTransparencia[`${year}-2`];

            return (
              <motion.div 
                key={year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
              >
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-[#D62828] font-sans flex items-center gap-2">
                    Ano Referência: {year}
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-[#D62828]">Relatório 1º Semestre</h3>
                    {firstPdf ? (
                       <div className="flex gap-2">
                          <a href={firstPdf} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-2 bg-[#0B3C8C] hover:bg-[#082a63] text-white py-2 px-4 rounded transition-colors text-sm font-medium">
                            <FileText className="h-4 w-4" /> Visualizar
                          </a>
                          <a href={firstPdf} target="_blank" rel="noopener noreferrer" download className="flex items-center justify-center bg-[#0B3C8C] hover:bg-[#082a63] text-white p-2 rounded transition-colors">
                            <Download className="h-4 w-4" />
                          </a>
                       </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic bg-gray-50 py-2 px-4 rounded border border-gray-100 text-center">
                        Nenhum arquivo enviado
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-[#D62828]">Relatório 2º Semestre</h3>
                    {secondPdf ? (
                       <div className="flex gap-2">
                          <a href={secondPdf} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-2 bg-[#0B3C8C] hover:bg-[#082a63] text-white py-2 px-4 rounded transition-colors text-sm font-medium">
                            <FileText className="h-4 w-4" /> Visualizar
                          </a>
                          <a href={secondPdf} target="_blank" rel="noopener noreferrer" download className="flex items-center justify-center bg-[#0B3C8C] hover:bg-[#082a63] text-white p-2 rounded transition-colors">
                            <Download className="h-4 w-4" />
                          </a>
                       </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic bg-gray-50 py-2 px-4 rounded border border-gray-100 text-center">
                        Nenhum arquivo enviado
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        <div className="max-w-4xl mx-auto mt-12 bg-blue-50 p-6 rounded-lg border border-blue-100 text-sm text-blue-900">
          <p>
            <strong>Nota de Esclarecimento:</strong> Os relatórios acima cumprem a obrigatoriedade da Lei nº 14.611, de 3 de julho de 2023, que dispõe sobre a igualdade salarial e de critérios remuneratórios entre mulheres e homens. Os dados são anonimizados e garantem a proteção de dados pessoais de acordo com a LGPD.
          </p>
        </div>
      </div>
    </div>
  );
};
