import { Briefcase, MapPin, Search, UploadCloud, X, Send, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const VagasEmprego = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviadoSucesso, setEnviadoSucesso] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo_desejado: "",
    mensagem: "",
  });
  const [file, setFile] = useState<File | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      let fileUrl = "";
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage.from('curriculos').upload(filePath, file);
        if (!uploadError) {
          const { data } = supabase.storage.from('curriculos').getPublicUrl(filePath);
          fileUrl = data.publicUrl;
        }
      }

      await supabase.from('candidatos').insert([{
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cargo_desejado: formData.cargo_desejado,
        mensagem: formData.mensagem,
        curriculo_url: fileUrl,
        vaga_nome: "Banco de Talentos"
      }]);

      setEnviadoSucesso(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar currículo. Tente novamente ou verifique se a tabela candidatos e o storage curriculos existem.");
    } finally {
      setEnviando(false);
    }
  };

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
            <button 
              onClick={() => { setEnviadoSucesso(false); setShowModal(true); }}
              className="inline-block bg-white text-[#0B3C8C] font-bold border border-[#0B3C8C] hover:bg-[#0B3C8C] hover:text-white py-3 px-8 rounded-lg transition-colors cursor-pointer"
            >
              Envie seu Currículo
            </button>
          </div>
        </div>
      </div>

      {/* Modal Banco de Talentos */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold font-sans text-gray-900">Banco de Talentos</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {enviadoSucesso ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Currículo Enviado!</h4>
                  <p className="text-gray-500 mb-6">Seu currículo foi cadastrado no nosso banco de talentos. Entraremos em contato assim que surgir uma vaga.</p>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="bg-[#0B3C8C] hover:bg-[#082a63] text-white px-6 py-2 rounded-lg font-bold transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp *</label>
                      <input type="tel" required value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Área ou Cargo de Interesse *</label>
                    <input type="text" required placeholder="Ex: Operador de Caixa, Açougue, Gerência..." value={formData.cargo_desejado} onChange={e => setFormData({...formData, cargo_desejado: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem (Opcional)</label>
                    <textarea rows={2} value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all" placeholder="Resumo profissional..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currículo (PDF, DOC) *</label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#0B3C8C] hover:bg-blue-50 transition-colors cursor-pointer group">
                      <input 
                        type="file" 
                        required 
                        accept=".pdf,.doc,.docx"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      <div className="flex flex-col items-center gap-1">
                        <UploadCloud className="h-6 w-6 text-gray-400 group-hover:text-[#0B3C8C]" />
                        <span className="text-sm text-gray-600 font-medium">
                          {file ? file.name : "Clique para anexar seu currículo"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={enviando} className="w-full bg-[#0B3C8C] hover:bg-[#082a63] disabled:bg-gray-400 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4">
                    <Send className="h-5 w-5" /> {enviando ? "Enviando..." : "Enviar para o Banco de Talentos"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
