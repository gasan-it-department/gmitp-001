<?php

use App\Core\ActionCenter\Dto\Assistance\CertificateOfEligibilityData;
use App\Core\ActionCenter\Dto\Assistance\DisbursementVoucherData;
use App\Core\ActionCenter\Dto\Assistance\FinancialDocumentPacketData;
use App\Core\ActionCenter\Dto\Assistance\GenerateFinancialDocumentPacketDto;
use App\Core\ActionCenter\Dto\Assistance\ObligationRequestData;
use App\External\Api\Request\ActionCenter\GenerateFinancialDocumentPacketRequest;
use App\External\Documents\ActionCenter\Pdf\FinancialDocumentPacketPdf;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Validator;
use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\StreamReader;

it('requires the shared and document-specific packet fields', function () {
    $request = new GenerateFinancialDocumentPacketRequest;
    $validator = Validator::make([], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->keys())->toContain(
            'intake_date',
            'obligation_request_number',
            'responsibility_center',
            'account_code',
            'particulars',
            'mode_of_payment',
            'explanation',
            'mswdo_printed_name',
            'budget_officer_printed_name',
            'accountant_printed_name',
            'treasurer_printed_name',
            'mayor_printed_name',
        );
});

it('maps each shared input to every document that uses it', function () {
    $dto = new GenerateFinancialDocumentPacketDto(
        assistanceRequestId: 'request-id',
        municipalId: 'municipal-id',
        intakeDate: CarbonImmutable::parse('2026-08-24'),
        obligationRequestNumber: '200-2026-08-0001',
        responsibilityCenter: '7611',
        accountCode: '5-02-99-080',
        particulars: 'Obligation particulars',
        office: 'MSWDO',
        fpp: null,
        disbursementVoucherNumber: 'DV-0001',
        modeOfPayment: 'cash',
        tinEmployeeNumber: null,
        explanation: 'Voucher explanation',
        mswdoPrintedName: 'Rebecca S. Bisnar',
        mswdoPosition: 'Social Welfare Officer III',
        budgetOfficerPrintedName: 'Edden M. Sager',
        budgetOfficerPosition: 'Municipal Budget Officer',
        accountantPrintedName: 'Jhea Mae R. Malapote',
        accountantPosition: 'Municipal Accountant',
        treasurerPrintedName: 'Maria Jesusa M. Ghosh',
        treasurerPosition: 'Municipal Treasurer',
        mayorPrintedName: 'Hon. Juan Dela Cruz',
        mayorPosition: 'Municipal Mayor',
    );

    expect($dto->obligationRequest()->obligationRequestNumber)->toBe('200-2026-08-0001')
        ->and($dto->disbursementVoucher()->obligationRequestNumber)->toBe('200-2026-08-0001')
        ->and($dto->obligationRequest()->responsibilityCenter)->toBe('7611')
        ->and($dto->disbursementVoucher()->responsibilityCenterCode)->toBe('7611')
        ->and($dto->obligationRequest()->office)->toBe('MSWDO')
        ->and($dto->disbursementVoucher()->responsibilityCenterOffice)->toBe('MSWDO')
        ->and($dto->certificateOfEligibility()->certifiedByName)->toBe('Rebecca S. Bisnar')
        ->and($dto->certificateOfEligibility()->approvedByName)->toBe('Hon. Juan Dela Cruz');
});

it('merges certificate obligation request and disbursement voucher into one three-page pdf', function () {
    $generatedAt = CarbonImmutable::parse('2026-08-25 10:00:00');
    $transactionNumber = 'REQ-2026-00001';
    $obligationRequestNumber = '200-2026-08-0001';

    $data = new FinancialDocumentPacketData(
        certificateOfEligibility: new CertificateOfEligibilityData(
            transactionNumber: $transactionNumber,
            municipalityName: 'Gasan',
            provinceName: 'Marinduque',
            trunklinePhone: '(042) 342-1572',
            municipalityLogoDataUri: null,
            subjectName: 'Share Mae Rejano',
            subjectAgePhrase: 'of legal age',
            subjectCivilStatus: 'Single',
            address: 'Brgy. Bognuyan, Gasan, Marinduque',
            assistanceType: 'Medical Assistance',
            intakeDate: CarbonImmutable::parse('2026-08-24'),
            certifiedByName: 'Rebecca S. Bisnar',
            certifiedByPosition: 'Social Welfare Officer III',
            approvedByName: 'Hon. Juan Dela Cruz',
            approvedByPosition: 'Municipal Mayor',
            generatedByUserName: 'Test Admin',
            generatedAt: $generatedAt,
        ),
        obligationRequest: new ObligationRequestData(
            transactionNumber: $transactionNumber,
            municipalityName: 'Gasan',
            municipalityLogoDataUri: null,
            payee: 'Share Mae Rejano',
            address: 'Brgy. Bognuyan, Gasan, Marinduque',
            assistanceType: 'Medical Assistance',
            approvedAmount: 1000,
            obligationRequestNumber: $obligationRequestNumber,
            responsibilityCenter: '7611',
            accountCode: '5-02-99-080',
            particulars: "Payment for Medical Assistance\nRE: Aid/Assistance to Individual in Crisis\nSituation (AICS) CY 2026",
            mswdoPrintedName: 'Rebecca S. Bisnar',
            mswdoPosition: 'Social Welfare Officer III',
            budgetOfficerPrintedName: 'Edden M. Sager',
            budgetOfficerPosition: 'Municipal Budget Officer',
            office: 'MSWDO',
            fpp: null,
            generatedByUserName: 'Test Admin',
            generatedAt: $generatedAt,
        ),
        disbursementVoucher: new DisbursementVoucherData(
            transactionNumber: $transactionNumber,
            municipalityName: 'Gasan',
            municipalityLogoDataUri: null,
            payee: 'Share Mae Rejano',
            address: 'Brgy. Bognuyan, Gasan, Marinduque',
            assistanceType: 'Medical Assistance',
            approvedAmount: 1000,
            disbursementVoucherNumber: null,
            modeOfPayment: 'cash',
            tinEmployeeNumber: null,
            obligationRequestNumber: $obligationRequestNumber,
            responsibilityCenterOffice: 'MSWDO',
            responsibilityCenterCode: '7611',
            explanation: "Payment for Medical Assistance\nRE: AICS CY 2026\nONE THOUSAND PESOS ONLY",
            accountantPrintedName: 'Jhea Mae R. Malapote',
            accountantPosition: 'Municipal Accountant',
            treasurerPrintedName: 'Maria Jesusa M. Ghosh',
            treasurerPosition: 'Municipal Treasurer',
            mayorPrintedName: 'Hon. Juan Dela Cruz',
            mayorPosition: 'Municipal Mayor',
            generatedByUserName: 'Test Admin',
            generatedAt: $generatedAt,
        ),
    );

    $response = app(FinancialDocumentPacketPdf::class)->response($data);
    $reader = new Fpdi;
    $pageCount = $reader->setSourceFile(
        StreamReader::createByString($response->getContent()),
    );

    expect($response->getStatusCode())->toBe(200)
        ->and($response->headers->get('content-type'))->toBe('application/pdf')
        ->and($response->headers->get('content-disposition'))->toContain('financial-document-packet_REQ-2026-00001_2026-08-25.pdf')
        ->and($response->getContent())->toStartWith('%PDF')
        ->and($pageCount)->toBe(3);
});
