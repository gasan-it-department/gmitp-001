<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Acknowledgement Receipt - {{ $data->transactionNumber }}</title>
    <style>
        @page {
            margin: 30mm 30mm;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            color: #000;
            font-family: "Times New Roman", Times, serif;
            font-size: 12pt;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .header-logo-cell {
            width: 24%;
            height: 36mm;
            padding: 0;
            text-align: right;
            vertical-align: middle;
        }

        .header-logo {
            width: 27mm;
            height: 27mm;
            margin-right: 7mm;
            object-fit: contain;
        }

        .header-text-cell {
            width: 76%;
            padding: 0 24% 0 0;
            text-align: center;
            vertical-align: middle;
        }

        .republic {
            margin: 0;
            font-size: 13pt;
            line-height: 1.15;
        }

        .province {
            margin: 1mm 0 0;
            font-size: 15pt;
            font-weight: bold;
            line-height: 1.1;
            text-transform: uppercase;
        }

        .municipality {
            margin: 1mm 0 0;
            font-size: 18pt;
            line-height: 1.1;
        }

        .office {
            margin: 3mm 0 0;
            text-align: center;
            font-size: 17pt;
            font-weight: bold;
            font-style: italic;
            line-height: 1.1;
            text-decoration: underline;
        }

        .document-date {
            width: 45mm;
            min-height: 6mm;
            margin: 13mm 10mm 0 auto;
            border-bottom: 1px solid #000;
            padding: 0 2mm 1mm;
            text-align: center;
            font-size: 11pt;
        }

        h1 {
            margin: 24mm 0 18mm;
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            text-decoration: underline;
        }

        .receipt-copy {
            margin: 0 20mm;
            text-align: justify;
            font-size: 11pt;
            line-height: 1.75;
        }

        .line {
            display: inline-block;
            min-height: 5mm;
            border-bottom: 1px solid #000;
            padding: 0 2mm;
            text-align: center;
            line-height: 1.35;
            vertical-align: baseline;
        }

        .name-line {
            width: 58mm;
            font-weight: bold;
            text-transform: uppercase;
        }

        .barangay-line {
            width: 34mm;
        }

        .amount-line {
            width: 31mm;
            font-weight: bold;
        }

        .purpose-row {
            margin: 13mm 20mm 0 20mm;
            font-size: 11pt;
            line-height: 1.8;
        }

        .purpose-line {
            min-width: 43mm;
            font-weight: bold;
        }

        .provided-line {
            min-width: 42mm;
        }

        .signature-block {
            width: 85mm;
            margin: 23mm 20mm 0 20mm;
        }

        .signature-heading {
            margin: 0 0 14mm;
            font-weight: bold;
        }

        .signature-line {
            min-height: 7mm;
            border-bottom: 1px solid #000;
            padding: 0 2mm 1mm;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
        }

        .signature-label {
            margin: 1.5mm 20mm 0 20mm;
            text-align: center;
            font-size: 10pt;
            white-space: nowrap;
        }
    </style>
</head>

<body>
    <table class="header-table">
        <tr>
            <td class="header-logo-cell">
                @if($data->municipalityLogoDataUri)
                    <img class="header-logo" src="{{ $data->municipalityLogoDataUri }}" alt="Municipal seal">
                @endif
            </td>
            <td class="header-text-cell">
                <p class="republic">Republic of the Philippines</p>
                <p class="province">Province of Marinduque</p>
                <p class="municipality">Municipality of {{ $data->municipalityName }}</p>
            </td>
        </tr>
    </table>

    <p class="office">Municipal Social Welfare and Development Office</p>

    <div class="document-date">{{ $data->submittedAt->format('F j, Y') }}</div>

    <h1>ACKNOWLEDGEMENT RECEIPT</h1>

    <p class="receipt-copy">
        I,
        <span class="line name-line">{{ $data->recipientName }}</span>,
        residing at Brgy.
        <span class="line barangay-line">{{ $data->barangay ?: '________________' }}</span>,
        {{ $data->municipalityName }}, Marinduque hereby acknowledge the receipt of the amount of
        <span class="line amount-line">Php {{ number_format($data->approvedAmount, 2) }}</span>
        as {{ $data->assistanceType }} under the ASSISTANCE TO INDIVIDUALS IN CRISIS SITUATIONS
        (AICS) program, granted by the Municipal Social Welfare and Development Office (MSWDO)
        of the Municipality of {{ $data->municipalityName }}, Marinduque.
    </p>

    <p class="purpose-row">
        This assistance is for the purpose of
        <span class="line purpose-line">{{ $data->assistanceType }}</span>,
        provided on
        <span class="line provided-line">{{ $data->providedAt?->format('F j, Y') ?? '' }}</span>.
    </p>

    <div class="signature-block">
        <p class="signature-heading">Received by:</p>
        <div class="signature-line">{{ $data->recipientName }}</div>
        <p class="signature-label">Name and Signature of Beneficiary</p>
    </div>
</body>

</html>