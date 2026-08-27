<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Disbursement Voucher</title>
    <style>
        @page {
            margin: 7mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #000;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9.5pt;
            line-height: 1.18;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td,
        th {
            vertical-align: middle;
        }

        .sheet {
            width: 100%;
            border: 1.6pt solid #000;
        }

        /*
         * DOMPDF renders adjacent table borders independently. Each section
         * therefore owns only its internal and bottom rules; the sheet owns
         * the continuous outside frame.
         */
        .form-grid>tbody>tr>td,
        .form-grid>tbody>tr>th {
            border-right: 0.75pt solid #000;
            border-bottom: 0.75pt solid #000;
        }

        .form-grid>tbody>tr>td:last-child,
        .form-grid>tbody>tr>th:last-child {
            border-right: 0;
        }

        .major-bottom>tbody>tr:last-child>td,
        .major-bottom>tbody>tr:last-child>th {
            border-bottom: 1.6pt solid #000;
        }

        .header-cell {
            height: 26mm;
            padding: 2mm 4mm;
            border-right: 0 !important;
            border-bottom: 1.6pt solid #000 !important;
        }

        .logo-cell {
            width: 28%;
            text-align: center;
        }

        .logo {
            width: 21mm;
            height: 21mm;
            object-fit: contain;
        }

        .seal-placeholder {
            display: inline-block;
            width: 19mm;
            height: 19mm;
            border: 0.8pt solid #777;
            border-radius: 50%;
            color: #777;
            font-size: 7pt;
            line-height: 19mm;
            text-align: center;
        }

        .municipality-cell {
            width: 49%;
            text-align: center;
        }

        .republic {
            font-size: 11pt;
        }

        .municipality {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        .province {
            font-size: 11pt;
        }

        .arrow {
            display: inline-block;
            width: 30px;
            height: 2px;
            background: #000;
            position: relative;
            margin-left: 8px;
            vertical-align: middle;
        }

        .arrow::after {
            content: "";
            position: absolute;
            right: 0;
            top: -4px;
            width: 8px;
            height: 8px;
            border-top: 2px solid #000;
            border-right: 2px solid #000;
            transform: rotate(45deg);
        }

        .annex-cell {
            width: 23%;
            text-align: right;
            vertical-align: top;
            font-weight: bold;
            font-size: 9pt;
            padding-top: 4mm;
            padding-right: 4mm;
        }

        .title-row td {
            height: 9mm;
            padding: 1mm 2mm;
            border-bottom: 1.6pt solid #000 !important;
        }

        .title {
            text-align: center;
            font-size: 17pt;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .voucher-number {
            width: 31%;
            font-size: 11pt;
        }

        .mode-table td {
            height: 11mm;
        }

        .mode-label {
            width: 12%;
            padding: 1mm 2mm;
            font-size: 10pt;
            border-right: 0.75pt solid #000 !important;
        }

        .mode-choice {
            width: 29.33%;
            padding-left: 8mm;
            font-size: 11pt;
            border-right: 0 !important;
        }

        .checkbox {
            display: inline-block;
            width: 7mm;
            height: 7mm;
            margin-right: 3mm;
            border: 1.2pt solid #000;
            text-align: center;
            font-size: 12pt;
            font-weight: bold;
            line-height: 6.3mm;
            vertical-align: middle;
        }

        .identity-table td {
            height: 9mm;
        }

        .identity-label {
            width: 9%;
            padding: 1mm 1.5mm;
        }

        .payee-value {
            width: 35%;
            padding: 1mm 2mm;
            font-size: 12.5pt;
            font-weight: bold;
        }

        .tin-cell {
            width: 25%;
            padding: 1mm 2mm;
            vertical-align: top;
        }

        .obr-cell {
            width: 31%;
            padding: 1mm 2mm;
            vertical-align: top;
        }

        .small-label {
            display: block;
            font-size: 9pt;
            margin-bottom: 1mm;
        }

        .address-value {
            padding: 1mm 2mm;
            font-size: 10.5pt;
            font-weight: bold;
        }

        .responsibility-wrap {
            padding: 0;
        }

        .responsibility-title {
            height: 5mm;
            text-align: center;
            border-bottom: 0.75pt solid #000;
        }

        .responsibility-sub {
            width: 100%;
            table-layout: fixed;
        }

        .responsibility-sub td {
            height: 8.5mm;
            padding: 1mm 2mm;
            vertical-align: top;
            border: 0;
        }

        .responsibility-office {
            width: 62%;
            border-right: 0.75pt solid #000 !important;
        }

        .section-heading {
            height: 7mm;
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            border-bottom: 1.6pt solid #000 !important;
        }

        .section-heading-table {
            table-layout: fixed;
        }

        .explanation-table {
            table-layout: fixed;
        }

        .explanation-cell {
            width: 72%;
            height: 75mm;
            padding: 7mm 8mm;
            vertical-align: top;
            font-size: 11pt;
            line-height: 1.45;
            border-right: 0.75pt solid #000;
        }

        .amount-cell {
            width: 28%;
            height: 75mm;
            padding: 9mm 4mm;
            vertical-align: top;
            font-size: 11pt;
        }

        .amount-table td {
            border: 0 !important;
        }

        .currency {
            width: 28%;
        }

        .number {
            text-align: right;
            white-space: nowrap;
        }

        .amount-due {
            width: 100%;
            border-bottom: 3pt double #000;
        }

        .amount-due td {
            height: 8mm;
            padding: 1mm 2mm;
            font-size: 11pt;
            font-weight: bold;
            border-right: 0;
            border-bottom: 0 !important;
        }

        .amount-due-label {
            text-align: right;
            padding-right: 5mm;
            border-right: 0.75pt solid #000 !important;
        }

        .arrow {
            font-size: 20pt;
            vertical-align: middle;
            padding-right: 4mm;
            font-weight: normal;
        }

        .cert-pair,
        .lower-pair {
            table-layout: fixed;
        }

        .cert-pair {
            border-bottom: 1.6pt solid #000;
        }

        .cert-pair>tbody>tr>td,
        .lower-pair>tbody>tr>td {
            width: 50%;
            padding: 0;
            vertical-align: top;
        }

        .left-half {
            border-right: 1.6pt solid #000 !important;
        }

        .box-title {
            height: 7mm;
            padding: 1.5mm 2mm;
            font-size: 11pt;
            font-weight: bold;
        }

        .box-letter {
            display: inline-block;
            width: 7mm;
            height: 7mm;
            margin-right: 1.5mm;
            border: 0.9pt solid #000;
            text-align: center;
            line-height: 6.3mm;
        }

        .cert-content {
            height: 18mm;
            padding: 2mm 5mm;
            vertical-align: top;
        }

        .cert-line {
            margin-bottom: 3.5mm;
            font-size: 8.5pt;
        }

        .mini-checkbox {
            display: inline-block;
            width: 7mm;
            height: 6mm;
            margin-right: 2mm;
            border: 1pt solid #000;
            vertical-align: middle;
        }

        .centered-cert {
            text-align: center;
            padding-top: 5mm;
            font-size: 9.5pt;
        }

        .signature-table td {
            height: 7mm;
            padding: 0.7mm 1.3mm;
            border-top: 0.75pt solid #000;
            border-right: 0.75pt solid #000;
        }

        .signature-table td:last-child {
            border-right: 0;
        }

        .signature-table .position-row .row-label {
            border-right: 0;
        }

        .lower-signature-line {
            table-layout: fixed;
        }

        .lower-signature-line td {
            padding: 0.7mm 1.3mm;
            vertical-align: middle;
            border-top: 0.75pt solid #000;
            border-right: 0.75pt solid #000;
        }

        .lower-signature-line td:last-child {
            border-right: 0;
        }

        .lower-signature-line.signature-row td {
            height: 7mm;
        }

        .lower-signature-line.printed-name-row td {
            height: 16mm;
        }

        .lower-signature-line.position-row td {
            height: 13mm;
        }

        .row-label {
            width: 17%;
            font-size: 8pt;
        }

        .signature-value {
            text-align: center;
            font-size: 9.5pt;
            font-weight: bold;
        }

        .date-label {
            width: 9%;
            font-size: 8pt;
        }

        .date-space {
            width: 18%;
        }

        .position-value {
            text-align: center;
            font-size: 8.5pt;
            font-style: italic;
        }

        .lower-box {
            height: 43mm;
        }

        .received-row {
            width: 100%;
            table-layout: fixed;
        }

        .received-row td {
            padding: 0.7mm 1.3mm;
            vertical-align: middle;
            border-top: 0.75pt solid #000;
            border-right: 0.75pt solid #000;
        }

        .received-row td:last-child {
            border-right: 0;
        }

        .received-top-row td {
            height: 7mm;
            vertical-align: top;
            border-top: 1;
        }

        .received-box .box-title {
            border-bottom: 0.75pt solid #000;
        }

        .received-signature-row td {
            height: 7mm;
        }

        .received-name-row td {
            height: 10mm;
        }

        .received-documents-row td {
            height: 10.5mm;
            vertical-align: top;
        }

        .received-label {
            display: block;
            font-size: 8pt;
            margin-bottom: 0.5mm;
        }

        .received-name {
            text-align: center;
            font-size: 9.5pt;
            font-weight: bold;
        }

        .nowrap {
            white-space: nowrap;
        }
    </style>
</head>

<body>
    <div class="sheet">
        <table class="form-grid major-bottom">
            <tr>
                <td class="header-cell logo-cell">
                    @if ($data->municipalityLogoDataUri)
                        <img class="logo" src="{{ $data->municipalityLogoDataUri }}" alt="Municipal seal">
                    @else
                        <span class="seal-placeholder">SEAL</span>
                    @endif
                </td>
                <td class="header-cell municipality-cell">
                    <div class="republic">Republic of the Philippines</div>
                    <div class="municipality">Municipality of {{ $data->municipalityName }}</div>
                    <div class="province">Marinduque</div>
                </td>
                <td class="header-cell annex-cell">Annex A</td>
            </tr>
        </table>

        <table class="form-grid title-row major-bottom">
            <tr>
                <td class="title">DISBURSEMENT VOUCHER</td>
                <td class="voucher-number">No. {{ $data->disbursementVoucherNumber ?? '' }}</td>
            </tr>
        </table>

        <table class="form-grid mode-table">
            <tr>
                <td class="mode-label">Mode of<br>Payment</td>
                @foreach (['check' => 'Check', 'cash' => 'Cash', 'others' => 'Others'] as $mode => $label)
                    <td class="mode-choice">
                        <span class="checkbox">{{ $data->modeOfPayment === $mode ? 'X' : '' }}</span>{{ $label }}
                    </td>
                @endforeach
            </tr>
        </table>

        <table class="form-grid identity-table major-bottom">
            <tr>
                <td class="identity-label">Payee</td>
                <td class="payee-value">{{ $data->payee }}</td>
                <td class="tin-cell">
                    <span class="small-label">TIN/Employee No.</span>
                    {{ $data->tinEmployeeNumber ?? '' }}
                </td>
                <td class="obr-cell">
                    <span class="small-label">Obligation Request No.</span>
                    <strong>No. {{ $data->obligationRequestNumber }}</strong>
                </td>
            </tr>
            <tr>
                <td class="identity-label">Address</td>
                <td class="address-value">{{ $data->address }}</td>
                <td class="responsibility-wrap" colspan="2">
                    <div class="responsibility-title">Responsibility Center</div>
                    <table class="responsibility-sub">
                        <tr>
                            <td class="responsibility-office">
                                <span class="small-label">Office/Unit/Project</span>
                                <strong>{{ $data->responsibilityCenterOffice ?? '' }}</strong>
                            </td>
                            <td>
                                <span class="small-label">Code</span>
                                <strong>{{ $data->responsibilityCenterCode }}</strong>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <table class="form-grid major-bottom section-heading-table">
            <tr>
                <td class="section-heading" style="width: 72%;">EXPLANATION</td>
                <td class="section-heading" style="width: 28%;">AMOUNT</td>
            </tr>
        </table>

        <table class="form-grid explanation-table">
            <tr>
                <td class="explanation-cell">{!! nl2br(e($data->explanation)) !!}</td>
                <td class="amount-cell">
                    <table class="amount-table">
                        <tr>
                            <td class="currency">Php</td>
                            <td class="number">{{ number_format($data->approvedAmount, 2) }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <table class="amount-due">
            <tr>
                <td class="amount-due-label" style="width: 72%;">
                    Amount Due <span class="arrow"></span>
                </td>
                <td style="width: 8%;">Php</td>
                <td class="number" style="width: 20%;">{{ number_format($data->approvedAmount, 2) }}</td>
            </tr>
        </table>

        <table class="cert-pair">
            <tr>
                <td class="left-half">
                    <div class="box-title"><span class="box-letter">A</span>Certified:</div>
                    <div class="cert-content">
                        <div class="cert-line"><span class="mini-checkbox"></span>Allotment obligated for the purpose as
                            indicated above</div>
                        <div class="cert-line"><span class="mini-checkbox"></span>Supporting documents complete</div>
                    </div>
                    <table class="signature-table">
                        <tr>
                            <td class="row-label">Signature</td>
                            <td colspan="3"></td>
                        </tr>
                        <tr>
                            <td class="row-label">Printed<br>Name</td>
                            <td class="signature-value">{{ $data->accountantPrintedName }}</td>
                            <td class="date-label">Date</td>
                            <td class="date-space"></td>
                        </tr>
                        <tr class="position-row">
                            <td class="row-label">Position</td>
                            <td class="position-value" colspan="3">{{ $data->accountantPosition }}<br>Head, Accounting
                                Unit/Authorized Representative</td>
                        </tr>
                    </table>
                </td>
                <td>
                    <div class="box-title"><span class="box-letter">B</span>Certified:</div>
                    <div class="cert-content centered-cert">Funds Available</div>
                    <table class="signature-table">
                        <tr>
                            <td class="row-label">Signature</td>
                            <td colspan="3"></td>
                        </tr>
                        <tr>
                            <td class="row-label">Printed<br>Name</td>
                            <td class="signature-value">{{ $data->treasurerPrintedName }}</td>
                            <td class="date-label">Date</td>
                            <td class="date-space"></td>
                        </tr>
                        <tr class="position-row">
                            <td class="row-label">Position</td>
                            <td class="position-value" colspan="3">
                                {{ $data->treasurerPosition }}<br>Treasurer/Authorized Representative
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <table class="lower-pair">
            <tr>
                <td class="left-half lower-box">
                    <div class="box-title"><span class="box-letter">C</span>Approved for Payment</div>
                    <table class="lower-signature-line signature-row">
                        <tr>
                            <td class="row-label" style="width: 20%;">Signature</td>
                            <td style="width: 80%;"></td>
                        </tr>
                    </table>
                    <table class="lower-signature-line printed-name-row">
                        <tr>
                            <td class="row-label" style="width: 20%;">Printed<br>Name</td>
                            <td class="signature-value" style="width: 60%;">{{ $data->mayorPrintedName }}</td>
                            <td class="date-label" style="width: 20%;">Date</td>
                        </tr>
                    </table>
                    <table class="lower-signature-line position-row">
                        <tr>
                            <td class="row-label" style="width: 20%;">Position</td>
                            <td class="position-value" style="width: 80%;">{{ $data->mayorPosition }}<br>Agency
                                Head/Authorized
                                Representative</td>
                        </tr>
                    </table>
                </td>
                <td class="lower-box received-box">
                    <div class="box-title"><span class="box-letter">D</span>Received Payment</div>
                    <table class="lower-signature-line received-row received-top-row">
                        <tr>
                            <td style="width: 20%;"><span class="received-label">Check No.</span></td>
                            <td style="width: 60%;"><span class="received-label">Bank Name</span></td>
                            <td style="width: 20%;"><span class="received-label">Date</span></td>
                        </tr>
                    </table>
                    <table class="lower-signature-line received-row received-signature-row">
                        <tr>
                            <td style="width: 20%;"><span class="received-label">Signature</span></td>
                            <td colspan="2" style="width: 80%;"></td>
                        </tr>
                    </table>
                    <table class="lower-signature-line received-row received-name-row">
                        <tr>
                            <td style="width: 20%;"><span class="received-label">Printed Name</span></td>
                            <td class="received-name" style="width: 60%;">{{ $data->payee }}</td>
                            <td style="width: 20%;"><span class="received-label">Date</span></td>
                        </tr>
                    </table>
                    <table class="lower-signature-line received-row received-documents-row">
                        <tr>
                            <td style="width: 40%;"><span class="received-label nowrap">OR/Other Documents</span></td>
                            <td style="width: 40%;"><span class="received-label">JEV No.</span></td>
                            <td style="width: 20%;"><span class="received-label">Date</span></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>
