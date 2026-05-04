import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ShieldCheck, Mail, Lock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if session already exists
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/admin");
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/admin");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Primeiro verificamos se o e-mail está na lista de autorizados (tabela profiles)
    const { data: allowed, error: checkError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError || !allowed) {
      setError("Este e-mail não está autorizado como administrador. Peça ao administrador principal para autorizar seu acesso.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      alert("Cadastro realizado! Verifique seu e-mail para confirmar a conta (se habilitado no Supabase) ou tente fazer login.");
      setIsRegistering(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B3C8C] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-[#D62828]"></div>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
            <ShieldCheck className="h-10 w-10 text-[#0B3C8C]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Acesso Administrativo</h1>
          <p className="text-gray-500 text-sm mt-2">
            {isRegistering ? "Crie sua senha de acesso" : "Entre com suas credenciais"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3 rounded-lg animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1 uppercase tracking-wider">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B3C8C] outline-none transition-shadow"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1 uppercase tracking-wider">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B3C8C] outline-none transition-shadow"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0B3C8C] hover:bg-[#082a63] text-white py-4 rounded-xl font-bold transition-all transform active:scale-[0.98] mt-4 shadow-lg shadow-blue-900/20 disabled:bg-gray-400"
          >
            {loading ? "Processando..." : (isRegistering ? "CONFIRMAR CADASTRO" : "ENTRAR NO PAINEL")}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            {isRegistering ? "Já tem acesso?" : "É seu primeiro acesso?"}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-2 font-bold text-[#D62828] hover:underline"
            >
              {isRegistering ? "Fazer Login" : "Cadastrar Senha"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
