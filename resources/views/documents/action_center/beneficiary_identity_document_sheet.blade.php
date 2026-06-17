@php
    $beneficiary = $data->beneficiary;
@endphp

<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Beneficiary Identity Document Sheet</title>
    @vite('resources/css/app.css')
    <style>
        @page {
            size: A4;
            margin: 12mm;
        }

        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #111827;
        }

        .sheet {
            height: 273mm;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .header {
            width: 100%;
            text-align: center;
        }

        .id-stack {
            margin-top: 20mm;
            display: flex;
            flex-direction: column;
            gap: 20mm;
            width: 100%;
        }

        .id-row {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-start;
            width: 100%;
            gap: 10mm;
        }

        .id-slot {
            width: 110mm;
            height: 75mm;
            border: 1px solid #cbd5e1;
            border-radius: 4mm;
            padding: 2mm;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
        }

        .id-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            display: block;
        }


        .placeholder {
            padding: 8mm;
            text-align: center;
            font-size: 9pt;
            line-height: 1.35;
            color: #475569;
        }
    </style>
</head>

<body>
    <main class="sheet">
        <header class="header">
            <p class="text-[9pt] font-bold tracking-widest uppercase">Municipal Social Welfare and Development Office
            </p>
            <p class="mt-1 text-[8pt] font-semibold tracking-widest text-slate-500 uppercase">Municipality of
                {{ $data->municipalityName ?? '---' }}</p>
            <h1 class="mt-4 text-[16pt] font-bold">Beneficiary ID Document</h1>
            <p class="mt-2 text-[12pt] font-semibold">{{ $beneficiary->full_name }}</p>
            @if($beneficiary->beneficiary_number)
                <p class="mt-1 font-mono text-[9pt] text-slate-500">{{ $beneficiary->beneficiary_number }}</p>
            @endif
        </header>

        <section class="id-stack">
            @foreach([$data->frontDocument, $data->backDocument] as $document)
                <div class="id-row">
                    <!-- Left Side: Clear ID Image -->
                    <div class="id-slot">
                        @if($document->isImage())
                            <img src="{{ $document->dataUri }}" alt="{{ $document->label }}" class="id-image">
                        @else
                            <div class="placeholder">
                                <p class="font-bold text-slate-800">{{ $document->label }}</p>
                                <p class="mt-2">{{ $document->message }}</p>
                            </div>
                        @endif
                    </div>
                    

                </div>
            @endforeach
        </section>
    </main>
</body>

</html>