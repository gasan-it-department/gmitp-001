<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Assistance Request Intake Sheet</title>
    <style>
        @page { size: legal portrait; margin: 10mm 12mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #111827; font-family: Arial, Helvetica, sans-serif; font-size: 8.5pt; line-height: 1.3; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .page-one { page-break-after: always; font-size: 9pt; }
        .document-header { border-bottom: 1.5pt solid #111827; margin-bottom: 4mm; padding-bottom: 2.5mm; }
        .header-table td { vertical-align: middle; }
        .logo-cell { width: 24mm; text-align: center; }
        .logo { width: 19mm; height: 19mm; object-fit: contain; }
        .heading-cell { text-align: center; }
        .heading-kicker { font-size: 8pt; font-weight: bold; text-transform: uppercase; }
        .heading-office { margin-top: 1mm; font-size: 9pt; font-weight: bold; text-transform: uppercase; }
        .heading-title { margin-top: 1.5mm; font-size: 15pt; font-weight: bold; text-transform: uppercase; }
        .meta-cell { width: 48mm; text-align: right; vertical-align: top !important; font-size: 8pt; }
        .meta-label, .field-label { color: #475569; font-size: 7.2pt; font-weight: bold; text-transform: uppercase; }
        .transaction { margin-top: 1mm; font-family: DejaVu Sans Mono, monospace; font-size: 9.5pt; font-weight: bold; }
        .section { margin-bottom: 3.2mm; page-break-inside: avoid; }
        .section-title { border: 0.8pt solid #94a3b8; background: #e2e8f0; padding: 1.4mm 2mm; font-size: 8.6pt; font-weight: bold; text-transform: uppercase; }
        .field-table td { border-right: 0.6pt solid #cbd5e1; border-bottom: 0.6pt solid #cbd5e1; padding: 1.4mm 2mm; vertical-align: top; }
        .field-table td:first-child { border-left: 0.6pt solid #cbd5e1; }
        .field-value { margin-top: 0.5mm; min-height: 3.5mm; font-size: 8.8pt; font-weight: 600; word-wrap: break-word; }
        .statement-box { border: 0.6pt solid #cbd5e1; padding: 1.8mm 2mm; }
        .statement-value { margin-top: 0.7mm; min-height: 4mm; white-space: pre-wrap; }
        .household-table th, .household-table td { border: 0.6pt solid #94a3b8; padding: 1.1mm 1.3mm; vertical-align: middle; word-wrap: break-word; }
        .household-table th { background: #e2e8f0; font-size: 6.9pt; text-align: left; text-transform: uppercase; }
        .household-table td { font-size: 7.8pt; }
        .number-cell { text-align: right; }
        .center-cell { text-align: center; }
        .section-note { margin: 1mm 0 2mm; color: #475569; font-size: 6.8pt; }
        .privacy-table { margin-top: 4mm; border-top: 0.6pt solid #94a3b8; }
        .privacy-table td { width: 50%; padding-top: 1.5mm; color: #475569; font-size: 7pt; vertical-align: top; }
        .privacy-table td:last-child { text-align: right; }
        .assessment-page { font-family: "Times New Roman", Times, serif; font-size: 11pt; line-height: 1.65; }
        .assessment-section { margin-top: 24mm; }
        .assessment-section + .assessment-section { margin-top: 18mm; }
        .assessment-heading { margin: 0 0 7mm; font-size: 13pt; font-weight: bold; text-transform: uppercase; }
        .problem-table { width: 120mm; margin-left: 42mm; }
        .problem-table td { padding: 1.5mm 0; font-size: 11.5pt; font-weight: bold; vertical-align: middle; }
        .problem-box-cell { width: 11mm; }
        .problem-box { display: inline-block; width: 6mm; height: 6mm; border: 1.2pt solid #111827; font-family: Arial, Helvetica, sans-serif; font-size: 10pt; font-weight: bold; line-height: 5.2mm; text-align: center; }
        .findings { font-size: 11.3pt; font-weight: bold; line-height: 2.05; text-align: justify; }
        .writing-value { display: inline; border-bottom: 0.8pt solid #111827; padding: 0 1.5mm 0.5mm; font-weight: normal; text-align: center; }
        .recommendation-lines { position: relative; margin-top: 1.5mm; min-height: 38mm; padding: 0 2mm; font-size: 11pt; font-weight: normal; line-height: 9mm; word-wrap: break-word; }
        .recommendation-text { position: relative; z-index: 2; }
        .recommendation-rule { position: absolute; right: 0; left: 0; height: 9mm; border-bottom: 0.8pt solid #111827; }
        .recommendation-rule.one { top: 0; }
        .recommendation-rule.two { top: 9mm; }
        .recommendation-rule.three { top: 18mm; }
        .recommendation-rule.four { top: 27mm; }
        .signature-table { margin-top: 26mm; }
        .signature-table td { width: 50%; padding: 0 9mm; vertical-align: bottom; text-align: center; }
        .signature-line { border-top: 0.8pt solid #111827; padding-top: 1mm; font-size: 9.5pt; font-weight: bold; }
    </style>
</head>
<body>
    @php
        $request = $data->request;
        $snapshot = $request->snapshot;
        $assistanceType = $request->assistanceType;
        $fullSnapshotName = trim(implode(' ', array_filter([$snapshot?->first_name, $snapshot?->middle_name, $snapshot?->last_name, $snapshot?->suffix])));
        $onBehalfName = trim(implode(' ', array_filter([$request->on_behalf_first_name, $request->on_behalf_middle_name, $request->on_behalf_last_name, $request->on_behalf_suffix])));
        $formatMoney = fn ($value): string => $value === null ? '---' : 'PHP '.number_format((float) $value, 2);
        $human = fn (?string $value): string => $value ? ucwords(str_replace('_', ' ', $value)) : '';
        $ageAtFiling = $snapshot?->birth_date && $request->created_at ? (int) $snapshot->birth_date->diffInYears($request->created_at) : null;
        $relationship = $request->relationship_to_beneficiary?->label();
        $filingSubject = $relationship ? trim(strtolower($relationship).($onBehalfName !== '' ? ' '.$onBehalfName : '')) : 'self';
        $education = \App\Core\ActionCenter\Enums\EducationalAttainment::tryFrom((string) $snapshot?->educational_attainment)?->label() ?? $human($snapshot?->educational_attainment);
        $selectedProblems = array_fill_keys($data->problemPresented, true);
        $monthlyIncome = 'PHP '.number_format($data->monthlyIncome, 2);
        $compositionMembers = $data->householdMembers
            ->reject(fn ($member) => $member->beneficiaryId !== null && $member->beneficiaryId === (string) $request->beneficiary_id)
            ->values();
        $totalMonthlyHouseholdIncome = $data->monthlyIncome
            + (float) $compositionMembers->sum(fn ($member) => (float) $member->monthlyIncome);
    @endphp

    <div class="page-one">
        <header class="document-header">
            <table class="header-table">
                <tr>
                    <td class="logo-cell">
                        @if($data->municipalityLogoDataUri)
                            <img class="logo" src="{{ $data->municipalityLogoDataUri }}" alt="Municipal logo">
                        @endif
                    </td>
                    <td class="heading-cell">
                        <div class="heading-kicker">Republic of the Philippines</div>
                        <div class="heading-kicker">Municipality of {{ $data->municipalityName ?? '---' }}</div>
                        <div class="heading-office">Municipal Social Welfare and Development Office</div>
                        <div class="heading-title">Assistance Request Intake Sheet</div>
                    </td>
                    <td class="meta-cell">
                        <div class="meta-label">Transaction No.</div>
                        <div class="transaction">{{ $request->transaction_number }}</div>
                        <div class="meta-label" style="margin-top: 2mm;">Generated</div>
                        <div>{{ $data->generatedAt->format('M j, Y g:i A') }}</div>
                    </td>
                </tr>
            </table>
        </header>

        <section class="section">
            <div class="section-title">I. Request Summary</div>
            <table class="field-table">
                <tr>
                    <td><div class="field-label">Assistance Type</div><div class="field-value">{{ $assistanceType?->name ?? '---' }}</div></td>
                    <td><div class="field-label">Status</div><div class="field-value">{{ $request->status?->label() ?? $human((string) $request->status) }}</div></td>
                    <td><div class="field-label">Submitted At</div><div class="field-value">{{ $request->created_at?->format('F j, Y - g:i A') ?? '---' }}</div></td>
                    <td><div class="field-label">Approved Amount</div><div class="field-value">{{ $formatMoney($request->amount_approved) }}</div></td>
                </tr>
            </table>
            <div class="statement-box"><div class="field-label">Reason for Request</div><div class="statement-value">{{ $request->description ?: '---' }}</div></div>
        </section>

        <section class="section">
            <div class="section-title">II. Beneficiary Details</div>
            <table class="field-table">
                <tr>
                    <td colspan="2"><div class="field-label">Full Name</div><div class="field-value">{{ $fullSnapshotName ?: '---' }}</div></td>
                    <td><div class="field-label">Beneficiary No.</div><div class="field-value">{{ $request->beneficiary?->beneficiary_number ?? '---' }}</div></td>
                    <td><div class="field-label">Sex</div><div class="field-value">{{ $human($snapshot?->sex) ?: '---' }}</div></td>
                </tr>
                <tr>
                    <td><div class="field-label">Birth Date</div><div class="field-value">{{ $snapshot?->birth_date?->format('F j, Y') ?? '---' }}</div></td>
                    <td><div class="field-label">Age at Filing</div><div class="field-value">{{ $ageAtFiling === null ? '---' : $ageAtFiling.' years old' }}</div></td>
                    <td><div class="field-label">Civil Status</div><div class="field-value">{{ $human($snapshot?->civil_status) ?: '---' }}</div></td>
                    <td><div class="field-label">Religion</div><div class="field-value">{{ $snapshot?->religion ?: '---' }}</div></td>
                </tr>
                <tr>
                    <td colspan="2"><div class="field-label">Educational Attainment</div><div class="field-value">{{ $education ?: '---' }}</div></td>
                    <td><div class="field-label">Occupation</div><div class="field-value">{{ $data->sourceOfIncome }}</div></td>
                    <td><div class="field-label">Monthly Income</div><div class="field-value">{{ $formatMoney($data->monthlyIncome) }}</div></td>
                </tr>
            </table>
        </section>

        <section class="section">
            <div class="section-title">III. Address</div>
            <table class="field-table">
                <tr>
                    <td><div class="field-label">Street / Purok</div><div class="field-value">{{ $snapshot?->street ?: '---' }}</div></td>
                    <td><div class="field-label">Barangay</div><div class="field-value">{{ $snapshot?->barangay ?: '---' }}</div></td>
                    <td><div class="field-label">Municipality</div><div class="field-value">{{ $data->municipalityName ?? '---' }}</div></td>
                </tr>
            </table>
        </section>

        <section class="section">
            <div class="section-title">IV. Filing Subject</div>
            @if($relationship)
                <table class="field-table">
                    <tr>
                        <td style="width: 30%;"><div class="field-label">Relationship</div><div class="field-value">{{ $relationship }}</div></td>
                        <td style="width: 70%;"><div class="field-label">Subject Name</div><div class="field-value">{{ $onBehalfName ?: '---' }}</div></td>
                    </tr>
                </table>
            @else
                <div class="statement-box"><div class="field-value">Filed for self.</div></div>
            @endif
        </section>

        <section class="section">
            <div class="section-title">
                V. {{ $data->usesCurrentHouseholdFallback ? 'Current Household Composition (Legacy Request)' : 'Household Composition at Filing' }}
                - {{ $compositionMembers->count() }} {{ $data->usesCurrentHouseholdFallback ? 'Active Member(s)' : 'Member(s)' }}
            </div>
            @if($data->usesCurrentHouseholdFallback)
                <div class="section-note">Request-time household snapshot unavailable; this section reflects the current active household roster.</div>
            @elseif($data->householdCompositionCapturedAt)
                <div class="section-note">Household roster captured {{ $data->householdCompositionCapturedAt->format('F j, Y - g:i A') }}.</div>
            @endif
            <table class="household-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">Name</th><th style="width: 13%;">Relationship</th><th style="width: 7%;">Age</th><th style="width: 8%;">Sex</th><th style="width: 18%;">Education</th><th style="width: 15%;">Occupation</th><th style="width: 14%; text-align: right;">Income</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($compositionMembers as $member)
                        @php
                            $memberEducation = \App\Core\ActionCenter\Enums\EducationalAttainment::tryFrom((string) $member->educationalAttainment)?->label()
                                ?? ($human($member->educationalAttainment) ?: '---');
                        @endphp
                        <tr>
                            <td>{{ $member->fullName ?: '---' }}</td><td>{{ $human($member->relationship) ?: '---' }}</td><td class="center-cell">{{ $member->ageAtFiling ?? '---' }}</td><td>{{ $human($member->sex) ?: '---' }}</td><td>{{ $memberEducation }}</td><td>{{ $member->occupation ?: '---' }}</td><td class="number-cell">{{ $member->monthlyIncome === null ? '---' : number_format($member->monthlyIncome, 2) }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="7" class="center-cell">No other active household members on record.</td></tr>
                    @endforelse
                </tbody>
            </table>
            <table class="field-table">
                <tr>
                    <td><div class="field-label">Total Monthly Household Income</div><div class="field-value">{{ $formatMoney($totalMonthlyHouseholdIncome) }}</div></td>
                </tr>
            </table>
        </section>

        <table class="privacy-table">
            <tr>
                <td><strong>Data Privacy Notice</strong><br>This document contains personal information protected under Republic Act 10173. Unauthorized disclosure is prohibited.</td>
                <td><strong>Request Consent</strong><br>{{ $request->privacy_consented_at?->format('M j, Y - g:i A') ?? 'Not recorded' }}<br>Notice Version: {{ $request->privacy_notice_version ?? '---' }}</td>
            </tr>
        </table>
    </div>

    <div class="assessment-page">
        <section class="assessment-section">
            <h2 class="assessment-heading">III. Problem Presented:</h2>
            <table class="problem-table">
                @foreach(\App\Core\ActionCenter\Enums\AssistanceIntakeProblem::cases() as $problem)
                    <tr><td class="problem-box-cell"><span class="problem-box">{{ isset($selectedProblems[$problem->value]) ? 'X' : '' }}</span></td><td>{{ $problem->label() }}</td></tr>
                @endforeach
            </table>
        </section>

        <section class="assessment-section">
            <h2 class="assessment-heading">IV. Findings and Evaluation:</h2>
            <div class="findings">
                The client Mr./Mrs./Ms. <span class="writing-value">{{ $fullSnapshotName }}</span>,
                <span class="writing-value">{{ $ageAtFiling }}</span> years old;
                {{ $human($snapshot?->civil_status) ?: 'Single/Married/Widowed/Separated' }} and resident of Barangay
                <span class="writing-value">{{ $snapshot?->barangay }}</span> is seeking
                <span class="writing-value">{{ $assistanceType?->name }}</span> for his/her
                <span class="writing-value">{{ $filingSubject }}</span> based on the information gathered, the family's basic source of income only derives from
                <span class="writing-value">{{ $data->sourceOfIncome }}</span> with a monthly income of
                <span class="writing-value">{{ $monthlyIncome }}</span> which is very insufficient for the family's daily supply of food, medicines and other expenses which are necessary for one family to survive. In view of this the undersigned strongly recommended:
            </div>
            <div class="recommendation-lines">
                <div class="recommendation-rule one"></div>
                <div class="recommendation-rule two"></div>
                <div class="recommendation-rule three"></div>
                <div class="recommendation-rule four"></div>
                <div class="recommendation-text">{{ $data->recommendation }}</div>
            </div>
        </section>

        <table class="signature-table">
            <tr><td><div class="signature-line">Signature/Thumb mark of Client</div></td><td><div class="signature-line">Signature of Worker</div></td></tr>
        </table>
    </div>
</body>
</html>
