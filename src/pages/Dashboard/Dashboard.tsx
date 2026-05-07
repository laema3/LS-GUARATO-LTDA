import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Users, FileText, MessageSquare, Briefcase, TrendingUp } from "lucide-react";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    candidatos: 0,
    vagas: 0,
    mensagens: 0,
    servicos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { count: candidatosCount } = await supabase.from('candidatos').select('*', { count: 'exact', head: true });
      const { count: vagasCount } = await supabase.from('vagas').select('*', { count: 'exact', head: true });
      const { count: mensagensCount } = await supabase.from('mensagens_contato').select('*', { count: 'exact', head: true });
      
      // Tabela jornal_ofertas contém os registros de encartes (PDFs)
      const { count: servicosCount } = await supabase.from('jornal_ofertas').select('*', { count: 'exact', head: true });
      const { count: setoresCount } = await supabase.from('setores').select('*', { count: 'exact', head: true });

      setStats({
        candidatos: candidatosCount || 0,
        vagas: vagasCount || 0,
        mensagens: mensagensCount || 0,
        servicos: (servicosCount || 0) + (setoresCount || 0)
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: "Candidatos", value: stats.candidatos, icon: Users, color: "bg-blue-500" },
    { title: "Vagas Ativas", value: stats.vagas, icon: Briefcase, color: "bg-green-500" },
    { title: "Mensagens SAC", value: stats.mensagens, icon: MessageSquare, color: "bg-red-500" },
    { title: "Encarte Ativo", value: stats.servicos > 0 ? "Sim" : "Não", icon: FileText, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">Dashboard Geral</h1>
          <p className="text-gray-500 mt-1">Bem-vindo ao painel de controle do LS Guarato.</p>
        </div>
        <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-[#0B3C8C]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`h-12 w-12 ${card.color} rounded-xl flex items-center justify-center mb-4 text-white shadow-lg`}>
              <card.icon className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? "..." : card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0B3C8C] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl font-bold">Gestão Facilitada</h2>
          <p className="mt-4 text-blue-100 leading-relaxed text-lg">
            Utilize o menu lateral para gerenciar todo o conteúdo do seu site. 
            Todas as alterações são refletidas em tempo real para seus clientes.
          </p>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 bg-white/5 skew-x-12 translate-x-12" />
      </div>
    </div>
  );
};
