import { Briefcase, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const VagasEmprego = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const { data } = await supabase.from('vagas').select('*').order('created_at', { ascending: false });
    if (data) {
      setJobs(data);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[#0B3C8C] py-16 text-center text-white relative">
        <div className="relative z-10 flex flex-col items-center">
          <Briefcase className="h-16 w-16 mb-4 text-[#D62828]" />
          <h1 className="text-3xl md:text-5xl font-bold font-sans mb-4 uppercase tracking-wider">Trabalhe Conosco</h1>
          <p className="text-blue-100 max-w-2xl mx-auto px-4 text-lg">
            Venha fazer parte da família LS Guarato. Buscamos talentos que queiram crescer com a gente e oferecer o melhor atendimento aos nossos clientes.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-grow">
        {/* Search / Filter */}
        <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar vagas por cargo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent" 
            />
          </div>
          <button className="bg-[#0B3C8C] hover:bg-[#082a63] text-white font-bold py-3 px-8 rounded-md transition-colors whitespace-nowrap">
            Buscar Vagas
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">
            Vagas Abertas ({filteredJobs.length})
          </h2>

          <div className="grid gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, idx) => (
                <motion.div 
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 overflow-hidden transition-all duration-300 group"
                >
                  <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-[#0B3C8C] rounded-full uppercase tracking-wide">
                           LS Guarato
                         </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 font-sans mb-2 group-hover:text-[#D62828] transition-colors">
                        {job.cargo}
                      </h3>
                      <p className="text-gray-600 mb-4 max-w-2xl line-clamp-2">
                        {job.observacoes || "Venha fazer parte da nossa equipe!"}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {job.empresa}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
                      <Link 
                        to={`/servicos/vagas/${job.id}`}
                        className="w-full md:w-auto text-center bg-gray-900 hover:bg-[#D62828] text-white font-semibold py-3 px-8 rounded-lg transition-colors border border-transparent"
                      >
                        Saiba mais
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
                Nenhuma vaga encontrada no momento.
              </div>
            )}
          </div>

          <div className="mt-12 bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-[#0B3C8C] mb-2 font-sans">Não encontrou a vaga ideal?</h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Cadastre seu currículo em nosso Banco de Talentos. Assim que surgir uma oportunidade com o seu perfil, entraremos em contato!
            </p>
            <Link 
              to="/contato"
              className="inline-block bg-white text-[#0B3C8C] font-bold border border-[#0B3C8C] hover:bg-[#0B3C8C] hover:text-white py-3 px-8 rounded-lg transition-colors"
            >
              Envie seu Currículo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
