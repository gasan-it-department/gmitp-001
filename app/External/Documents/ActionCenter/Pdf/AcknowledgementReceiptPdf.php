<?php

namespace App\External\Documents\ActionCenter\Pdf;

use App\Core\ActionCenter\Dto\Assistance\AcknowledgementReceiptData;
use Illuminate\Http\Response;
use RuntimeException;
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
            ->driver('dompdf')
            ->format(Format::A4)
            ->margins(top: 12, right: 30, bottom: 12, left: 30, unit: 'mm')
            ->name($this->filename($data));
    }

    public function response(AcknowledgementReceiptData $data): Response
    {
        $builder = $this->build($data);
        $content = base64_decode($builder->base64(), true);

        if ($content === false || $content === '') {
            throw new RuntimeException('DOMPDF returned an empty Acknowledgement Receipt document.');
        }

        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => sprintf('attachment; filename="%s"', $this->filename($data)),
            'Content-Length' => (string) strlen($content),
            'Cache-Control' => 'private, no-store, max-age=0',
        ]);
    }

    private function filename(AcknowledgementReceiptData $data): string
    {
        $transaction = preg_replace(
            '/[^A-Za-z0-9_-]+/',
            '-',
            $data->transactionNumber,
        ) ?: 'REQUEST';

        return sprintf(
            'acknowledgement-receipt_%s_%s.pdf',
            strtoupper($transaction),
            $data->generatedAt->format('Y-m-d'),
        );
    }
}
