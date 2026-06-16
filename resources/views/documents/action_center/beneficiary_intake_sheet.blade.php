<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Beneficiary Intake Sheet — {{ $data->beneficiary->full_name }}</title>
    @vite('resources/css/app.css')
    <style>
        /* Browsershot honors background colors only when this is set. */
        html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 10pt; color: #0f172a; }
        .page-break { page-break-after: always; }
        thead { display: table-header-group; }  /* repeat table headers across pages */
        tr { page-break-inside: avoid; }        /* don't split rows */
    </style>
</head>
<body class="bg-white">

    {{-- ═══════════════════════════════════════════════════════════════ --}}
    {{-- HEADER                                                            --}}
    {{-- ═══════════════════════════════════════════════════════════════ --}}
    <header class="mb-4 border-b-2 border-slate-800 pb-3">
        <div class="flex items-start justify-between">
            <div>
                <p class="text-[8pt] font-bold tracking-widest text-slate-500 uppercase">Republic of the Philippines</p>
                <p class="text-[8pt] font-bold tracking-widest text-slate-500 uppercase">Municipality of {{ $data->municipalityName ?? '—' }}</p>
                <p class="text-[8pt] font-bold tracking-widest text-slate-500 uppercase">Municipal Social Welfare and Development Office</p>
                <h1 class="mt-2 text-[16pt] font-bold text-slate-900">Beneficiary Intake Sheet</h1>
            </div>
            <div class="text-right">
                <p class="text-[8pt] font-semibold tracking-widest text-slate-500 uppercase">Generated</p>
                <p class="text-[9pt] font-medium text-slate-900">{{ $data->generatedAt->format('F j, Y · g:i A') }}</p>
                <p class="mt-2 text-[8pt] font-semibold tracking-widest text-slate-500 uppercase">By</p>
                <p class="text-[9pt] font-medium text-slate-900">{{ $data->generatedByUserName }}</p>
            </div>
        </div>
    </header>

    {{-- ═══════════════════════════════════════════════════════════════ --}}
    {{-- IDENTITY                                                          --}}
    {{-- ═══════════════════════════════════════════════════════════════ --}}
    <section class="mb-4">
        @include('documents.action_center.partials._section_header', ['title' => 'I. Beneficiary Identity'])

        <div class="grid grid-cols-3 gap-3">
            @include('documents.action_center.partials._field', ['label' => 'Beneficiary No.', 'value' => $data->beneficiary->beneficiary_number ?? '—'])
            @include('documents.action_center.partials._field', ['label' => 'Full Name',   'value' => $data->beneficiary->full_name])
            @include('documents.action_center.partials._field', ['label' => 'Sex',         'value' => ucfirst((string) $data->beneficiary->sex)])
            @include('documents.action_center.partials._field', ['label' => 'Date of Birth','value' => optional($data->beneficiary->birth_date)->format('F j, Y') ?? '—'])
            @include('documents.action_center.partials._field', ['label' => 'Age',         'value' => $data->beneficiary->birth_date ? $data->beneficiary->birth_date->age . ' years old' : '—'])
            @include('documents.action_center.partials._field', ['label' => 'Civil Status','value' => ucfirst((string) ($data->beneficiary->civil_status->value ?? ''))])
            @include('documents.action_center.partials._field', ['label' => 'Religion',    'value' => $data->beneficiary->religion?->name ?? '—'])
            @include('documents.action_center.partials._field', ['label' => 'Educational Attainment', 'value' => $data->beneficiary->educational_attainment ?? '—'])
            @include('documents.action_center.partials._field', ['label' => 'Occupation',  'value' => $data->beneficiary->occupation ?? '—'])
            @include('documents.action_center.partials._field', ['label' => 'Monthly Income', 'value' => '₱' . number_format((float) $data->beneficiary->monthly_income, 2)])
        </div>
    </section>

    {{-- ═══════════════════════════════════════════════════════════════ --}}
    {{-- ADDRESS                                                           --}}
    {{-- ═══════════════════════════════════════════════════════════════ --}}
    <section class="mb-4">
        @include('documents.action_center.partials._section_header', ['title' => 'II. Address'])

        <div class="grid grid-cols-2 gap-3">
            @include('documents.action_center.partials._field', ['label' => 'Street', 'value' => $data->beneficiary->household?->street ?? '—'])
            @include('documents.action_center.partials._field', ['label' => 'Barangay', 'value' => $data->beneficiary->household?->barangay ?? '—'])
            @include('documents.action_center.partials._field', ['label' => 'Municipality', 'value' => $data->municipalityName ?? '—'])
            @include('documents.action_center.partials._field', ['label' => 'Province', 'value' => 'Marinduque'])
        </div>
    </section>

    {{-- ═══════════════════════════════════════════════════════════════ --}}
    {{-- HOUSEHOLD COMPOSITION                                             --}}
    {{-- ═══════════════════════════════════════════════════════════════ --}}
    @php
        $verifiedMembers = $data->householdMembers->filter(fn($m) => $m->relationship === 'head' || $m->is_verified_dependent);
        $unverifiedMembers = $data->householdMembers->filter(fn($m) => $m->relationship !== 'head' && !$m->is_verified_dependent);
        $verifiedIncome = (float) $verifiedMembers->sum(fn($m) => (float) $m->monthly_income);
    @endphp
    <section class="mb-4">
        @include('documents.action_center.partials._section_header', [
            'title' => 'III. Household Composition',
            'meta' => ($data->beneficiary->household?->household_code ? $data->beneficiary->household->household_code . ' · ' : '')
                     . $data->householdMembers->count() . ' active member(s) · Total Monthly Income: ₱' . number_format($data->householdTotalMonthlyIncome, 2),
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
                        <th class="border border-slate-300 px-2 py-1.5">Civil Status</th>
                        <th class="border border-slate-300 px-2 py-1.5">Occupation</th>
                        <th class="border border-slate-300 px-2 py-1.5 text-right">Monthly Income</th>
                        <th class="border border-slate-300 px-2 py-1.5 text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data->householdMembers as $member)
                        @php
                            $isHead = $member->relationship === 'head';
                            $isVerified = $isHead || $member->is_verified_dependent;
                        @endphp
                        <tr class="{{ $isHead ? 'bg-amber-50 font-semibold' : (!$isVerified ? 'bg-rose-50' : '') }}">
                            <td class="border border-slate-300 px-2 py-1.5">
                                {{ trim($member->first_name . ' ' . ($member->middle_name ? $member->middle_name . ' ' : '') . $member->last_name . ' ' . ($member->suffix ?? '')) }}
                            </td>
                            <td class="border border-slate-300 px-2 py-1.5 capitalize">{{ str_replace('_', ' ', (string) $member->relationship) }}</td>
                            <td class="border border-slate-300 px-2 py-1.5">{{ $member->birth_date?->age ?? '—' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 capitalize">{{ $member->sex ?? '—' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 capitalize">{{ $member->civil_status ?? '—' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5">{{ $member->occupation ?? '—' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 text-right">₱{{ number_format((float) $member->monthly_income, 2) }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 text-center text-[8pt] font-bold {{ $isVerified ? 'text-emerald-700' : 'text-rose-600' }}">
                                {{ $isVerified ? '✓ Verified' : 'UNVERIFIED' }}
                            </td>
                        </tr>
                    @endforeach
                    <tr class="bg-slate-50 font-bold">
                        <td class="border border-slate-300 px-2 py-1.5" colspan="6">Household Total</td>
                        <td class="border border-slate-300 px-2 py-1.5 text-right">₱{{ number_format($data->householdTotalMonthlyIncome, 2) }}</td>
                        <td class="border border-slate-300 px-2 py-1.5"></td>
                    </tr>
                </tbody>
            </table>

            @if($unverifiedMembers->isNotEmpty())
                <p class="mt-2 text-[8pt] italic text-rose-600">
                    ⚠ {{ $unverifiedMembers->count() }} member(s) marked UNVERIFIED — listed by the applicant but not yet confirmed by MSWD staff.
                    Verified household income (excluding unverified): ₱{{ number_format($verifiedIncome, 2) }}
                </p>
            @endif
        @endif
    </section>

    {{-- ═══════════════════════════════════════════════════════════════ --}}
    {{-- ASSISTANCE HISTORY                                                --}}
    {{-- ═══════════════════════════════════════════════════════════════ --}}
    <section class="mb-4">
        @include('documents.action_center.partials._section_header', [
            'title' => 'IV. Assistance History',
            'meta' => 'Showing last ' . $data->assistanceHistory->count() . ' request(s)',
        ])

        @if($data->assistanceHistory->isEmpty())
            <p class="text-[9pt] italic text-slate-400">No prior assistance requests on record.</p>
        @else
            <table class="w-full border-collapse text-[9pt]">
                <thead>
                    <tr class="bg-slate-100 text-left text-[8pt] font-bold tracking-wider text-slate-700 uppercase">
                        <th class="border border-slate-300 px-2 py-1.5">Transaction #</th>
                        <th class="border border-slate-300 px-2 py-1.5">Program</th>
                        <th class="border border-slate-300 px-2 py-1.5">Status</th>
                        <th class="border border-slate-300 px-2 py-1.5">Submitted</th>
                        <th class="border border-slate-300 px-2 py-1.5">Released</th>
                        <th class="border border-slate-300 px-2 py-1.5 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data->assistanceHistory as $request)
                        <tr>
                            <td class="border border-slate-300 px-2 py-1.5 font-mono text-[8pt]">{{ $request->transaction_number }}</td>
                            <td class="border border-slate-300 px-2 py-1.5">{{ $request->assistanceType?->name ?? '—' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 capitalize">{{ str_replace('_', ' ', (string) $request->status->value) }}</td>
                            <td class="border border-slate-300 px-2 py-1.5">{{ optional($request->created_at)->format('M j, Y') ?? '—' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5">{{ optional($request->released_at)->format('M j, Y') ?? '—' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 text-right">
                                {{ $request->amount_approved !== null ? '₱' . number_format((float) $request->amount_approved, 2) : '—' }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </section>

    {{-- ═══════════════════════════════════════════════════════════════ --}}
    {{-- ACTIVE COOLDOWNS                                                  --}}
    {{-- ═══════════════════════════════════════════════════════════════ --}}
    <section class="mb-4">
        @include('documents.action_center.partials._section_header', [
            'title' => 'V. Active Cooldowns',
            'meta' => $data->activeCooldowns->count() . ' active block(s)',
        ])

        @if($data->activeCooldowns->isEmpty())
            <p class="text-[9pt] italic text-slate-400">No active cooldowns — beneficiary is currently eligible to apply.</p>
        @else
            <table class="w-full border-collapse text-[9pt]">
                <thead>
                    <tr class="bg-slate-100 text-left text-[8pt] font-bold tracking-wider text-slate-700 uppercase">
                        <th class="border border-slate-300 px-2 py-1.5">Program</th>
                        <th class="border border-slate-300 px-2 py-1.5">Started</th>
                        <th class="border border-slate-300 px-2 py-1.5">Expires</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data->activeCooldowns as $cd)
                        <tr>
                            <td class="border border-slate-300 px-2 py-1.5">{{ $cd->assistanceType?->name ?? '—' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5">{{ optional($cd->cooldown_starts_at)->format('M j, Y') ?? '—' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 {{ $cd->cooldown_expires_at === null ? 'font-semibold text-rose-700' : '' }}">
                                {{ $cd->cooldown_expires_at?->format('M j, Y') ?? 'Permanent (one-time program)' }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </section>

    {{-- ═══════════════════════════════════════════════════════════════ --}}
    {{-- PRIVACY CONSENT FOOTER                                            --}}
    {{-- ═══════════════════════════════════════════════════════════════ --}}
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
                <p class="font-bold tracking-widest text-slate-700 uppercase">Consent on File</p>
                <p class="mt-1">
                    {{ $data->beneficiary->terms_consented_at?->format('M j, Y · g:i A') ?? 'Not recorded' }}
                </p>
                <p>Privacy Notice Version: {{ $data->beneficiary->terms_version ?? '—' }}</p>
            </div>
        </div>
    </footer>

</body>
</html>
