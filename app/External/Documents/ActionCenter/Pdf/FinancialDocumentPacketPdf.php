<?php

namespace App\External\Documents\ActionCenter\Pdf;

use App\Core\ActionCenter\Dto\Assistance\FinancialDocumentPacketData;
use Illuminate\Http\Response;
use RuntimeException;
use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\StreamReader;

class FinancialDocumentPacketPdf
{
    public function __construct(
        private readonly CertificateOfEligibilityPdf $certificateOfEligibility,
        private readonly ObligationRequestPdf $obligationRequest,
        private readonly DisbursementVoucherPdf $disbursementVoucher,
    ) {}

    public function response(FinancialDocumentPacketData $data): Response
    {
        $pdf = new Fpdi;

        foreach ([
            $this->certificateOfEligibility->content($data->certificateOfEligibility),
            $this->obligationRequest->content($data->obligationRequest),
            $this->disbursementVoucher->content($data->disbursementVoucher),
        ] as $document) {
            $this->append($pdf, $document);
        }

        $content = $pdf->Output('S');

        if ($content === '') {
            throw new RuntimeException('FPDI returned an empty financial document packet.');
        }

        $filename = $this->filename($data);

        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => sprintf('attachment; filename="%s"', $filename),
            'Content-Length' => (string) strlen($content),
            'Cache-Control' => 'private, no-store, max-age=0',
        ]);
    }

    private function append(Fpdi $packet, string $document): void
    {
        $pageCount = $packet->setSourceFile(StreamReader::createByString($document));

        for ($page = 1; $page <= $pageCount; $page++) {
            $template = $packet->importPage($page);
            $size = $packet->getTemplateSize($template);
            $orientation = $size['width'] > $size['height'] ? 'L' : 'P';

            $packet->AddPage($orientation, [$size['width'], $size['height']]);
            $packet->useTemplate($template);
        }
    }

    private function filename(FinancialDocumentPacketData $data): string
    {
        $transaction = preg_replace(
            '/[^A-Za-z0-9_-]+/',
            '-',
            $data->transactionNumber(),
        ) ?: 'REQUEST';

        return sprintf(
            'financial-document-packet_%s_%s.pdf',
            strtoupper($transaction),
            $data->generatedAt()->format('Y-m-d'),
        );
    }
}
