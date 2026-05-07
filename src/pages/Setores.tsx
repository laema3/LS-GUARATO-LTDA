import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { LayoutGrid, AlertTriangle, X } from "lucide-react";

export const Setores = () => {
  const [setores, setSetores] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    const loadSetores = async () => {
      const { data } = await supabase.from('setores').select('*').order('nome');
      if (data) setSetores(data);
    };
    loadSetores();
  }, []);

  if (setores.length === 0) return <div className="min-h-[50vh] flex items-center justify-center">Nenhum setor cadastrado.</div>;

  const currentSetor = setores[activeTab];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold font-sans text-gray-900 mb-8 text-center">Nossos Setores</h1>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {setores.map((setor, index) => (
                    <button
                        key={setor.id}
                        onClick={() => setActiveTab(index)}
                        className={`px-6 py-3 rounded-full font-bold transition-colors ${activeTab === index ? 'bg-[#0B3C8C] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                    >
                        {setor.nome}
                    </button>
                ))}
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold font-sans text-gray-900 mb-4">{currentSetor.titulo}</h2>
                <p className="text-gray-600 text-lg mb-8">{currentSetor.descricao}</p>
                
                {currentSetor.fotos && currentSetor.fotos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentSetor.fotos.map((foto: string, index: number) => (
                            <img key={index} src={foto} alt={currentSetor.titulo} className="rounded-xl w-full h-64 object-cover shadow-sm"/>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
