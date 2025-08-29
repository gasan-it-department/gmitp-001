import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';

export default function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
    // const [user_name, setUsername] = useState('');
    // const [password, setPassword] = useState('');
    // const [isRemembered, setIsRemembered] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        user_name: '',
        password: '',
        is_remembered: false,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('login.store.laravel'));
    }

    return (
        <div className="overflow-hidden p-1">
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="phone" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                            User Name
                        </Label>
                        <Input
                            id="user_name"
                            type="text"
                            name="user_name"
                            value={data.user_name}
                            onChange={(e) => setData('user_name', e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-3">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                                Password
                            </Label>
                            <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
                                Forgot your password?
                            </a>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            name="password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex gap-2">
                        <Switch id="is_remembered" name="is_remembered" checked={data.is_remembered} />
                        <Label htmlFor="is_remembered" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                            Remember me
                        </Label>
                    </div>
                    <Button disabled={processing} type="submit" className="w-full">
                        Login
                    </Button>
                    <div className="grid grid-cols-3 gap-4"></div>
                </div>
            </form>
            <div className="text-center text-xs text-balance text-muted-foreground *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary"></div>
        </div>
    );
}
