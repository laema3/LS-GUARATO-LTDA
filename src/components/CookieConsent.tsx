import { useState, useEffect } from "react";
import { X, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem("lsguarato_cookie_consent");
    if (!hasConsented) {
      // Pequeno delay para aparecer a notificação
      const timer = setTimeout(() => {
         setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("lsguarato_cookie_consent", "accepted");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-0 left-0 w-full z-[1000] p-4 flex justify-center pointer-events-none"
        >
          <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100 max-w-4xl w-full flex flex-col md:flex-row items-center gap-6 pointer-events-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B3C8C]/5 rounded-bl-full pointer-events-none" />
            
            <div className="bg-[#0B3C8C]/10 p-3 rounded-full shrink-0">
               <Shield className="w-8 h-8 text-[#0B3C8C]" />
            </div>
            
             <div className="flex-1 text-center md:text-left text-sm text-gray-600">
               <h3 className="font-bold text-gray-900 text-base mb-1">Aviso sobre Cookies e Privacidade</h3>
               <p>
                 Nós utilizamos cookies e outras tecnologias semelhantes para melhorar a sua experiência em nossos serviços, personalizar publicidade e recomendar conteúdo de seu interesse. Ao utilizar nossos serviços, você aceita nossa{" "}
                 <Link to="/politica-de-privacidade" className="text-[#0B3C8C] font-bold hover:underline" onClick={() => setIsVisible(false)}>Política de Privacidade</Link>.
               </p>
             </div>
             
             <div className="flex shrink-0 gap-3 w-full md:w-auto">
               <button
                 onClick={handleAccept}
                 className="flex-1 md:flex-auto bg-[#0B3C8C] hover:bg-[#082a63] text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors"
               >
                 Aceitar e Continuar
               </button>
             </div>

             <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden md:block"
                aria-label="Dispensar"
             >
                <X className="w-5 h-5" />
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
