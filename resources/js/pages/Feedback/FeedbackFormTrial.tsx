import { useState } from 'react';

export default function FeedbackFormTrial() {
    interface FormData {
        subject: string;
        name: string;
        message: string;
        file: File[];
    }

    const sampleData: FormData = {
        subject: '',
        name: '',
        message: '',
        file: [],
    };
    const [form, setForm] = useState<FormData>(sampleData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setForm((hello) => ({
            ...hello,
            [name]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];

        setForm((hello) => ({
            ...hello,
            file: files,
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form Submitted', form);
    };
    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 rounded-xl bg-white p-4 shadow">
            <h2 className="text-xl font-semibold">Submit Feedback</h2>

            <label className="flex items-center gap-2">subject</label>
            <input type="text" name="subject" className="border border-gray-300" onChange={handleChange} />

            <label>name</label>
            <input type="text" name="name" className="border border-gray-300" onChange={handleChange} />

            <label>message</label>
            <textarea name="message" className="border border-gray-300" onChange={handleChange}></textarea>

            <label>file</label>
            <input type="file" className="border border-gray-300" onChange={handleFileChange} />

            <button type="submit" className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                Submit
            </button>
        </form>
    );
}
