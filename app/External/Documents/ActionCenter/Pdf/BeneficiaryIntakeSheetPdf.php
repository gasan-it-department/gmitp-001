<?php

namespace App\External\Documents\ActionCenter\Pdf;

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIntakeSheetData;
use Spatie\LaravelPdf\Enums\Format;
use Spatie\LaravelPdf\PdfBuilder;
use function Spatie\LaravelPdf\Support\pdf;

/**
 * Renders the BeneficiaryIntakeSheet Blade template via spatie/laravel-pdf
 * (Browsershot → headless Chromium under the hood).
 *
 * This class is the only place that knows about the PDF engine. The Core
 * action assembles data; the controller wires action to renderer to
 * response. Swapping to DomPDF, dompdf-via-spatie, or a different library
 * later means touching only this file.
 *
 * ── Why a class wrapper around the pdf() helper ──────────────────────
 * The bare `pdf()->view(...)->name(...)` call works, but centralizing it
 * here lets us:
 *   • Apply consistent page format / margins for ALL MSWD documents
 *   • Set a sensible default filename (with the beneficiary's name +
 *     date) without each call site re-implementing the slug logic
 *   • Future-proof: when we add a header/footer with the municipal seal,
 *     it lives here once instead of in every controller.
 */
class BeneficiaryIntakeSheetPdf
{
    /**
     * Build the PdfBuilder. The controller can then call ->download(),
     * ->save(), ->base64(), or return it directly to inline-display.
     */
    public function build(BeneficiaryIntakeSheetData $data): PdfBuilder
    {
        return pdf()
            ->view('documents.action_center.beneficiary_intake_sheet', [
                'data' => $data,
            ])
            ->format(Format::A4)
            ->margins(top: 12, right: 12, bottom: 16, left: 12, unit: 'mm')
            ->name($this->filename($data));
    }

    /**
     * Filename shown in the browser download dialog. Format:
     *   intake-sheet_DELACRUZ-JUAN_2026-05-25.pdf
     */
    private function filename(BeneficiaryIntakeSheetData $data): string
    {
        $surname = strtoupper(
            preg_replace('/[^A-Za-z]/', '', (string) $data->beneficiary->last_name) ?: 'BENEFICIARY',
        );
        $given = strtoupper(
            preg_replace('/[^A-Za-z]/', '', (string) $data->beneficiary->first_name) ?: '',
        );
        $date = $data->generatedAt->format('Y-m-d');

        return sprintf('intake-sheet_%s-%s_%s.pdf', $surname, $given, $date);
    }
}
