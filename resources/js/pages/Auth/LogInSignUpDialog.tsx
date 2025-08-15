import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import InputError from "@/components/ui/input-error";
import Input from "@/components/ui/input-floating";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "@inertiajs/react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { FormEventHandler, useState } from "react";

type RegisterFormData = {
    user_name: string;
    phone: string;
    password: string;
    password_confirmation: string;
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};


export default function LogInSignUpDialog({ isOpen, onClose }: Props) {
    const [dialogTitle, setDialogTitle] = useState("Log in to your account");
    const [logInUserName, setLogInUserName] = useState("");
    const [logInPassword, setLogInPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [signUpPhoneNumber, setSignUpPhoneNumber] = useState("");
    const [signUpUserName, setSignUpUserName] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");

    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    // const { data, setData, post, processing, errors } = useForm<RegisterFormData>({
    //         user_name: '',
    //         phone: '',
    //         password: '',
    //         password_confirmation: '',
    //     });

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    }

    // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     post('/store-account');
    // };

    // const submit: FormEventHandler = (e) => {
    //     e.preventDefault();
    //     post(route('login'), {
    //         onFinish: () => reset('password'),
    //     });
    // };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={true}
                className="
      flex flex-col w-full h-screen max-w-none rounded-none m-0 p-4 overflow-hidden
      sm:max-w-[450px] sm:h-auto sm:rounded-lg sm:m-auto sm:p-6
      lg:max-w-[500px] lg:h-[90vh] lg:rounded-xl
    "
            >
                <DialogHeader>
                    <DialogTitle className="p-3 text-[21px] text-center">
                        {dialogTitle}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="login" className="flex flex-col w-full h-full"
                    onValueChange={(value) => {
                        console.log(`Value: ${value}`);
                        switch (value) {
                            case "signup":
                                setDialogTitle("Create new account");
                                break;
                            case "login":
                                setDialogTitle("Log in to your account");
                                break;
                        }
                    }}>
                    <TabsList className="flex w-full flex-shrink-0">
                        <TabsTrigger value="login" className="flex-1">
                            Log In
                        </TabsTrigger>
                        <TabsTrigger value="signup" className="flex-1">
                            Sign Up
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-5" />

                    <div className="">
                        <TabsContent value="login" className="px-1">
                            <form
                                className="flex flex-col items-center justify-center w-full"
                                onSubmit={(e) => e.preventDefault()}
                            >

                                <div className="group relative z-0 mb-5 w-full">
                                    <span className="text-[13px] font-bold">User Name</span>
                                    <Input
                                        id="username"
                                        value={logInUserName}
                                        onChange={(e) => setLogInUserName(e.target.value)}
                                        placeholder=" "
                                        className="placeholder-transparent w-full"
                                        label={""}
                                    />
                                </div>

                                {/* Spacer */}
                                <div className="mt-6" />

                                {/* Password */}
                                <div className="group relative z-0 mb-5 w-full">
                                    <span className="text-[13px] font-bold">Password</span>
                                    <Input
                                        id="password"
                                        value={logInPassword}
                                        onChange={(e) => setLogInPassword(e.target.value)}
                                        placeholder=" "
                                        className="placeholder-transparent w-full pr-10"
                                        label={""}
                                        type={showPassword ? "text" : "password"}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePassword}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-white"
                                    >
                                        {showPassword ? (
                                            <Eye className="h-5 w-5" />
                                        ) : (
                                            <EyeOff className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Remember me + Forgot password */}
                                <div className="flex items-center justify-between w-full flex-wrap gap-y-2">
                                    <div className="flex items-center">
                                        <Switch>Hello</Switch>
                                        <label
                                            htmlFor="terms"
                                            className="ml-2 cursor-pointer text-sm text-gray-900 dark:text-gray-300"
                                        >
                                            Remember me
                                        </label>
                                    </div>
                                    <div>
                                        <a
                                            href="#"
                                            className="text-[12px] text-black hover:text-black hover:underline"
                                        >
                                            Forgotten Password?
                                        </a>
                                    </div>
                                </div>

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    className="mt-8 w-full"
                                    tabIndex={4}
                                    disabled={processing}
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    Log in
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup" className="px-1">
                            <form className="flex flex-col overflow-y-auto max-h-[500px] p-2 sm:max-h-[400px] sm:p-4 lg:max-h-[400px] lg:p-6">
                                <div className="grid gap-10">
                                    <div className="grid gap-1">
                                        <span className="text-[13px] font-bold">Phone Number</span>
                                        <Input
                                            id="phone_number"
                                            value={""}
                                            onChange={(e) => { }}
                                            placeholder=" "
                                            className="placeholder-transparent w-full pr-10"
                                            label={""}
                                            type={showPassword ? "text" : "password"}
                                        />
                                        {/* <InputError message={errors.phone} /> */}
                                    </div>

                                    <div className="grid gap-2">
                                        <span className="text-[13px] font-bold">User Name</span>
                                        <Input
                                            id="phone_number"
                                            value={""}
                                            onChange={(e) => { }}
                                            placeholder=" "
                                            className="placeholder-transparent w-full pr-10"
                                            label={""}
                                            type={showPassword ? "text" : "password"}
                                        />
                                        {/* <InputError message={errors.user_name} /> */}
                                    </div>

                                    <div className="relative grid gap-2">
                                        <span className="text-[13px] font-bold">Password</span>
                                        <Input
                                            id="phone_number"
                                            value={""}
                                            onChange={(e) => { }}
                                            placeholder=" "
                                            className="placeholder-transparent w-full pr-10"
                                            label={""}
                                            type={showPassword ? "text" : "password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePassword}
                                            className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-white"
                                        >
                                            {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                        </button>

                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <span className="text-[13px] font-bold">Confirm Password</span>
                                        <Input
                                            id="phone_number"
                                            value={""}
                                            onChange={(e) => { }}
                                            placeholder=" "
                                            className="placeholder-transparent w-full pr-10"
                                            label={""}
                                            type={showPassword ? "text" : "password"}
                                        />
                                        {/* <InputError message={errors.password_confirmation} /> */}
                                    </div>

                                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Create account
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>

    );
}