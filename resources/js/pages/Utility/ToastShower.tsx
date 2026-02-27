import { Toaster, ToasterProps } from 'sonner';

// 1. Use Sonner's own exported type for the position to ensure 100% compatibility
type ToastPosition = ToasterProps['position'];

interface Props {
    position?: ToastPosition;
}

// 2. Destructure { position } from the props object
const ToastProvider = ({ position = 'top-center' }: Props) => {
    return (
        <Toaster
            position={position}
            richColors
            closeButton
            expand
            toastOptions={{
                duration: 4000,
                classNames: {
                    // Your custom gradient looks great!
                    toast: 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white shadow-lg border-none',
                    description: 'text-orange-100',
                    actionButton: 'bg-white/20 hover:bg-white/30 text-white',
                    cancelButton: 'text-white/70 hover:text-white',
                },
            }}
        />
    );
};

export default ToastProvider;
