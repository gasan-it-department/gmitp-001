<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Acknowledgement Receipt - {{ $data->request->transaction_number }}</title>
    @vite('resources/css/app.css')
    <style>
        html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-family: Georgia, 'Times New Roman', serif; font-size: 12pt; color: #0f172a; }
        .line { border-bottom: 1px solid #0f172a; display: inline-block; min-height: 1.1em; padding: 0 6px; }
        .label { font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 8pt; letter-spacing: .08em; text-transform: uppercase; color: #475569; }
    </style>
</head>
<body class="bg-white">
    @php
        $request = $data->request;
        $snapshot = $request->snapshot;
        $assistanceType = $request->assistanceType;
        $receiptDate = $request->released_at ?? $data->generatedAt;
        $isDraft = $request->released_at === null;
        $fullName = trim(implode(' ', array_filter([
            $snapshot?->first_name,
            $snapshot?->middle_name,
            $snapshot?->last_name,
            $snapshot?->suffix,
        ])));
        $onBehalfName = trim(implode(' ', array_filter([
            $request->on_behalf_first_name,
            $request->on_behalf_middle_name,
            $request->on_behalf_last_name,
            $request->on_behalf_suffix,
        ])));
        $member = $request->onBehalfHouseholdMember;
        $memberName = $member ? trim(implode(' ', array_filter([
            $member->first_name,
            $member->middle_name,
            $member->last_name,
            $member->suffix,
        ]))) : null;
        $subjectName = $request->relationship_to_beneficiary === null
            ? null
            : ($onBehalfName ?: $memberName);
        $amount = $request->amount_approved !== null
            ? 'Php ' . number_format((float) $request->amount_approved, 2)
            : 'Php 0.00';
        $programName = $assistanceType?->name ?? 'AICS';
        $purpose = trim((string) ($request->description ?: $programName));
        $barangay = $snapshot?->barangay ?: '________________';
        $municipalityName = $data->municipalityName ?: '________________';
    @endphp

    <header class="mb-20 text-center">
        <p class="text-[12pt] leading-tight">Republic of the Philippines</p>
        <p class="text-[13pt] font-bold leading-tight tracking-wide uppercase">Province of Marinduque</p>
        <p class="text-[16pt] leading-tight">Municipality of {{ $municipalityName }}</p>
        <p class="mt-2 text-[15pt] font-bold underline">Municipal Social Welfare and Development Office</p>
    </header>

    <div class="mb-14 flex items-center justify-between">
        <div>
            @if($isDraft)
                <p class="inline-block rounded border border-amber-300 bg-amber-50 px-3 py-1 font-sans text-[9pt] font-bold tracking-widest text-amber-800 uppercase">
                    Draft for signature
                </p>
            @endif
        </div>
        <div class="w-56 border-b border-slate-900 text-center text-[10pt]">
            {{ $request->release_reference_number ?: 'Reference pending' }}
        </div>
    </div>

    <main>
        <h1 class="mb-14 text-center text-[16pt] font-bold underline">ACKNOWLEDGEMENT RECEIPT</h1>

        <p class="text-justify leading-8">
            I,
            <span class="line min-w-[330px] text-center font-bold">{{ $fullName ?: '____________________________' }}</span>,
            residing at Brgy.
            <span class="line min-w-[220px] text-center">{{ $barangay }}</span>,
            {{ $municipalityName }}, Marinduque hereby acknowledge the receipt of the amount of
            <span class="line min-w-[180px] text-center font-bold">{{ $amount }}</span>
            as {{ $programName }} Assistance under the ASSISTANCE TO INDIVIDUALS IN CRISIS SITUATIONS
            (AICS) program, granted by the Municipal Social Welfare and Development Office (MSWDO)
            of the Municipality of {{ $municipalityName }}, Marinduque.
        </p>

        @if($subjectName)
            <p class="mt-5 rounded border border-slate-200 bg-slate-50 p-3 font-sans text-[10pt] leading-relaxed text-slate-700">
                This request was filed on behalf of
                <span class="font-bold text-slate-900">{{ $subjectName }}</span>
                as {{ $request->relationship_to_beneficiary?->label() ?? 'related beneficiary' }}.
            </p>
        @endif

        <p class="mt-10 leading-8">
            This assistance is for the purpose of
            <span class="line min-w-[260px] text-center">{{ $purpose }}</span>
            Assistance, provided on
            <span class="line min-w-[220px] text-center">{{ $receiptDate->format('F j, Y') }}</span>.
        </p>

        <div class="mt-20 grid grid-cols-2 gap-16">
            <div>
                <p class="mb-12 font-bold">Received by:</p>
                <div class="border-b border-slate-900 text-center font-bold uppercase">
                    {{ $fullName ?: '' }}
                </div>
                <p class="label mt-2 text-center">Name and Signature of Beneficiary / Recipient</p>
            </div>

            <div>
                <p class="mb-12 font-bold">Released by:</p>
                <div class="border-b border-slate-900 text-center">
                    {{ $request->releasedBy?->full_name ?? $data->generatedByUserName }}
                </div>
                <p class="label mt-2 text-center">Authorized MSWDO / Cashier</p>
            </div>
        </div>
    </main>

    <footer class="mt-20 border-t border-slate-300 pt-3 font-sans text-[8pt] text-slate-500">
        <div class="flex items-start justify-between gap-4">
            <div>
                <p class="font-bold tracking-widest uppercase text-slate-700">System Record</p>
                <p class="mt-1">Transaction: {{ $request->transaction_number }}</p>
                <p>Status: {{ $request->status?->label() ?? strtoupper((string) $request->status) }}</p>
            </div>
            <div class="text-right">
                <p>Generated {{ $data->generatedAt->format('M j, Y g:i A') }}</p>
                <p>By {{ $data->generatedByUserName }}</p>
            </div>
        </div>
    </footer>
</body>
</html>
