// src/components/ToastProvider.tsx
import { Toaster } from "sonner";

const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      expand
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white shadow-lg border-none",
          description: "text-orange-100",
          actionButton: "bg-white/20 hover:bg-white/30 text-white",
          cancelButton: "text-white/70 hover:text-white",
        },
      }}
    />

  );
};

export default ToastProvider;
