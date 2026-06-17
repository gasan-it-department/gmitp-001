<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Beneficiary Intake Sheet - {{ $data->beneficiary->full_name }}</title>
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
        $beneficiary = $data->beneficiary;
        $household = $beneficiary->household;
        $verifiedMembers = $data->householdMembers->filter(fn($member) => $member->relationship === 'head' || $member->is_verified_dependent);
        $unverifiedMembers = $data->householdMembers->filter(fn($member) => $member->relationship !== 'head' && ! $member->is_verified_dependent);
        $verifiedIncome = (float) $verifiedMembers->sum(fn($member) => (float) $member->monthly_income);
        $personName = fn($person) => trim(implode(' ', array_filter([
            $person?->first_name,
            $person?->last_name,
        ]))) ?: '---';
        $intakeStatus = $beneficiary->intakeStatus();
    @endphp

    <header class="mb-4 border-b-2 border-slate-800 pb-3">
        <div class="flex items-start justify-between">
            <div>
                <p class="text-[8pt] font-bold tracking-widest text-slate-500 uppercase">Republic of the Philippines</p>
                <p class="text-[8pt] font-bold tracking-widest text-slate-500 uppercase">Municipality of {{ $data->municipalityName ?? '---' }}</p>
                <p class="text-[8pt] font-bold tracking-widest text-slate-500 uppercase">Municipal Social Welfare and Development Office</p>
                <h1 class="mt-2 text-[16pt] font-bold text-slate-900">Beneficiary Intake Sheet</h1>
                <p class="mt-1 text-[9pt] text-slate-600">Claimant identity and household verification record</p>
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
            'title' => 'I. Claimant Identity',
            'meta' => strtoupper($intakeStatus),
        ])

        <div class="grid grid-cols-3 gap-3">
            @include('documents.action_center.partials._field', ['label' => 'Beneficiary No.', 'value' => $beneficiary->beneficiary_number])
            @include('documents.action_center.partials._field', ['label' => 'Full Name', 'value' => $beneficiary->full_name])
            @include('documents.action_center.partials._field', ['label' => 'Portal Account', 'value' => $beneficiary->user_id ? ($beneficiary->user?->email ?? 'Linked') : 'Walk-in / Not linked'])
            @include('documents.action_center.partials._field', ['label' => 'Sex', 'value' => ucfirst((string) $beneficiary->sex)])
            @include('documents.action_center.partials._field', ['label' => 'Date of Birth', 'value' => $beneficiary->birth_date?->format('F j, Y')])
            @include('documents.action_center.partials._field', ['label' => 'Age', 'value' => $beneficiary->birth_date ? $beneficiary->birth_date->age . ' years old' : null])
            @include('documents.action_center.partials._field', ['label' => 'Civil Status', 'value' => $beneficiary->civil_status?->label()])
            @include('documents.action_center.partials._field', ['label' => 'Religion', 'value' => $beneficiary->religion?->name])
            @include('documents.action_center.partials._field', ['label' => 'Educational Attainment', 'value' => $beneficiary->educational_attainment?->label()])
            @include('documents.action_center.partials._field', ['label' => 'Occupation', 'value' => $beneficiary->occupation])
            @include('documents.action_center.partials._field', ['label' => 'Monthly Income', 'value' => 'PHP ' . number_format((float) $beneficiary->monthly_income, 2)])
        </div>
    </section>

    <section class="mb-4">
        @include('documents.action_center.partials._section_header', ['title' => 'II. Verification Evidence'])

        <div class="grid grid-cols-3 gap-3">
            @include('documents.action_center.partials._field', ['label' => 'Identity Status', 'value' => ucfirst($intakeStatus)])
            @include('documents.action_center.partials._field', ['label' => 'Verified At', 'value' => $beneficiary->identity_verified_at?->format('F j, Y - g:i A')])
            @include('documents.action_center.partials._field', ['label' => 'Verified By', 'value' => $beneficiary->identityVerifier ? $personName($beneficiary->identityVerifier) : null])
            @include('documents.action_center.partials._field', ['label' => 'ID Front', 'value' => $data->hasIdentityIdFront ? 'On file' : 'Missing'])
            @include('documents.action_center.partials._field', ['label' => 'ID Back', 'value' => $data->hasIdentityIdBack ? 'On file' : 'Not provided'])
            @include('documents.action_center.partials._field', ['label' => 'Rejected At', 'value' => $beneficiary->intake_rejected_at?->format('F j, Y - g:i A')])
        </div>

        @if($beneficiary->intake_rejected_at)
            <div class="mt-3 rounded border border-rose-200 bg-rose-50 p-2 text-[9pt] text-rose-900">
                <p class="font-bold">Intake rejection reason</p>
                <p class="mt-1">{{ $beneficiary->intake_rejection_reason ?? 'No reason recorded.' }}</p>
                <p class="mt-1 text-[8pt]">Rejected by: {{ $beneficiary->intakeRejector ? $personName($beneficiary->intakeRejector) : '---' }}</p>
            </div>
        @endif
    </section>

    <section class="mb-4">
        @include('documents.action_center.partials._section_header', ['title' => 'III. Current Address'])

        <div class="grid grid-cols-2 gap-3">
            @include('documents.action_center.partials._field', ['label' => 'Street', 'value' => $household?->street])
            @include('documents.action_center.partials._field', ['label' => 'Barangay', 'value' => $household?->barangay])
            @include('documents.action_center.partials._field', ['label' => 'Municipality', 'value' => $data->municipalityName])
            @include('documents.action_center.partials._field', ['label' => 'Household Code', 'value' => $household?->household_code])
        </div>
    </section>

    <section class="mb-4">
        @include('documents.action_center.partials._section_header', [
            'title' => 'IV. Household Composition',
            'meta' => $data->householdMembers->count() . ' active member(s) - Total Monthly Income: PHP ' . number_format($data->householdTotalMonthlyIncome, 2),
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
                            <td class="border border-slate-300 px-2 py-1.5">{{ $memberName }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 capitalize">{{ str_replace('_', ' ', (string) $member->relationship) }}</td>
                            <td class="border border-slate-300 px-2 py-1.5">{{ $member->birth_date?->age ?? '---' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 capitalize">{{ $member->sex ?? '---' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5">{{ $member->occupation ?? '---' }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 text-right">PHP {{ number_format((float) $member->monthly_income, 2) }}</td>
                            <td class="border border-slate-300 px-2 py-1.5 text-center text-[8pt] font-bold {{ $isVerified ? 'text-emerald-700' : 'text-rose-600' }}">
                                {{ $isHead ? 'HEAD IDENTITY' : ($isVerified ? 'VERIFIED' : 'PENDING') }}
                            </td>
                        </tr>
                    @endforeach
                    <tr class="bg-slate-50 font-bold">
                        <td class="border border-slate-300 px-2 py-1.5" colspan="5">Verified / official household income</td>
                        <td class="border border-slate-300 px-2 py-1.5 text-right">PHP {{ number_format($verifiedIncome, 2) }}</td>
                        <td class="border border-slate-300 px-2 py-1.5"></td>
                    </tr>
                </tbody>
            </table>

            @if($unverifiedMembers->isNotEmpty())
                <p class="mt-2 text-[8pt] italic text-rose-600">
                    {{ $unverifiedMembers->count() }} dependent(s) remain pending MSWD verification and should not be counted as official dependents until reviewed.
                </p>
            @endif
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
                <p class="font-bold tracking-widest text-slate-700 uppercase">Consent on File</p>
                <p class="mt-1">{{ $beneficiary->terms_consented_at?->format('M j, Y - g:i A') ?? 'Not recorded' }}</p>
                <p>Privacy Notice Version: {{ $beneficiary->terms_version ?? '---' }}</p>
            </div>
        </div>
    </footer>
</body>
</html>
