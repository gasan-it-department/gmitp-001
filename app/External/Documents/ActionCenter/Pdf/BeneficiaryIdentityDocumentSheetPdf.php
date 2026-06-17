<?php

namespace App\External\Documents\ActionCenter\Pdf;

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIdentityDocumentSheetData;
use Spatie\LaravelPdf\Enums\Format;
use Spatie\LaravelPdf\PdfBuilder;
use function Spatie\LaravelPdf\Support\pdf;

class BeneficiaryIdentityDocumentSheetPdf
{
    public function build(BeneficiaryIdentityDocumentSheetData $data): PdfBuilder
    {
        return pdf()
            ->view('documents.action_center.beneficiary_identity_document_sheet', [
                'data' => $data,
            ])
            ->format(Format::A4)
            ->margins(top: 12, right: 12, bottom: 16, left: 12, unit: 'mm')
            ->name($this->filename($data));
    }

    private function filename(BeneficiaryIdentityDocumentSheetData $data): string
    {
        $surname = strtoupper(
            preg_replace('/[^A-Za-z]/', '', (string) $data->beneficiary->last_name) ?: 'BENEFICIARY',
        );
        $given = strtoupper(
            preg_replace('/[^A-Za-z]/', '', (string) $data->beneficiary->first_name) ?: '',
        );

        return sprintf(
            'identity-document-sheet_%s-%s_%s.pdf',
            $surname,
            $given,
            $data->generatedAt->format('Y-m-d'),
        );
    }
}
