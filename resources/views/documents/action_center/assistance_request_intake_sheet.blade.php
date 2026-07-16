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

        .manual-back-page {
            page-break-before: always;
            min-height: 318mm;
            position: relative;
            color: #111827;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10.5pt;
            line-height: 1.28;
        }

        .manual-back-page h2 {
            margin: 0 0 10px;
            font-size: 13.5pt;
            font-weight: 800;
            letter-spacing: .01em;
            text-transform: uppercase;
        }

        .manual-section {
            margin-bottom: 12px;
        }

        .manual-back-title {
            padding-top: 38mm;
        }

        .manual-check-grid {
            display: grid;
            grid-template-columns: 1fr;
            row-gap: 9px;
            width: 80mm;
            margin-left: 52mm;
            font-size: 11.5pt;
            font-weight: 700;
        }

        .manual-check-item {
            display: flex;
            align-items: center;
            gap: 6px;
            min-height: 17px;
        }

        .manual-box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 12px;
            height: 12px;
            border: 1.8px solid #111827;
            font-size: 9pt;
            font-weight: 800;
            line-height: 1;
        }

        .manual-line {
            display: inline-block;
            min-height: 13px;
            border-bottom: 1.4px solid #111827;
            vertical-align: baseline;
        }

        .manual-evaluation {
            margin-top: 12px;
            font-size: 12pt;
            font-weight: 700;
            line-height: 2.05;
            text-align: justify;
        }

        .manual-evaluation .manual-line {
            padding: 0 4px 1px;
            font-weight: 500;
            text-align: center;
        }

        .manual-long-lines {
            margin-top: 5px;
        }

        .manual-long-lines .manual-line {
            display: block;
            width: 100%;
            height: 18px;
            margin-bottom: 8px;
        }

        .manual-signatures {
            position: absolute;
            right: 0;
            bottom: 32mm;
            left: 0;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 10.5pt;
            font-weight: 800;
        }

        .manual-signature-line {
            width: 72mm;
            border-top: 1.4px solid #111827;
            padding-top: 3px;
            text-align: center;
        }

        .manual-signature-line.worker {
            width: 62mm;
        }

        .manual-small-note {
            position: absolute;
            right: 0;
            bottom: 5mm;
            color: #6b7280;
            font-size: 7pt;
        }
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

        $human = function (?string $value): string {
            if ($value === null || trim($value) === '') {
                return '';
            }

            return ucwords(str_replace('_', ' ', trim($value)));
        };

        $contains = fn (?string $haystack, string $needle): bool => $haystack !== null
            && stripos($haystack, $needle) !== false;

        $ageAtFiling = $snapshot?->birth_date && $request->created_at
            ? (int) $snapshot->birth_date->diffInYears($request->created_at)
            : null;

        $assistanceName = $assistanceType?->name ?? '';
        $assistanceSlug = $assistanceType?->slug ?? '';
        $assistanceNeedle = trim($assistanceName . ' ' . $assistanceSlug);
        $problemPresented = [
            'sick' => false,
            'inadequate_finances' => false,
            'helpless_to_bury_dead' => $contains($assistanceNeedle, 'burial') || $contains($assistanceNeedle, 'funeral'),
            'seeking_medical_assistance' => $contains($assistanceNeedle, 'medical'),
        ];

        $checked = fn (bool $state): string => $state ? 'X' : '';
        $householdIncome = $snapshot?->household_total_income ?? $snapshot?->monthly_income;
        $sourceOfIncome = $snapshot?->occupation ?: '';
        $recipientName = trim(implode(' ', array_filter([
            $request->on_behalf_first_name,
            $request->on_behalf_middle_name,
            $request->on_behalf_last_name,
            $request->on_behalf_suffix,
        ])));
        $relationship = $request->relationship_to_beneficiary?->label();
        $forWhom = $relationship
            ? trim(strtolower($relationship) . ($recipientName ? ' ' . $recipientName : ''))
            : 'self';
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
        @include('documents.action_center.partials._section_header', ['title' => 'II. Beneficiary Details'])

        <div class="grid grid-cols-3 gap-3">
            @include('documents.action_center.partials._field', ['label' => 'Beneficiary No.', 'value' => $request->beneficiary?->beneficiary_number])
            @include('documents.action_center.partials._field', ['label' => 'Full Name', 'value' => $fullSnapshotName])
            @include('documents.action_center.partials._field', ['label' => 'Sex', 'value' => ucfirst((string) $snapshot?->sex)])
            @include('documents.action_center.partials._field', ['label' => 'Date of Birth', 'value' => $snapshot?->birth_date?->format('F j, Y')])
            @include('documents.action_center.partials._field', ['label' => 'Age at Filing', 'value' => $snapshot?->birth_date && $request->created_at ? (int) $snapshot->birth_date->diffInYears($request->created_at) . ' years old' : null])
            @include('documents.action_center.partials._field', ['label' => 'Civil Status', 'value' => ucfirst((string) $snapshot?->civil_status)])
            @include('documents.action_center.partials._field', ['label' => 'Religion', 'value' => $snapshot?->religion])
            @include('documents.action_center.partials._field', ['label' => 'Educational Attainment', 'value' => \App\Core\ActionCenter\Enums\EducationalAttainment::tryFrom($snapshot?->educational_attainment)?->label() ?? $snapshot?->educational_attainment])
            @include('documents.action_center.partials._field', ['label' => 'Occupation', 'value' => $snapshot?->occupation])
            @include('documents.action_center.partials._field', ['label' => 'Monthly Income', 'value' => $formatMoney($snapshot?->monthly_income)])
            @include('documents.action_center.partials._field', ['label' => 'Household Total Income', 'value' => $formatMoney($snapshot?->household_total_income)])
        </div>
    </section>

    <section class="mb-4">
        @include('documents.action_center.partials._section_header', ['title' => 'III. Address'])

        <div class="grid grid-cols-2 gap-3">
            @include('documents.action_center.partials._field', ['label' => 'Street', 'value' => $snapshot?->street])
            @include('documents.action_center.partials._field', ['label' => 'Barangay', 'value' => $snapshot?->barangay])
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

    <section class="manual-back-page">
        <div class="manual-section manual-back-title">
            <h2>III. Problem Presented:</h2>
            <div class="manual-check-grid">
                <div class="manual-check-item"><span class="manual-box">{{ $checked($problemPresented['sick']) }}</span> Sick</div>
                <div class="manual-check-item"><span class="manual-box">{{ $checked($problemPresented['inadequate_finances']) }}</span> Inadequate Finances</div>
                <div class="manual-check-item"><span class="manual-box">{{ $checked($problemPresented['helpless_to_bury_dead']) }}</span> Helpless to Bury Dead</div>
                <div class="manual-check-item"><span class="manual-box">{{ $checked($problemPresented['seeking_medical_assistance']) }}</span> Seeking Medical Assistance</div>
            </div>
        </div>

        <div class="manual-section" style="margin-top: 22mm;">
            <h2>IV. Findings and Evaluation:</h2>

            <div class="manual-evaluation">
                The client Mr./Mrs./Ms.
                <span class="manual-line" style="width: 66mm;">{{ $fullSnapshotName }}</span>,
                <span class="manual-line" style="width: 17mm;">{{ $ageAtFiling }}</span>
                years old; {{ $human($snapshot?->civil_status) ?: 'Single/Married/Widowed/Separated' }} and resident of Barangay
                <span class="manual-line" style="width: 48mm;">{{ $snapshot?->barangay }}</span>
                is seeking
                <span class="manual-line" style="width: 56mm;">{{ $assistanceName }}</span>
                for his/her
                <span class="manual-line" style="width: 52mm;">{{ $forWhom }}</span>
                based on the information gathered, the family's basic source of income only derives from
                <span class="manual-line" style="width: 72mm;">{{ $sourceOfIncome }}</span>
                with a monthly income of
                <span class="manual-line" style="width: 35mm;">{{ $householdIncome !== null ? 'PHP ' . number_format((float) $householdIncome, 2) : '' }}</span>
                which is very insufficient for the family's daily supply of food, medicines and other expenses
                which are necessary for one family to survive. In view of this the undersigned strongly recommended
                <span class="manual-line" style="width: 98mm;"></span>
            </div>

            <div class="manual-long-lines">
                <span class="manual-line"></span>
                <span class="manual-line"></span>
                <span class="manual-line"></span>
            </div>
        </div>

        <div class="manual-signatures">
            <div class="manual-signature-line">Signature/Thumb mark of Client</div>
            <div class="manual-signature-line worker">Signature of Worker</div>
        </div>

        <div class="manual-small-note">Generated {{ $data->generatedAt->format('F j, Y g:i A') }} by {{ $data->generatedByUserName }}</div>
    </section>
</body>
</html>
