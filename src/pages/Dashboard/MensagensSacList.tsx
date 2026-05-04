import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { MessageSquare, Search, User, Mail, Phone, Calendar } from "lucide-react";

export const MensagensSacList = () => {
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadMensagens();
  }, []);

  const loadMensagens = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('mensagens_contato').select('*').order('created_at', { ascending: false });
      if (data) {
        setMensagens(data);
      } else if (error) {
        if (error.code === '42P01') {
          console.error("A tabela 'mensagens_contato' não existe.");
        } else {
          console.error(error);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMensagens = mensagens.filter(m => 
    (m.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.mensagem || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#D62828]" />
            SAC e Mensagens
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie as mensagens e contatos recebidos pelo formulário do site</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar mensagem..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Carregando mensagens...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMensagens.length > 0 ? (
              filteredMensagens.map((msg, idx) => (
                <div key={msg.id || idx} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 shrink-0 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-red-50 text-[#D62828] rounded-full flex items-center justify-center shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{msg.nome}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {msg.created_at ? new Date(msg.created_at).toLocaleString("pt-BR") : "Recente"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pl-13 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${msg.email}`} className="hover:text-[#0B3C8C] transition-colors">{msg.email}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`https://wa.me/55${msg.telefone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#0B3C8C] transition-colors">{msg.telefone}</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-2/3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.mensagem}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                 <div className="flex flex-col items-center justify-center text-gray-500">
                   <div className="mb-4 bg-gray-100 p-4 rounded-full">
                     <MessageSquare className="h-8 w-8 text-gray-400" />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhuma mensagem encontrada</h3>
                   <p className="text-sm">As mensagens enviadas pelo formulário de contato aparecerão aqui.</p>
                   <div className="mt-4 text-xs text-red-500 bg-red-50 p-3 rounded-md max-w-sm">
                     Nota técnica: Se a tabela "mensagens_contato" não existir no seu Supabase, crie-a com as colunas: id, nome, email, telefone, mensagem e created_at.
                   </div>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
