import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    type?: string;
    label: string;
    id?: string;
    name?: string;
}

const Input: React.FC<InputProps> = ({ type = 'text', label, id, ...props }) => {
    const inputId = id || props.name;

    return (
        <div className="group relative z-0 w-full">
            <input
                type={type}
                name={props.name}
                id={inputId}
                value={props.value}
                onChange={props.onChange}
                tabIndex={props.tabIndex}
                disabled={props.disabled}
                className="peer text-md block w-full appearance-none rounded-t-2xl border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm font-medium text-gray-900 focus:border-blue-600 focus:ring-0 focus:outline-none dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                placeholder=" "
                required
            />
            <label
                htmlFor={inputId}
                className="absolute top-3 -z-20 origin-[0] -translate-y-7 scale-75 transform text-medium font-medium text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 dark:text-gray-400 peer-focus:dark:text-blue-500"
            >
                {label}
            </label>
        </div>
    );
};

export default Input;
