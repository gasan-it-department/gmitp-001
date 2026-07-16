<?php

namespace App\External\Documents\ActionCenter\Pdf;

use App\Core\ActionCenter\Dto\Assistance\AcknowledgementReceiptData;
use Spatie\LaravelPdf\Enums\Format;
use Spatie\LaravelPdf\PdfBuilder;
use function Spatie\LaravelPdf\Support\pdf;

class AcknowledgementReceiptPdf
{
    public function build(AcknowledgementReceiptData $data): PdfBuilder
    {
        return pdf()
            ->view('documents.action_center.acknowledgement_receipt', [
                'data' => $data,
            ])
            ->format(Format::A4)
            ->margins(top: 14, right: 16, bottom: 18, left: 16, unit: 'mm')
            ->name($this->filename($data));
    }

    private function filename(AcknowledgementReceiptData $data): string
    {
        $transaction = preg_replace(
            '/[^A-Za-z0-9_-]+/',
            '-',
            (string) $data->request->transaction_number,
        ) ?: 'REQUEST';

        return sprintf(
            'acknowledgement-receipt_%s_%s.pdf',
            strtoupper($transaction),
            $data->generatedAt->format('Y-m-d'),
        );
    }
}
