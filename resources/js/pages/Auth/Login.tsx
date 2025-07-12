
import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import MainPage from '../MainPage';

export default function LoginPage() {

    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <section className="grid h-screen w-full bg-gray-50 dark:bg-gray-900">
            <div className="m-auto mx-auto flex h-full w-full flex-col items-center justify-center px-6 py-8 md:h-screen lg:h-2/4 lg:w-1/3 lg:py-0">
                <a className="mb-6 flex items-center text-2xl font-semibold text-gray-900 dark:text-white">
                    Login to your account
                </a>
                <div className='mt-8 mb-8' />
                <div className="w-full sm:w-3/4 md:w-100 lg:w-100 p-2">
                    <form className="max-w-md mx-auto">
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="email" name="floating_email" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">User Name</label>
                        </div>

                        <div className='mt-9 mb-9' />

                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                id="password"
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=" "
                                required
                            />
                            <label
                                htmlFor="password"
                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                            >
                                Password
                            </label>
                            
                            <button
                                type="button"
                                onClick={togglePassword}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        <div className='mt-9 mb-9' />

                        <div className='flex justify-between items-center'>
                            <div className="flex items-center">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                                    required
                                />
                                <label htmlFor="terms" className="ml-2 text-sm text-gray-900 dark:text-gray-300 cursor-pointer">
                                    Remember me
                                </label>
                            </div>
                            <div className='flex justify-end'>
                                <a href="#" className="text-black hover:text-black hover:underline text-[12px]">
                                    Forgotten Password?
                                </a>
                            </div>
                        </div>
                        <div className='mt-20 mb-20' />

                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                    </form>
                </div>
            </div>
            <footer className="mt-10 text-center text-xs text-gray-500">&copy; 2025 | All rights reserved | Gasan Municipality</footer>
        </section>
    );
}

LoginPage.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;
