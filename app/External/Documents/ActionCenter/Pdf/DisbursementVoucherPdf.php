<?php

namespace App\External\Documents\ActionCenter\Pdf;

use App\Core\ActionCenter\Dto\Assistance\DisbursementVoucherData;
use Illuminate\Http\Response;
use RuntimeException;
use Spatie\LaravelPdf\Enums\Format;
use Spatie\LaravelPdf\PdfBuilder;

use function Spatie\LaravelPdf\Support\pdf;

class DisbursementVoucherPdf
{
    public function build(DisbursementVoucherData $data): PdfBuilder
    {
        return pdf()
            ->view('documents.action_center.disbursement_voucher', [
                'data' => $data,
            ])
            ->driver('dompdf')
            ->format(Format::Legal)
            ->margins(top: 7, right: 7, bottom: 7, left: 7, unit: 'mm')
            ->name($this->filename($data));
    }

    public function response(DisbursementVoucherData $data): Response
    {
        $builder = $this->build($data);
        $content = base64_decode($builder->base64(), true);

        if ($content === false || $content === '') {
            throw new RuntimeException('DOMPDF returned an empty Disbursement Voucher document.');
        }

        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => sprintf('attachment; filename="%s"', $this->filename($data)),
            'Content-Length' => (string) strlen($content),
            'Cache-Control' => 'private, no-store, max-age=0',
        ]);
    }

    private function filename(DisbursementVoucherData $data): string
    {
        $transaction = preg_replace(
            '/[^A-Za-z0-9_-]+/',
            '-',
            $data->transactionNumber,
        ) ?: 'REQUEST';

        return sprintf(
            'disbursement-voucher_%s_%s.pdf',
            strtoupper($transaction),
            $data->generatedAt->format('Y-m-d'),
        );
    }
}
