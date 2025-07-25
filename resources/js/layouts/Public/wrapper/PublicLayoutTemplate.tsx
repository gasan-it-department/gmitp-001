// Update the import path below to the correct relative path if necessary
import PublicLayoutTemplate from '../PublicLayout';

export default function PublicLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    return (
        <PublicLayoutTemplate title={title} description={description} {...props}>
            {children}
        </PublicLayoutTemplate>
    );
}
