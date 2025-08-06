import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function LoadingDialog({ open }: { open: boolean }) {
  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="text-lg font-medium text-gray-800">Loading...</span>
      </div>
    </div>
  );
}
