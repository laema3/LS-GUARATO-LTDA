import { motion } from "motion/react";
import { Hammer, Clock, Phone, Instagram, Facebook, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-[#0B3C8C] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center relative z-10 border-t-8 border-[#D62828]"
      >
        <div className="flex justify-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="bg-[#0B3C8C]/10 p-6 rounded-full"
          >
            <Hammer className="h-16 w-16 text-[#0B3C8C]" />
          </motion.div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-sans">
          ESTAMOS EM <span className="text-[#D62828]">MANUTENÇÃO</span>
        </h1>
        
        <p className="text-gray-600 text-lg md:text-xl mb-10 leading-relaxed">
          Estamos trabalhando para melhorar sua experiência. Voltaremos em breve com novidades e ofertas imperdíveis para você!
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <Clock className="h-6 w-6 text-[#0B3C8C] mx-auto mb-3" />
            <span className="block font-bold text-gray-900">Previsão</span>
            <span className="text-gray-500 text-sm">Retornamos em alguns instantes</span>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <Phone className="h-6 w-6 text-[#0B3C8C] mx-auto mb-3" />
            <span className="block font-bold text-gray-900">Atendimento</span>
            <span className="text-gray-500 text-sm">(34) 3318-6400</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-8">
          <div className="flex justify-center gap-6">
            <a href="#" className="p-3 bg-[#0B3C8C] text-white rounded-full hover:bg-[#D62828] transition-colors shadow-lg">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="p-3 bg-[#0B3C8C] text-white rounded-full hover:bg-[#D62828] transition-colors shadow-lg">
              <Facebook className="h-6 w-6" />
            </a>
          </div>

          <Link 
            to="/admin" 
            className="flex items-center gap-2 text-gray-400 hover:text-[#0B3C8C] text-sm font-medium transition-colors border border-gray-200 px-4 py-2 rounded-full"
          >
            <Lock className="h-4 w-4" />
            Acesso Administrativo
          </Link>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-400 font-medium tracking-widest uppercase">
            LS Guarato - Tradição e Qualidade
          </p>
        </div>
      </motion.div>
    </div>
  );
}
