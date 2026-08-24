<?php

namespace App\External\Documents\ActionCenter\Pdf;

use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestIntakeSheetData;
use Illuminate\Http\Response;
use RuntimeException;
use Spatie\LaravelPdf\Enums\Format;
use Spatie\LaravelPdf\PdfBuilder;

use function Spatie\LaravelPdf\Support\pdf;

class AssistanceRequestIntakeSheetPdf
{
    public function build(AssistanceRequestIntakeSheetData $data): PdfBuilder
    {
        return pdf()
            ->view('documents.action_center.assistance_request_intake_sheet', [
                'data' => $data,
            ])
            ->driver('dompdf')
            ->format(Format::Legal)
            ->margins(top: 10, right: 12, bottom: 10, left: 12, unit: 'mm')
            ->name($this->filename($data));
    }

    public function response(AssistanceRequestIntakeSheetData $data): Response
    {
        $builder = $this->build($data);
        $content = base64_decode($builder->base64(), true);

        if ($content === false || $content === '') {
            throw new RuntimeException('DOMPDF returned an empty assistance request intake sheet.');
        }

        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => sprintf('attachment; filename="%s"', $this->filename($data)),
            'Content-Length' => (string) strlen($content),
            'Cache-Control' => 'private, no-store, max-age=0',
        ]);
    }

    private function filename(AssistanceRequestIntakeSheetData $data): string
    {
        $transaction = preg_replace(
            '/[^A-Za-z0-9_-]+/',
            '-',
            (string) $data->request->transaction_number,
        ) ?: 'REQUEST';

        return sprintf(
            'assistance-request-intake_%s_%s.pdf',
            strtoupper($transaction),
            $data->generatedAt->format('Y-m-d'),
        );
    }
}
