export default function DetailsStep({ data, setData, errors }) {
    return (
        <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-4">
            <div className="mb-8 space-y-2 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
                <p className="text-gray-500">Please provide specific information about the need.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Assistance Category</label>
                    <select
                        value={data.category}
                        onChange={(e) => setData('category', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                        <option value="Medical">Medical / Hospital</option>
                        <option value="Burial">Burial Assistance</option>
                        <option value="Financial">Financial Aid (AICS)</option>
                        <option value="Food">Food / Rice Subsidy</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Estimated Amount Needed</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="font-bold text-gray-500">₱</span>
                        </div>
                        <input
                            type="number"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder="0.00"
                            className="w-full rounded-xl border border-gray-300 p-3 pl-8 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Reason / Case Details</label>
                <textarea
                    rows={4}
                    value={data.details}
                    onChange={(e) => setData('details', e.target.value)}
                    placeholder="Example: Need assistance for dialysis session at Marinduque Provincial Hospital for Patient Pedro..."
                    className="w-full rounded-xl border border-gray-300 p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                {errors.details && <p className="text-sm text-red-500">{errors.details}</p>}
                <p className="text-right text-xs text-gray-400">Minimum 20 characters</p>
            </div>
        </div>
    );
}
