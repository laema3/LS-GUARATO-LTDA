import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const PageLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Não exibe o loader no painel administrativo
    if (location.pathname.startsWith('/admin')) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Alterado para 1 segundo conforme solicitado

    // Segurança extra: se o componente for desmontado, limpa o timer
    return () => {
      clearTimeout(timer);
      setIsLoading(false);
    };
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-[#0B3C8C] flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ 
              x: [-100, 0, 100],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="text-white"
          >
            <ShoppingCart className="h-16 w-16" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white font-sans font-bold text-2xl mt-4 tracking-wider"
          >
            ABASTECENDO...
          </motion.h2>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
