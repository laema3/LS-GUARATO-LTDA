import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const Contato = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [enviando, setEnviando] = useState(false);
  
  const [empresa, setEmpresa] = useState({
    endereco: "Rua João Pinheiro, 256\nCentro, Uberaba - MG\nCEP: 38010-040",
    telefone: "(34) 3318-7000",
    email: "contato@lsguarato.com.br"
  });

  useEffect(() => {
    const loadEmpresa = async () => {
      const { data } = await supabase.from('footer_settings').select('*').eq('id', 1).single();
      if (data) {
        setEmpresa({
          endereco: data.endereco || empresa.endereco,
          telefone: data.telefone || empresa.telefone,
          email: data.email || empresa.email
        });
      }
    };
    loadEmpresa();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const { error } = await supabase.from('mensagens_contato').insert([{
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        mensagem: formData.mensagem
      }]);
      
      if (error) {
        console.error(error);
        if (error.code === '42P01') {
          alert("A tabela 'mensagens_contato' não existe. Por favor, crie no Supabase com as colunas: id, nome, email, telefone, mensagem, created_at.");
        } else {
          alert("Erro ao enviar mensagem.");
        }
      } else {
        setSubmitted(true);
        setFormData({ nome: "", email: "", telefone: "", mensagem: "" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-[#0B3C8C] py-16 text-center text-white relative">
        <div className="relative z-10 flex flex-col items-center">
          <Mail className="h-16 w-16 mb-4 text-[#D62828]" />
          <h1 className="text-4xl md:text-5xl font-bold font-sans mb-4 tracking-tight">Fale Conosco</h1>
          <p className="text-blue-100 max-w-2xl mx-auto px-4 text-lg">
            Estamos sempre prontos para ouvir você. Envie suas dúvidas, sugestões ou elogios através dos nossos canais de atendimento.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          
          {/* Informações de Contato */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 font-sans mb-6">Nossos Canais</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-50 p-3 rounded-lg text-[#D62828] shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Endereço Principal</h3>
                    <p className="text-gray-600 mt-1 whitespace-pre-wrap">{empresa.endereco}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-[#0B3C8C] shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Telefone / Televendas</h3>
                    <p className="text-gray-600 mt-1 whitespace-pre-wrap">{empresa.telefone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-[#0B3C8C] shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">E-mail</h3>
                    <p className="text-gray-600 mt-1">{empresa.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-gray-700 shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Horário de Atendimento SAC</h3>
                    <p className="text-gray-600 mt-1">Segunda a Sexta: 08h às 18h<br />Sábados: 08h às 12h</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-xl overflow-hidden h-64 border border-gray-200 flex items-center justify-center text-gray-400">
               {/* Embed map would go here */}
               <div className="text-center p-4">
                 <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                 <p>Mapa do Google Embutido</p>
               </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-3">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 h-full">
              <h2 className="text-2xl font-bold text-gray-900 font-sans mb-2">Envie sua Mensagem</h2>
              <p className="text-gray-500 mb-8">Preencha o formulário abaixo e retornaremos o mais breve possível.</p>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg text-center h-64 flex flex-col items-center justify-center">
                  <div className="bg-green-100 p-3 rounded-full mb-4">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Mensagem enviada com sucesso!</h3>
                  <p>Agradecemos o seu contato. Em breve nossa equipe retornará.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-[#0B3C8C] font-semibold hover:underline"
                  >
                    Enviar nova mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                      <input 
                        type="text" 
                        id="nome" 
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required 
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all" 
                        placeholder="Seu nome" 
                      />
                    </div>
                    <div>
                      <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone / Celular *</label>
                      <input 
                        type="tel" 
                        id="telefone" 
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        required 
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all" 
                        placeholder="(00) 00000-0000" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required 
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all" 
                      placeholder="seu.email@exemplo.com" 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">Sua Mensagem *</label>
                    <textarea 
                      id="mensagem" 
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleChange}
                      rows={5} 
                      required
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all resize-none" 
                      placeholder="Como podemos te ajudar hoje?"
                    ></textarea>
                  </div>
                  
                  <button type="submit" disabled={enviando} className="w-full bg-[#0B3C8C] hover:bg-[#082a63] disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    <Send className="h-5 w-5" /> {enviando ? "Enviando..." : "Enviar Mensagem"}
                  </button>
                </form>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
