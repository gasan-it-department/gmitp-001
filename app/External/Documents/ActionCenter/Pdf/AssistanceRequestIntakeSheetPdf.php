<?php

namespace App\External\Documents\ActionCenter\Pdf;

use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestIntakeSheetData;
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
            ->format(Format::A4)
            ->margins(top: 12, right: 12, bottom: 16, left: 12, unit: 'mm')
            ->name($this->filename($data));
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
