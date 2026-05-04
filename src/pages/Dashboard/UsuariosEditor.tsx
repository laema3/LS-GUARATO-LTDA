import { Save, UserPlus, Users, Trash2, Mail, ShieldCheck } from "lucide-react";
import React, { useState, useEffect } from "react";
import { SaveToast } from "../../components/ui/SaveToast";
import { supabase } from "../../lib/supabase";

interface SystemUser {
  id: string;
  email: string;
  created_at: string;
  role: string;
}

export const UsuariosEditor = () => {
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<SystemUser[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<'admin' | 'operator'>('operator');
  const [enviando, setEnviando] = useState(false);

  const [tableExists, setTableExists] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsuarios(data);
      setTableExists(true);
    } else if (error) {
       console.error("Erro ao carregar usuários:", error.message);
       if (error.message.includes('relation "public.profiles" does not exist')) {
         setTableExists(false);
       }
    }
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setEnviando(true);
    const { error } = await supabase.from('profiles').insert([{
      email: newEmail.toLowerCase().trim(),
      role: newRole
    }]);

    if (!error) {
      setShowToast(true);
      setNewEmail("");
      loadUsers();
    } else {
      console.error("Erro ao autorizar usuário:", error.message);
    }
    setEnviando(false);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteUser = async (id: string) => {
    setEnviando(true);
    const { error } = await supabase.from('profiles').delete().eq('id', id);

    if (error) {
      console.error("Erro ao remover usuário:", error.message);
    } else {
      loadUsers();
    }
    setDeletingId(null);
    setEnviando(false);
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    setEnviando(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar cargo:", error.message);
    } else {
      loadUsers();
      setShowToast(true);
    }
    setEnviando(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-3 rounded-lg text-[#0B3C8C]">
             <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sans text-gray-900">Gestão de Usuários</h1>
            <p className="text-sm text-gray-500">Controle quem tem acesso ao painel administrativo</p>
          </div>
        </div>
      </div>

      {!tableExists && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl shadow-sm mb-6">
          <h2 className="text-red-800 font-bold text-lg flex items-center gap-2 mb-2">
            Configuração do Banco de Dados Necessária
          </h2>
          <p className="text-red-700 mb-4">
            A tabela <strong>'profiles'</strong> não foi encontrada. Para gerenciar os administradores, execute o código abaixo no <strong>SQL Editor</strong> do seu Supabase:
          </p>
          <div className="bg-gray-900 p-4 rounded-lg text-sm text-green-400 font-mono overflow-x-auto">
            <pre>
{`CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Segurança de Nível de Linha
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir verificação de e-mail (Seguro: apenas leitura)
CREATE POLICY "Permitir verificação" ON public.profiles 
FOR SELECT USING (true);

-- Política para administradores autenticados alterarem dados
CREATE POLICY "Acesso administrativp" ON public.profiles 
FOR ALL TO authenticated USING (true);`}
            </pre>
          </div>
          <p className="text-xs text-red-600 mt-3 font-medium">
            * Após executar o SQL, atualize esta página para ativar a gestão de usuários.
          </p>
        </div>
      )}

      {/* Dica para o usuário atual caso ele não seja Admin no profiles */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg mb-6">
        <h3 className="text-amber-800 font-bold text-sm mb-1">Dica de Acesso</h3>
        <p className="text-amber-700 text-xs">
          Se você criou seu usuário direto no Painel do Supabase, você precisa autorizá-lo como <strong>admin</strong> na tabela <strong>profiles</strong> para ver todas as opções.
          Execute este comando se necessário:
        </p>
        <code className="block bg-amber-900/10 p-2 mt-2 rounded text-[10px] font-mono text-amber-900">
          INSERT INTO public.profiles (email, role) VALUES ('rh@lsguarato.com.br', 'admin') ON CONFLICT (email) DO UPDATE SET role = 'admin';
        </code>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold font-sans text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-[#D62828]" /> Autorizar Novo Administrador
        </h2>
        <form onSubmit={handleAddUser} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="email" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="E-mail do administrador ou operador"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none"
                required
              />
            </div>
            <div className="w-full md:w-48 relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3C8C] outline-none appearance-none bg-white"
              >
                <option value="operator">Operador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={enviando}
            className="bg-[#0B3C8C] hover:bg-[#082a63] disabled:bg-gray-400 text-white px-8 py-2.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
          >
            {enviando ? "Processando..." : "Autorizar Acesso"}
          </button>
        </form>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>Como funciona a senha?</strong> Por segurança, após você autorizar o e-mail acima, o novo usuário deve acessar a página de login e clicar em <strong>"Cadastrar-se"</strong> usando este mesmo e-mail. O sistema reconhecerá que ele é um administrador autorizado.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#0B3C8C]" /> Usuários com Acesso
          </h2>
          <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-[#0B3C8C] rounded-full uppercase">
            {usuarios.length} Ativos
          </span>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">Carregando usuários...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {usuarios.length > 0 ? (
              usuarios.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-[#0B3C8C] font-bold text-lg">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">Adicionado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <select
                        value={user.role || 'operator'}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border-none outline-none cursor-pointer appearance-none ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}
                        style={{ paddingRight: '0.5rem' }}
                        disabled={enviando}
                      >
                        <option value="admin">Administrador</option>
                        <option value="operator">Operador</option>
                      </select>
                    </div>
                    {deletingId === user.id ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700"
                        >
                          CONFIRMAR
                        </button>
                        <button 
                          onClick={() => setDeletingId(null)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-bold hover:bg-gray-300"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeletingId(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Remover Acesso"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500">Nenhum usuário extra cadastrado.</div>
            )}
          </div>
        )}
      </div>

      <SaveToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
