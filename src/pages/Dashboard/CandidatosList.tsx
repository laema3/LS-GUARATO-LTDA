import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Download, FileText, Search, User, Trash2, X, AlertTriangle } from "lucide-react";

export const CandidatosList = () => {
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadCandidatos();
  }, []);

  const loadCandidatos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('candidatos').select('*').order('created_at', { ascending: false });
      if (data) {
        setCandidatos(data);
      } else if (error) {
        if (error.code === '42P01') {
          console.error("A tabela 'candidatos' não existe.");
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
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
        {loading ? (
          <div className="p-12 text-center text-gray-500">Carregando candidatos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-semibold">Candidato</th>
                  <th className="p-4 font-semibold">Contato</th>
                  <th className="p-4 font-semibold">Vaga/Interesse</th>
                  <th className="p-4 font-semibold">Data</th>
                  <th className="p-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCandidatos.length > 0 ? (
                  filteredCandidatos.map((candidato, idx) => (
                    <tr key={candidato.id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 text-[#0B3C8C] rounded-full flex items-center justify-center shrink-0">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{candidato.nome}</p>
                            {candidato.mensagem && (
                              <p className="text-xs text-gray-500 max-w-[200px] truncate" title={candidato.mensagem}>
                                {candidato.mensagem}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <p>{candidato.email}</p>
                        <p className="font-medium text-gray-800">{candidato.telefone}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full border border-gray-200">
                          {candidato.vaga_nome || candidato.cargo_desejado || "Banco de Talentos"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                        {candidato.created_at ? new Date(candidato.created_at).toLocaleDateString("pt-BR") : "Recente"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
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
                    <td colSpan={5} className="p-12 text-center">
                       <div className="flex flex-col items-center justify-center text-gray-500">
                         <div className="mb-4 bg-gray-100 p-4 rounded-full">
                           <User className="h-8 w-8 text-gray-400" />
                         </div>
                         <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum candidato encontrado</h3>
                         <p className="text-sm">Os currículos enviados pelo site aparecerão aqui.</p>
                         <div className="mt-4 text-xs text-red-500 bg-red-50 p-3 rounded-md max-w-sm">
                           Nota técnica: Se a tabela "candidatos" não existir no seu Supabase, crie-a com as colunas: id, nome, email, telefone, mensagem, cargo_desejado, vaga_nome, curriculo_url, created_at.
                         </div>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
