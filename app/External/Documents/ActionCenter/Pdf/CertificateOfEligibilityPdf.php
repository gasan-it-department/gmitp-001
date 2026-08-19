<?php

namespace App\External\Documents\ActionCenter\Pdf;

use App\Core\ActionCenter\Dto\Assistance\CertificateOfEligibilityData;
use Illuminate\Http\Response;
use RuntimeException;
use Spatie\LaravelPdf\Enums\Format;
use Spatie\LaravelPdf\PdfBuilder;

use function Spatie\LaravelPdf\Support\pdf;

class CertificateOfEligibilityPdf
{
    public function build(CertificateOfEligibilityData $data): PdfBuilder
    {
        return pdf()
            ->view('documents.action_center.certificate_of_eligibility', [
                'data' => $data,
            ])
            ->driver('dompdf')
            ->format(Format::Legal)
            ->margins(top: 13, right: 15, bottom: 13, left: 15, unit: 'mm')
            ->name($this->filename($data));
    }

    public function response(CertificateOfEligibilityData $data): Response
    {
        $builder = $this->build($data);
        $content = base64_decode($builder->base64(), true);

        if ($content === false || $content === '') {
            throw new RuntimeException('DOMPDF returned an empty Certificate of Eligibility document.');
        }

        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => sprintf('attachment; filename="%s"', $this->filename($data)),
            'Content-Length' => (string) strlen($content),
            'Cache-Control' => 'private, no-store, max-age=0',
        ]);
    }

    private function filename(CertificateOfEligibilityData $data): string
    {
        $transaction = preg_replace(
            '/[^A-Za-z0-9_-]+/',
            '-',
            $data->transactionNumber,
        ) ?: 'REQUEST';

        return sprintf(
            'certificate-of-eligibility_%s_%s.pdf',
            strtoupper($transaction),
            $data->generatedAt->format('Y-m-d'),
        );
    }
}
