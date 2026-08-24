<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Obligation Request {{ $data->obligationRequestNumber }}</title>
    <style>
        @page {
            size: legal portrait;
            margin: 7mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #111;
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 9.2pt;
            line-height: 1.2;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td,
        th {
            vertical-align: middle;
        }

        .document {
            border: 1.4pt solid #111;
        }

        .bordered {
            border: 0.75pt solid #111;
        }

        .header {
            height: 29mm;
        }

        .header td {
            border: 0;
            text-align: center;
        }

        .logo-cell {
            width: 31%;
            padding-left: 17mm;
        }

        .logo {
            width: 22mm;
            height: 22mm;
            object-fit: contain;
        }

        .seal-placeholder {
            display: inline-block;
            width: 20mm;
            height: 20mm;
            border: 0.8pt solid #777;
            border-radius: 50%;
            color: #777;
            font-size: 7pt;
            line-height: 20mm;
            text-align: center;
        }

        .heading-cell {
            width: 46%;
            padding-top: 1mm;
        }

        .header-republic {
            font-size: 10pt;
        }

        .header-municipality {
            font-size: 13pt;
            font-weight: bold;
        }

        .header-province {
            font-size: 10pt;
        }

        .annex-cell {
            width: 23%;
            padding: 1.5mm 3mm 0 0;
            text-align: right !important;
            vertical-align: top;
            font-weight: bold;
            font-size: 8.5pt;
        }

        .title-row {
            height: 12mm;
        }

        .title-table td {
            border: 0;
        }

        .title {
            width: 69%;
            border-right: 0.75pt solid #111 !important;
            text-align: center;
            font-size: 17pt;
            font-weight: bold;
            letter-spacing: 0;
        }

        .number {
            width: 31%;
            padding: 0 2mm;
            font-size: 12pt;
        }

        .info-row {
            height: 8mm;
        }

        .info-label {
            width: 15%;
            padding: 0 1.5mm;
        }

        .info-value {
            padding: 0 2mm;
            font-weight: bold;
        }

        .office-value {
            font-weight: normal;
        }

        .column-header {
            height: 12mm;
            text-align: center;
            font-weight: normal;
        }

        .rc-col {
            width: 15%;
        }

        .particulars-col {
            width: 42%;
        }

        .fpp-col {
            width: 12%;
        }

        .account-col {
            width: 13%;
        }

        .amount-col {
            width: 18%;
        }

        .main-row {
            height: 99mm;
        }

        .main-cell {
            padding: 5mm 3mm;
            vertical-align: top;
        }

        .main-centered {
            padding: 5mm 3mm 0;
            text-align: center;
            vertical-align: top;
            font-size: 11pt;
            font-weight: bold;
            height: 400px;
        }

        .account-value {
            padding-right: 1mm;
            padding-left: 1mm;
            white-space: nowrap;
            font-size: 9.4pt;
        }

        .particulars {
            padding: 5mm 4mm 4mm;
            vertical-align: top;
            font-size: 10pt;
            line-height: 1.45;
        }

        .amount {
            padding: 5mm 2mm 0;
            vertical-align: top;
            font-size: 10pt;
        }

        .amount table td {
            border: 0;
        }

        .amount-currency {
            width: 28%;
        }

        .amount-value {
            text-align: right;
            white-space: nowrap;
        }

        .total-row {
            height: 8mm;
            font-size: 11pt;
            font-weight: bold;
        }

        .total-label {
            text-align: right;
            padding-right: 16mm;
        }

        .total-currency {
            width: 5%;
            padding-left: 2mm;
        }

        .total-value {
            width: 13%;
            padding-right: 2mm;
            text-align: right;
        }

        .certification-row {
            height: 37mm;
        }

        .pair-wrapper {
            padding: 0;
        }

        .pair-table {
            table-layout: fixed;
        }

        .pair-table>tbody>tr>td {
            width: 50%;
            vertical-align: top;
        }

        .pair-divider {
            border-right: 0.75pt solid #111 !important;
        }

        .certification-cell {
            height: 37mm;
            padding: 2mm 3mm;
            vertical-align: top;
        }

        .cert-heading {
            font-size: 10pt;
            margin-bottom: 3mm;
        }

        .cert-letter {
            display: inline-block;
            width: 7mm;
            height: 7mm;
            margin-right: 1mm;
            border: 0.8pt solid #111;
            text-align: center;
            line-height: 6mm;
            font-weight: bold;
        }

        .check-row {
            margin: 2.5mm 0 0 9mm;
        }

        .checkbox {
            display: inline-block;
            width: 7mm;
            height: 7mm;
            margin-right: 5mm;
            border: 0.8pt solid #111;
            vertical-align: middle;
        }

        .check-text {
            display: inline-block;
            width: 75%;
            vertical-align: middle;
            font-size: 7.4pt;
            line-height: 1.35;
        }

        .budget-cert {
            padding-top: 13mm;
            text-align: center;
            font-size: 8.5pt;
        }

        .signatory-table td {
            border: 0.75pt solid #111;
        }

        .signatory-label {
            width: 18%;
            padding: 1mm;
            font-size: 7.5pt;
        }

        .signature-space {
            height: 13mm;
        }

        .printed-name {
            height: 10mm;
            padding: 1mm 2mm;
            text-align: center;
            font-size: 11pt;
            font-weight: bold;
        }

        .position {
            height: 11mm;
            padding: 1mm 2mm;
            text-align: center;
            font-size: 8pt;
            font-style: italic;
            line-height: 1.3;
        }

        .date-space {
            height: 7mm;
        }
    </style>
</head>

<body>
    <table class="document">
        <colgroup>
            <col width="15%">
            <col width="42%">
            <col width="12%">
            <col width="13%">
            <col width="18%">
        </colgroup>
        <tr class="header">
            <td colspan="5" class="bordered">
                <table class="header">
                    <tr>
                        <td class="logo-cell">
                            @if ($data->municipalityLogoDataUri)
                                <img class="logo" src="{{ $data->municipalityLogoDataUri }}" alt="Municipal logo">
                            @else
                                <span class="seal-placeholder">SEAL</span>
                            @endif
                        </td>
                        <td class="heading-cell">
                            <div class="header-republic">Republic of the Philippines</div>
                            <div class="header-municipality">MUNICIPALITY OF {{ strtoupper($data->municipalityName) }}
                            </div>
                            <div class="header-province">Marinduque</div>
                        </td>
                        <td class="annex-cell">Annex B</td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr class="title-row">
            <td colspan="5" class="bordered">
                <table class="title-table title-row">
                    <tr>
                        <td class="title">OBLIGATION REQUEST</td>
                        <td class="number">No. {{ $data->obligationRequestNumber }}</td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr class="info-row">
            <td class="bordered info-label">Payee</td>
            <td colspan="4" class="bordered info-value">{{ strtoupper($data->payee) }}</td>
        </tr>
        <tr class="info-row">
            <td class="bordered info-label">Office</td>
            <td colspan="4" class="bordered info-value office-value">{{ $data->office }}</td>
        </tr>
        <tr class="info-row">
            <td class="bordered info-label">Address</td>
            <td colspan="4" class="bordered info-value">{{ $data->address }}</td>
        </tr>
        <tr class="column-header">
            <td class="bordered rc-col">Responsibility<br>Center</td>
            <td class="bordered particulars-col">Particulars</td>
            <td class="bordered fpp-col">F.P.P.</td>
            <td class="bordered account-col">Account<br>Code</td>
            <td class="bordered amount-col">Amount</td>
        </tr>
        <tr class="main-row">
            <td class="bordered main-cell main-centered">{{ $data->responsibilityCenter }}</td>
            <td class="bordered particulars">{!! nl2br(e($data->particulars)) !!}</td>
            <td class="bordered main-cell main-centered">{{ $data->fpp }}</td>
            <td class="bordered main-cell main-centered account-value">{{ $data->accountCode }}</td>
            <td class="bordered amount">
                <table>
                    <tr>
                        <td class="amount-currency">Php</td>
                        <td class="amount-value">{{ number_format($data->approvedAmount, 2) }}</td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr class="total-row">
            <td colspan="4" class="bordered total-label">TOTAL</td>
            <td class="bordered">
                <table>
                    <tr>
                        <td class="total-currency">Php</td>
                        <td class="total-value">{{ number_format($data->approvedAmount, 2) }}</td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr class="certification-row">
            <td colspan="5" class="bordered pair-wrapper">
                <table class="pair-table">
                    <tr>
                        <td width="50%" class="certification-cell pair-divider">
                            <div class="cert-heading"><span class="cert-letter">A</span>Certified</div>
                            <div class="check-row">
                                <span class="checkbox"></span>
                                <span class="check-text">Charges to appropriation/allotment necessary, lawful and under
                                    my direct supervision</span>
                            </div>
                            <div class="check-row">
                                <span class="checkbox"></span>
                                <span class="check-text">Supporting documents valid, proper and legal</span>
                            </div>
                        </td>
                        <td width="50%" class="certification-cell">
                            <div class="cert-heading"><span class="cert-letter">B</span>Certified</div>
                            <div class="budget-cert">Existence of available appropriation</div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td colspan="5" class="bordered pair-wrapper">
                <table class="pair-table">
                    <tr>
                        <td width="50%">
                            <table class="signatory-table">
                                <tr>
                                    <td class="signatory-label">Signature</td>
                                    <td class="signature-space"></td>
                                </tr>
                                <tr>
                                    <td class="signatory-label">Printed<br>Name</td>
                                    <td class="printed-name">{{ strtoupper($data->mswdoPrintedName) }}</td>
                                </tr>
                                <tr>
                                    <td class="signatory-label">Position</td>
                                    <td class="position">{{ $data->mswdoPosition }}<br>Head, Requesting
                                        Office/Authorized Representative</td>
                                </tr>
                                <tr>
                                    <td class="signatory-label">Date</td>
                                    <td class="date-space"></td>
                                </tr>
                            </table>
                        </td>
                        <td width="50%">
                            <table class="signatory-table">
                                <tr>
                                    <td class="signatory-label">Signature</td>
                                    <td class="signature-space"></td>
                                </tr>
                                <tr>
                                    <td class="signatory-label">Printed<br>Name</td>
                                    <td class="printed-name">{{ strtoupper($data->budgetOfficerPrintedName) }}</td>
                                </tr>
                                <tr>
                                    <td class="signatory-label">Position</td>
                                    <td class="position">{{ $data->budgetOfficerPosition }}<br>Head, Budget
                                        Unit/Authorized Representative</td>
                                </tr>
                                <tr>
                                    <td class="signatory-label">Date</td>
                                    <td class="date-space"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>