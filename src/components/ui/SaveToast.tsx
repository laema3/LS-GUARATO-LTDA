import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";

interface SaveToastProps {
  show: boolean;
  onClose: () => void;
  message?: string;
}

export const SaveToast = ({ show, onClose, message = "Alterações salvas com sucesso!" }: SaveToastProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 font-medium border border-green-700"
        >
          <CheckCircle2 className="h-6 w-6" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
