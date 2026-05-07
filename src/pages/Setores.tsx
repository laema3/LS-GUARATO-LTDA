import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Store, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase";

export const Setores = () => {
  const [setores, setSetores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSetores = async () => {
      try {
        const { data } = await supabase.from('setores').select('*').order('nome');
        if (data) setSetores(data);
      } catch (err) {
        console.error("Erro ao carregar setores:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSetores();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="relative py-16 text-center text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1600')" }}
        ></div>
        <div className="absolute inset-0 bg-[#0B3C8C]/80"></div>
        <div className="relative z-10 flex flex-col items-center">
          <Store className="h-16 w-16 mb-4 text-[#D62828]" />
          <h1 className="text-4xl md:text-6xl font-bold font-sans mb-4 uppercase tracking-tight">Nossos Setores</h1>
          <p className="text-blue-100 max-w-2xl mx-auto px-4 text-xl">
            Conheça todos os departamentos do LS Guarato. Qualidade e frescor em cada corredor.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 flex-grow">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3C8C]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {setores.length > 0 ? (
              setores.map((setor, idx) => (
                <motion.div
                  key={setor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={setor.imagem || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"} 
                      alt={setor.nome}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <h3 className="text-2xl font-bold text-white font-sans">{setor.nome}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {setor.descricao || "Produtos selecionados com o padrão de qualidade que você já conhece."}
                    </p>
                    <div className="flex items-center text-[#0B3C8C] font-bold group-hover:gap-3 transition-all cursor-pointer">
                      Ver produtos do setor <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-lg">Nenhum setor cadastrado no momento.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
