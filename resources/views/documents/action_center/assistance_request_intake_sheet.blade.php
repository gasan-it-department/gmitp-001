<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Assistance Request Intake Sheet - {{ $data->request->transaction_number }}</title>
    @vite('resources/css/app.css')
    <style>
        html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 10pt; color: #0f172a; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
    </style>
</head>
<body class="bg-white">
    @php
        $request = $data->request;
        $snapshot = $request->snapshot;
        $assistanceType = $request->assistanceType;
        $fullSnapshotName = trim(implode(' ', array_filter([
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
        $onBehalfMember = $request->onBehalfHouseholdMember;
        $onBehalfMemberName = $onBehalfMember ? trim(implode(' ', array_filter([
            $onBehalfMember->first_name,
            $onBehalfMember->middle_name,
            $onBehalfMember->last_name,
            $onBehalfMember->suffix,
        ]))) : null;
        $formatMoney = fn($value) => $value === null ? '---' : 'PHP ' . number_format((float) $value, 2);
        $verifiedHouseholdIncome = (float) $data->householdMembers
            ->filter(fn($member) => $member->relationship === 'head' || $member->is_verified_dependent)
            ->sum(fn($member) => (float) $member->monthly_income);
    @endphp

    <header class="mb-4 border-b-2 border-slate-800 pb-3">
        <div class="flex items-start justify-between">
            <div>
                <p class="text-[8pt] font-bold tracking-widest text-slate-500 uppercase">Republic of the Philippines</p>
                <p class="text-[8pt] font-bold tracking-widest text-slate-500 uppercase">Municipality of {{ $data->municipalityName ?? '---' }}</p>
                <p class="text-[8pt] font-bold tracking-widest text-slate-500 uppercase">Municipal Social Welfare and Development Office</p>
                <h1 class="mt-2 text-[16pt] font-bold text-slate-900">Assistance Request Intake Sheet</h1>
                <p class="mt-1 font-mono text-[9pt] text-slate-600">{{ $request->transaction_number }}</p>
            </div>
            <div class="text-right">
                <p class="text-[8pt] font-semibold tracking-widest text-slate-500 uppercase">Generated</p>
                <p class="text-[9pt] font-medium text-slate-900">{{ $data->generatedAt->format('F j, Y - g:i A') }}</p>
                <p class="mt-2 text-[8pt] font-semibold tracking-widest text-slate-500 uppercase">By</p>
                <p class="text-[9pt] font-medium text-slate-900">{{ $data->generatedByUserName }}</p>
            </div>
        </div>
    </header>

    <section class="mb-4">
        @include('documents.action_center.partials._section_header', [
            'title' => 'I. Request Summary',
            'meta' => $request->status?->label() ?? strtoupper((string) $request->status),
        ])

        <div class="grid grid-cols-3 gap-3">
            @include('documents.action_center.partials._field', ['label' => 'Transaction No.', 'value' => $request->transaction_number])
            @include('documents.action_center.partials._field', ['label' => 'Assistance Type', 'value' => $assistanceType?->name])
            @include('documents.action_center.partials._field', ['label' => 'Status', 'value' => $request->status?->label()])
            @include('documents.action_center.partials._field', ['label' => 'Submitted At', 'value' => $request->created_at?->format('F j, Y - g:i A')])
            @include('documents.action_center.partials._field', ['label' => 'Approved Amount', 'value' => $formatMoney($request->amount_approved)])
            @include('documents.action_center.partials._field', ['label' => 'Filed By', 'value' => $request->encoded_by_user_id ? 'Admin / Walk-in' : 'Citizen Portal'])
        </div>

        <div class="mt-3 rounded border border-slate-200 bg-slate-50 p-2">
            <p class="text-[8pt] font-bold tracking-widest text-slate-500 uppercase">Purpose / Statement</p>
            <p class="mt-1 whitespace-pre-wrap text-[9pt] text-slate-900">{{ $request->description ?: '---' }}</p>
        </div>

        @if($request->remarks)
            <div class="mt-2 rounded border border-slate-200 bg-white p-2">
                <p class="text-[8pt] font-bold tracking-widest text-slate-500 uppercase">Admin Remarks</p>
                <p class="mt-1 whitespace-pre-wrap text-[9pt] text-slate-900">{{ $request->remarks }}</p>
            </div>
        @endif
    </section>

    <section class="mb-4">
        @include('documents.action_center.partials._section_header', ['title' => 'II. Frozen Beneficiary Snapshot'])

        <div class="grid grid-cols-3 gap-3">
            @include('documents.action_center.partials._field', ['label' => 'Beneficiary No.', 'value' => $request->beneficiary?->beneficiary_number])
            @include('documents.action_center.partials._field', ['label' => 'Full Name', 'value' => $fullSnapshotName])
            @include('documents.action_center.partials._field', ['label' => 'Sex', 'value' => ucfirst((string) $snapshot?->sex)])
            @include('documents.action_center.partials._field', ['label' => 'Date of Birth', 'value' => $snapshot?->birth_date?->format('F j, Y')])
            @include('documents.action_center.partials._field', ['label' => 'Age at Filing', 'value' => $snapshot?->birth_date && $request->created_at ? (int) $snapshot->birth_date->diffInYears($request->created_at) . ' years old' : null])
            @include('documents.action_center.partials._field', ['label' => 'Civil Status', 'value' => ucfirst((string) $snapshot?->civil_status)])
            @include('documents.action_center.partials._field', ['label' => 'Religion', 'value' => $snapshot?->religion])
            @include('documents.action_center.partials._field', ['label' => 'Educational Attainment', 'value' => $snapshot?->educational_attainment])
            @include('documents.action_center.partials._field', ['label' => 'Occupation', 'value' => $snapshot?->occupation])
            @include('documents.action_center.partials._field', ['label' => 'Monthly Income', 'value' => $formatMoney($snapshot?->monthly_income)])
            @include('documents.action_center.partials._field', ['label' => 'Household Total Income', 'value' => $formatMoney($snapshot?->household_total_income)])
        </div>
    </section>

    <section class="mb-4">
        @include('documents.action_center.partials._section_header', ['title' => 'III. Frozen Address Snapshot'])

        <div class="grid grid-cols-2 gap-3">
            @include('documents.action_center.partials._field', ['label' => 'Street', 'value' => $snapshot?->street])
            @include('documents.action_center.partials._field', ['label' => 'Barangay', 'value' => $snapshot?->barangay])
            @include('documents.action_center.partials._field', ['label' => 'Barangay PSGC', 'value' => $snapshot?->barangay_psgc_code])
            @include('documents.action_center.partials._field', ['label' => 'Municipality', 'value' => $data->municipalityName])
        </div>
    </section>

    <section class="mb-4">
        @include('documents.action_center.partials._section_header', ['title' => 'IV. Filing Subject'])

        @if($request->relationship_to_beneficiary === null)
            <p class="rounded border border-emerald-200 bg-emerald-50 p-2 text-[9pt] font-semibold text-emerald-900">
                Filed for self.
            </p>
        @else
            <div class="grid grid-cols-3 gap-3">
                @include('documents.action_center.partials._field', ['label' => 'Relationship', 'value' => $request->relationship_to_beneficiary?->label()])
                @include('documents.action_center.partials._field', ['label' => 'Subject Name', 'value' => $onBehalfName ?: $onBehalfMemberName])
                @include('documents.action_center.partials._field', ['label' => 'Roster Member ID', 'value' => $request->on_behalf_household_member_id])
                @include('documents.action_center.partials._field', ['label' => 'Date of Death', 'value' => $request->on_behalf_date_of_death?->format('F j, Y')])
                @include('documents.action_center.partials._field', ['label' => 'Dependent Verified', 'value' => $onBehalfMember ? ($onBehalfMember->is_verified_dependent || $onBehalfMember->relationship === 'head' ? 'Yes' : 'No') : 'Not linked'])
            </div>
        @endif
    </section>

    <section class="mb-4">
        @include('documents.action_center.partials._section_header', [
            'title' => 'V. Current Household Composition',
            'meta' => $data->householdMembers->count() . ' active member(s) - Verified Income: PHP ' . number_format($verifiedHouseholdIncome, 2),
        ])

        @if($data->householdMembers->isEmpty())
            <p class="text-[9pt] italic text-slate-400">No active household members on record.</p>
        @else
            <table class="w-full border-collapse text-[9pt]">
                <thead>
                    <tr class="bg-slate-100 text-left text-[8pt] font-bold tracking-wider text-slate-700 uppercase">
                        <th class="border border-slate-300 px-2 py-1.5">Name</th>
                        <th class="border border-slate-300 px-2 py-1.5">Relationship</th>
                        <th class="border border-slate-300 px-2 py-1.5">Age</th>
                        <th class="border border-slate-300 px-2 py-1.5">Sex</th>
                        <th class="border border-slate-300 px-2 py-1.5">Occupation</th>
                        <th class="border border-slate-300 px-2 py-1.5 text-right">Monthly Income</th>
                        <th class="border border-slate-300 px-2 py-1.5 text-center">Verification</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data->householdMembers as $member)
                        @php
                            $isHead = $member->relationship === 'head';
                            $isVerified = $isHead || $member->is_verified_dependent;
                            $memberName = trim(implode(' ', array_filter([
                                $member->first_name,
                                $member->middle_name,
                                $member->last_name,
                                $member->suffix,
                            ])));
                        @endphp
                        <tr class="{{ $isHead ? 'bg-amber-50 font-semibold' : (! $isVerified ? 'bg-rose-50' : '') }}">
                            <td class="border border-slate-300 px-2 py-1.5">{{ $memberName ?: '---' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 capitalize">{{ str_replace('_', ' ', (string) $member->relationship) }}</td>
                            <td class="border border-slate-300 px-2 py-1.5">{{ $member->birth_date?->age ?? '---' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 capitalize">{{ $member->sex ?? '---' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5">{{ $member->occupation ?? '---' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 text-right">PHP {{ number_format((float) $member->monthly_income, 2) }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 text-center text-[8pt] font-bold {{ $isVerified ? 'text-emerald-700' : 'text-rose-600' }}">
                                {{ $isHead ? 'HEAD' : ($isVerified ? 'VERIFIED' : 'PENDING') }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </section>

    <footer class="mt-6 border-t border-slate-300 pt-3">
        <div class="flex items-start justify-between gap-4 text-[8pt] text-slate-600">
            <div>
                <p class="font-bold tracking-widest text-slate-700 uppercase">Data Privacy Notice</p>
                <p class="mt-1 leading-snug">
                    This document contains personal information protected under the Data Privacy Act of 2012
                    (Republic Act 10173). Unauthorized disclosure is prohibited.
                </p>
            </div>
            <div class="text-right">
                <p class="font-bold tracking-widest text-slate-700 uppercase">Request Consent</p>
                <p class="mt-1">{{ $request->privacy_consented_at?->format('M j, Y - g:i A') ?? 'Not recorded' }}</p>
                <p>Privacy Notice Version: {{ $request->privacy_notice_version ?? '---' }}</p>
            </div>
        </div>
    </footer>
</body>
</html>
