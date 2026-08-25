<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Acknowledgement Receipt - {{ $data->transactionNumber }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 8mm 15mm;
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
            font-size: 8.5pt;
            line-height: 1.3;
        }

        .title-header {
            margin: 10mm 0 10mm;
        }

        .receipt-section {
            height: 137mm;
            overflow: hidden;
            padding: 0 10mm;
            page-break-inside: avoid;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .header-logo-cell {
            width: 22%;
            height: 20mm;
            padding: 0 4mm 0 0;
            text-align: right;
            vertical-align: middle;
        }

        .header-logo {
            width: 17mm;
            height: 17mm;
            object-fit: contain;
        }

        .header-text-cell {
            width: 56%;
            padding: 0;
            text-align: center;
            vertical-align: middle;
        }

        .header-spacer-cell {
            width: 22%;
        }

        .republic {
            margin: 0;
            font-size: 8.25pt;
            line-height: 1.15;
        }

        .province {
            margin: 0.5mm 0 0;
            font-size: 9.5pt;
            font-weight: bold;
            line-height: 1.1;
            text-transform: uppercase;
        }

        .municipality {
            margin: 0.5mm 0 0;
            font-size: 11.5pt;
            line-height: 1.1;
        }

        .office {
            margin: 0.8mm 0 0;
            text-align: center;
            font-size: 10.5pt;
            font-weight: bold;
            font-style: italic;
            line-height: 1.1;
            text-decoration: underline;
        }

        .document-date {
            width: 36mm;
            min-height: 4.5mm;
            margin: 2.5mm 2mm 0 auto;
            border-bottom: 1px solid #000;
            padding: 0 1mm 0.5mm;
            text-align: center;
            font-size: 8pt;
        }

        h1 {
            margin: 3.5mm 0 4mm;
            text-align: center;
            font-size: 12.5pt;
            font-weight: bold;
            text-decoration: underline;
        }

        .receipt-copy {
            margin: 0 1mm;
            text-align: justify;
            font-size: 8.7pt;
            line-height: 1.45;
        }

        .line {
            display: inline-block;
            min-height: 3.7mm;
            border-bottom: 1px solid #000;
            padding: 0 1mm;
            text-align: center;
            line-height: 1.2;
            vertical-align: baseline;
        }

        .name-line {
            width: 46mm;
            font-weight: bold;
            text-transform: uppercase;
        }

        .barangay-line {
            width: 26mm;
        }

        .amount-line {
            width: 27mm;
            font-weight: bold;
        }

        .purpose-row {
            margin: 3.5mm 1mm 0;
            font-size: 8.7pt;
            line-height: 1.45;
        }

        .purpose-line {
            min-width: 37mm;
            font-weight: bold;
        }

        .provided-line {
            min-width: 35mm;
        }

        .signature-block {
            width: 70mm;
            margin: 6mm 1mm 0;
        }

        .signature-heading {
            margin: 0 0 5mm;
            font-weight: bold;
        }

        .signature-line {
            min-height: 5mm;
            border-bottom: 1px solid #000;
            padding: 0 1mm 0.5mm;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
        }

        .signature-label {
            margin: 1mm 0 0;
            text-align: center;
            font-size: 7.5pt;
            white-space: nowrap;
        }

        .cut-guide {
            position: relative;
            height: 5mm;
        }

        .cut-line {
            position: absolute;
            top: 2.5mm;
            right: 0;
            left: 0;
            border-top: 0.7pt dashed #666;
        }
    </style>
</head>

<body>
    @foreach([1, 2] as $copyNumber)
        <section class="receipt-section">
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
                    <td class="header-spacer-cell"></td>
                </tr>
            </table>

            <p class="office">Municipal Social Welfare and Development Office</p>

            <div class="document-date"></div>

            <h1 class="title-header">ACKNOWLEDGEMENT RECEIPT</h1>

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
        </section>

        @if(!$loop->last)
            <div class="cut-guide">
                <div class="cut-line"></div>
            </div>
        @endif
    @endforeach
</body>

</html>