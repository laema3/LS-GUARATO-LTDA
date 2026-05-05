import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Home } from "lucide-react";
import { motion } from "motion/react";

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 relative"
      >
        <div className="bg-blue-50 p-10 rounded-full mb-6 relative">
          <ShoppingCart className="h-24 w-24 text-[#0B3C8C]" strokeWidth={1.5} />
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute -top-2 -right-2 bg-[#D62828] text-white p-3 rounded-full shadow-lg"
          >
            <span className="text-xl font-bold font-sans">?</span>
          </motion.div>
        </div>
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-black text-[#0B3C8C] mb-4 font-sans italic tracking-tight"
      >
        OPS! CARRINHO <span className="text-[#D62828]">VAZIO?</span>
      </motion.h1>

      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-gray-600 mb-10 max-w-md font-sans leading-relaxed"
      >
        Não encontramos o que você estava procurando por aqui. Talvez este corredor tenha mudado de lugar ou a oferta expirou!
      </motion.p>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link
          to="/"
          className="flex items-center justify-center gap-2 bg-[#D62828] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 hover:-translate-y-1"
        >
          <Home className="h-5 w-5" />
          VOLTAR AO INÍCIO
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 bg-white text-[#0B3C8C] border-2 border-[#0B3C8C] px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
          VOLTAR ANTERIOR
        </button>
      </motion.div>

      <div className="mt-16 pt-8 border-t border-gray-100 w-full max-w-sm">
        <p className="text-sm text-gray-400 font-sans italic font-medium">
          LS GUARATO - A melhor opção em todos os momentos!
        </p>
      </div>
    </div>
  );
};
