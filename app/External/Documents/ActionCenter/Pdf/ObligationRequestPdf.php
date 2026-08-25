<?php

namespace App\External\Documents\ActionCenter\Pdf;

use App\Core\ActionCenter\Dto\Assistance\ObligationRequestData;
use Illuminate\Http\Response;
use RuntimeException;
use Spatie\LaravelPdf\Enums\Format;
use Spatie\LaravelPdf\PdfBuilder;

use function Spatie\LaravelPdf\Support\pdf;

class ObligationRequestPdf
{
    public function build(ObligationRequestData $data): PdfBuilder
    {
        return pdf()
            ->view('documents.action_center.obligation_request', [
                'data' => $data,
            ])
            ->driver('dompdf')
            ->format(Format::Legal)
            ->margins(top: 7, right: 7, bottom: 7, left: 7, unit: 'mm')
            ->name($this->filename($data));
    }

    public function response(ObligationRequestData $data): Response
    {
        $content = $this->content($data);

        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => sprintf('attachment; filename="%s"', $this->filename($data)),
            'Content-Length' => (string) strlen($content),
            'Cache-Control' => 'private, no-store, max-age=0',
        ]);
    }

    public function content(ObligationRequestData $data): string
    {
        $content = base64_decode($this->build($data)->base64(), true);

        if ($content === false || $content === '') {
            throw new RuntimeException('DOMPDF returned an empty Obligation Request document.');
        }

        return $content;
    }

    private function filename(ObligationRequestData $data): string
    {
        $transaction = preg_replace(
            '/[^A-Za-z0-9_-]+/',
            '-',
            $data->transactionNumber,
        ) ?: 'REQUEST';

        return sprintf(
            'obligation-request_%s_%s.pdf',
            strtoupper($transaction),
            $data->generatedAt->format('Y-m-d'),
        );
    }
}
