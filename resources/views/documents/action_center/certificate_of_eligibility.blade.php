<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Certificate of Eligibility - {{ $data->subjectName }}</title>
    <style>
        @page {
            size: legal portrait;
            margin: 13mm 15mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #111;
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 10.5pt;
            line-height: 1.35;
        }

        .page {
            width: 100%;
        }

        .header {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
        }

        .logo-cell {
            width: 25%;
            text-align: center;
        }

        .heading-cell {
            width: 50%;
            text-align: center;
            vertical-align: middle;
        }

        .header-spacer {
            width: 25%;
        }

        .logo {
            width: 29mm;
            height: 29mm;
            object-fit: contain;
        }

        .seal-placeholder {
            display: inline-block;
            width: 26mm;
            height: 26mm;
            border: 0.8pt solid #777;
            border-radius: 50%;
            color: #777;
            font-size: 7pt;
            line-height: 26mm;
            text-align: center;
        }

        .republic {
            font-size: 12pt;
        }

        .province {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        .municipality {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        .phone {
            font-size: 10pt;
        }

        .office-title {
            margin-top: 13mm;
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            letter-spacing: 0.1pt;
        }

        .rule {
            margin: 5mm 0 13mm;
            border-top: 1.2pt solid #111;
        }

        .title {
            margin: 0 0 14mm;
            text-align: center;
            font-size: 17pt;
            font-weight: bold;
        }

        .body {
            padding: 0 12mm;
        }

        .body p {
            margin: 0 0 9mm;
            text-align: justify;
        }

        .fill {
            display: inline;
            padding: 0 1mm;
            font-weight: bold;
            border-bottom: 0.8pt solid #111;
        }

        .reviewed {
            margin-top: 3mm !important;
            text-align: left !important;
        }

        .signatures {
            width: 100%;
            margin-top: 14mm;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .signatures td {
            width: 50%;
            vertical-align: top;
        }

        .signature-left {
            padding-right: 18mm;
        }

        .signature-right {
            padding-left: 18mm;
        }

        .signature-label {
            margin-bottom: 18mm;
            font-weight: bold;
        }

        .signature-line {
            width: 100%;
            height: 0;
            border-top: 0.8pt solid #111;
        }

        .printed-name {
            margin-top: 2mm;
            font-weight: bold;
            text-transform: uppercase;
        }

        .position {
            font-style: italic;
        }
    </style>
</head>

<body>
    <div class="page">
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
                    <div class="republic">Republic of the Philippines</div>
                    @if ($data->provinceName)
                        <div class="province">Province of {{ $data->provinceName }}</div>
                    @endif
                    <div class="municipality">Municipality of {{ $data->municipalityName }}</div>
                    @if ($data->trunklinePhone)
                        <div class="phone">Tel.No.: {{ $data->trunklinePhone }}</div>
                    @endif
                </td>
                <td class="header-spacer"></td>
            </tr>
        </table>

        <div class="office-title">MUNICIPAL SOCIAL WELFARE AND DEVELOPMENT</div>
        <div class="rule"></div>
        <h1 class="title">CERTIFICATE OF ELIGIBILITY</h1>

        <div class="body">
            <p>
                This is to certify that
                <span class="fill">{{ $data->subjectName }}</span>
                @if ($data->subjectAgePhrase)
                    {{ $data->subjectAgePhrase }}
                @endif
                @if ($data->subjectCivilStatus)
                    , <span class="fill">{{ $data->subjectCivilStatus }}</span>
                @endif
                and a bonafide resident of
                <span class="fill">{{ $data->address }}</span>
                has been found eligible for
                <span class="fill">{{ $data->assistanceType }}</span>
                under the Assistance to Individuals in Crisis Situation (AICS) program after interviews and intake have
                been completed.
            </p>

            <p>
                Attached is an intake dated
                <span class="fill">{{ $data->intakeDate->format('l, F d, Y') }}</span>
                of the Municipal Social Welfare and Development Office.
            </p>

            <p class="reviewed">Records and supporting papers reviewed.</p>
        </div>

        <table class="signatures">
            <tr>
                <td class="signature-left">
                    <div class="signature-label">Certified By:</div>
                    <div class="signature-line"></div>
                    <div class="printed-name">{{ $data->certifiedByName }}</div>
                    <div class="position">{{ $data->certifiedByPosition }}</div>
                </td>
                <td class="signature-right">
                    <div class="signature-label">Approved By:</div>
                    <div class="signature-line"></div>
                    <div class="printed-name">{{ $data->approvedByName }}</div>
                    <div class="position">{{ $data->approvedByPosition }}</div>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>