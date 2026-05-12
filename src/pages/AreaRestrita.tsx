import { User, CreditCard, Building2, Calculator, ShieldCheck } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";

export const AreaRestrita = () => {
  const [links, setLinks] = useState({
    link_meu_rh: "#",
    link_saldo_fora: "#",
    link_saldo_dentro: "#",
    link_cotacao: "#"
  });

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from('footer_settings').select('link_meu_rh, link_saldo_fora, link_saldo_dentro, link_cotacao').eq('id', 1).single();
      if (data) {
        setLinks({
          link_meu_rh: data.link_meu_rh || "#",
          link_saldo_fora: data.link_saldo_fora || "#",
          link_saldo_dentro: data.link_saldo_dentro || "#",
          link_cotacao: data.link_cotacao || "#"
        });
      }
    };
    loadSettings();
  }, []);

  const actions = [
    {
      title: "MEU RH",
      icon: User,
      desc: "Acesse seu contracheque, ponto e benefícios.",
      color: "from-blue-600 to-blue-800",
      link: links.link_meu_rh
    },
    {
      title: "SALDO DE CONVÊNIO FORA DA EMPRESA",
      icon: CreditCard,
      desc: "Consulte seu saldo para uso na rede credenciada externa.",
      color: "from-emerald-500 to-emerald-700",
      link: links.link_saldo_fora
    },
    {
      title: "SALDO DE CONVÊNIO DENTRO DA EMPRESA",
      icon: Building2,
      desc: "Consulte seu saldo para compras nas lojas LS Guarato.",
      color: "from-[#D62828] to-red-800",
      link: links.link_saldo_dentro
    },
    {
      title: "PARTICIPAR DA COTAÇÃO",
      icon: Calculator,
      desc: "Área exclusiva para fornecedores e parceiros.",
      color: "from-purple-600 to-purple-800",
      link: links.link_cotacao
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[#0B3C8C] py-16 text-center shadow-inner">
        <ShieldCheck className="h-16 w-16 text-white/80 mx-auto mb-4" />
        <h1 className="text-3xl md:text-5xl font-bold font-sans !text-white mb-4">Área Restrita</h1>
        <p className="text-blue-100 max-w-xl mx-auto px-4 text-lg">
          Portal de acesso seguro para colaboradores e parceiros do LS Guarato. Selecione a opção desejada.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl w-full">
          {actions.map((action, idx) => (
            <motion.a
              href={action.link}
              key={idx}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-br ${action.color} rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group min-h-[240px]`}
            >
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm z-10 group-hover:scale-110 transition-transform duration-300">
                <action.icon className="h-12 w-12 text-white" />
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold font-sans tracking-wide z-10 max-w-[80%] uppercase leading-tight !text-white">
                {action.title}
              </h2>
              
              <p className="text-white/80 text-sm mt-2 z-10">
                {action.desc}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};
