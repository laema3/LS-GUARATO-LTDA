import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Download, FileText, Search, User, Trash2, X, AlertTriangle, ChevronLeft, ChevronRight, Clock, CheckCircle } from "lucide-react";

export const CandidatosList = () => {
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<{nome: string, mensagem: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    loadCandidatos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadCandidatos = async () => {
    setLoading(true);
    try {
      // Tenta carregar com status para verificar se a coluna existe
      const { data, error } = await supabase.from('candidatos').select('*').order('created_at', { ascending: false });
      
      if (error) {
        if (error.code === 'PGRST204') {
          // Se falhar por causa da coluna status, tenta carregar sem ela para não quebrar a listagem
          const { data: retryData, error: retryError } = await supabase.from('candidatos').select('id, nome, email, telefone, cargo_desejado, vaga_nome, mensagem, curriculo_url, created_at').order('created_at', { ascending: false });
          if (retryData) {
            setCandidatos(retryData);
            setDbError("A coluna 'status' está ausente.");
          } else {
            console.error(retryError);
          }
        } else if (error.code === '42P01') {
          console.error("A tabela 'candidatos' não existe.");
        } else {
          console.error(error);
        }
      } else if (data) {
        setCandidatos(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('candidatos')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error("Erro ao atualizar status:", error.message);
        if (error.code === 'PGRST204') {
          setDbError("A coluna 'status' não existe na tabela 'candidatos'.");
        }
      } else {
        setCandidatos(candidatos.map(c => c.id === id ? { ...c, status: newStatus } : c));
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('candidatos').delete().eq('id', deleteId);
      if (error) {
        console.error(error);
      } else {
        setCandidatos(candidatos.filter(c => c.id !== deleteId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  const filteredCandidatos = candidatos.filter(c => 
    (c.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.cargo_desejado || c.vaga_nome || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCandidatos.length / itemsPerPage);
  const paginatedCandidatos = filteredCandidatos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* DB Column Error Modal */}
      {dbError && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertTriangle className="h-8 w-8" />
              <h3 className="text-xl font-bold text-gray-900">Configuração Necessária</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              A coluna <span className="font-mono bg-gray-100 px-1 rounded text-red-600">status</span> não foi encontrada na tabela <span className="font-mono bg-gray-100 px-1 rounded text-[#0B3C8C]">candidatos</span> do seu Banco de Dados Supabase.
            </p>
            
            <div className="bg-gray-900 rounded-lg p-4 mb-6 relative group">
              <p className="text-blue-400 text-xs mb-2 uppercase font-bold">Execute este SQL no Supabase:</p>
              <pre className="text-gray-100 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                ALTER TABLE candidatos ADD COLUMN status TEXT DEFAULT 'PENDENTE DE CONTATO';
              </pre>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">Após executar o SQL, atualize a página.</p>
              <button 
                onClick={() => setDbError(null)}
                className="px-6 py-2 bg-[#0B3C8C] text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-lg font-bold text-gray-900">Excluir Candidato</h3>
              </div>
              <button onClick={() => setDeleteId(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir as informações e o currículo deste candidato? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4 pb-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Mensagem do Candidato</h3>
                <p className="text-sm text-[#0B3C8C] font-medium">{selectedMessage.nome}</p>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedMessage.mensagem}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setSelectedMessage(null)}
                className="px-6 py-2 bg-[#0B3C8C] hover:bg-opacity-90 text-white rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-gray-900">Candidatos e Currículos</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie os currículos recebidos pelo site (Vagas ou Banco de Talentos)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar candidato..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent outline-none w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="px-3 py-4 font-semibold">Candidato</th>
                  <th className="px-3 py-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="px-3 py-4 font-semibold whitespace-nowrap">Contato</th>
                  <th className="px-3 py-4 font-semibold">Vaga</th>
                  <th className="px-3 py-4 font-semibold">Data</th>
                  <th className="px-3 py-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCandidatos.length > 0 ? (
                  paginatedCandidatos.map((candidato, idx) => (
                    <tr key={candidato.id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 text-[#0B3C8C] rounded-full flex items-center justify-center shrink-0">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">{candidato.nome}</p>
                            {candidato.mensagem && (
                              <div className="flex flex-col">
                                <p className="text-xs text-gray-500 max-w-[150px] truncate">
                                  {candidato.mensagem}
                                </p>
                                <button 
                                  onClick={() => setSelectedMessage({ nome: candidato.nome, mensagem: candidato.mensagem })}
                                  className="text-[10px] text-[#0B3C8C] font-bold hover:underline text-left mt-0.5"
                                >
                                  Leia mais...
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {candidato.status === 'CONTACTADO' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-wider">
                            <CheckCircle className="h-3 w-3" />
                            OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wider">
                            <Clock className="h-3 w-3" />
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-600">
                        <p className="truncate max-w-[150px]">{candidato.email}</p>
                        <p className="font-medium text-gray-800">{candidato.telefone}</p>
                      </td>
                      <td className="px-3 py-4">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-[10px] font-semibold rounded-full border border-gray-200 max-w-[120px] truncate">
                          {candidato.vaga_nome || candidato.cargo_desejado || "Banco"}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {candidato.created_at ? new Date(candidato.created_at).toLocaleDateString("pt-BR") : "Recente"}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex flex-col gap-1 mr-2">
                            {candidato.status === 'CONTACTADO' ? (
                              <button 
                                onClick={() => handleStatusChange(candidato.id, 'PENDENTE DE CONTATO')}
                                className="text-[9px] font-bold bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1.5 rounded border border-green-200 transition-colors whitespace-nowrap flex items-center gap-1"
                                title="Marcar como Pendente (Desfazer)"
                              >
                                <CheckCircle className="h-3 w-3" />
                                OK
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleStatusChange(candidato.id, 'CONTACTADO')}
                                className="text-[9px] font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 px-2 py-1.5 rounded border border-amber-200 transition-colors whitespace-nowrap flex items-center gap-1"
                                title="Marcar como Contactado"
                              >
                                <Clock className="h-3 w-3" />
                                CONTACTADO
                              </button>
                            )}
                          </div>

                          {candidato.curriculo_url ? (
                            <a 
                              href={candidato.curriculo_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-[#0B3C8C] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="hidden sm:inline">Ver PDF</span>
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400 italic px-3 py-1.5">Não enviado</span>
                          )}
                          <button 
                            onClick={() => setDeleteId(candidato.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Excluir Candidato"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                       <div className="flex flex-col items-center justify-center text-gray-500">
                         <div className="mb-4 bg-gray-100 p-4 rounded-full">
                           <User className="h-8 w-8 text-gray-400" />
                         </div>
                         <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum candidato encontrado</h3>
                         <p className="text-sm">Os currículos enviados pelo site aparecerão aqui.</p>

                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-gray-200">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Próximo <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
          </div>
      </div>
    </div>
  );
};
