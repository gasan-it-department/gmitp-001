import { cn } from "@/lib/utils";
import { HtmlHTMLAttributes } from "react";


export default function InputError({ message, className = '', ...props }: HtmlHTMLAttributes<HTMLParagraphElement>& {message?:string} ) {
    return message ? (
        <p className={cn(`text-sm text-red-600 dark:text-red-500`, className)}>
            <span className="font-medium">Oops!</span>
            {message}
        </p>
    ) : null;
}