<?php

namespace App\Core\Cemetery\Actions\ServiceRequests;

use App\Core\Cemetery\Dto\IntermentDto;
use App\Core\Cemetery\Dto\Interments\CloseIntermentDto;
use App\Core\Cemetery\Dto\Interments\MoveIntermentDto;
use App\Core\Cemetery\Enums\CemeteryServiceRequestConsentMethod;
use App\Core\Cemetery\Enums\CemeteryServiceRequestType;
use App\Core\Cemetery\Enums\IntermentEndType;
use App\Core\Cemetery\Enums\PlotLeaseStatus;
use App\Core\Cemetery\Models\CemeteryServiceRequest;
use App\Core\Cemetery\Models\Interment;
use App\Core\Cemetery\Models\Plot;
use App\Core\Cemetery\Models\PlotLease;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class StoreCemeteryServiceRequestAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {}

    public function executeForInterment(Interment $interment, Plot $plot, IntermentDto $dto): CemeteryServiceRequest
    {
        $activeLease = $this->lockActiveLeaseForPlot($dto->municipalId, $plot->id);

        return $this->createServiceRequest(
            requestable: $interment,
            relatedPlot: $plot,
            dto: $dto,
            requestType: CemeteryServiceRequestType::INTERMENT,
            consentTargetLease: $activeLease,
            properties: [
                'plot_id' => $plot->id,
                'decedent_id' => $interment->decedent_id,
            ],
        );
    }

    public function executeForMove(Interment $transfer, Plot $sourcePlot, Plot $destinationPlot, MoveIntermentDto $dto): CemeteryServiceRequest
    {
        $destinationLease = $this->lockActiveLeaseForPlot($dto->municipalId, $destinationPlot->id);
        $sourceLease = $destinationLease ? null : $this->lockActiveLeaseForPlot($dto->municipalId, $sourcePlot->id);

        return $this->createServiceRequest(
            requestable: $transfer,
            relatedPlot: $destinationPlot,
            dto: $dto,
            requestType: CemeteryServiceRequestType::PLOT_MOVE,
            consentTargetLease: $destinationLease ?? $sourceLease,
            properties: [
                'previous_interment_id' => $transfer->previous_interment_id,
                'transfer_interment_id' => $transfer->id,
                'decedent_id' => $transfer->decedent_id,
                'source_plot_id' => $sourcePlot->id,
                'destination_plot_id' => $destinationPlot->id,
                'consent_target' => $destinationLease ? 'destination_plot' : ($sourceLease ? 'source_plot' : 'not_applicable'),
            ],
        );
    }

    public function executeForClosure(Interment $interment, Plot $plot, CloseIntermentDto $dto): CemeteryServiceRequest
    {
        $activeLease = $this->lockActiveLeaseForPlot($dto->municipalId, $plot->id);
        $requestType = $dto->endType === IntermentEndType::TRANSFERRED_OUT->value
            ? CemeteryServiceRequestType::TRANSFER_OUT
            : CemeteryServiceRequestType::EXHUMATION;

        return $this->createServiceRequest(
            requestable: $interment,
            relatedPlot: $plot,
            dto: $dto,
            requestType: $requestType,
            consentTargetLease: $activeLease,
            properties: [
                'interment_id' => $interment->id,
                'decedent_id' => $interment->decedent_id,
                'plot_id' => $plot->id,
                'end_type' => $dto->endType,
                'permit_reference' => $dto->permitReference,
                'transfer_destination' => $dto->transferDestination,
                'consent_target' => $activeLease ? 'current_plot' : 'not_applicable',
            ],
        );
    }

    private function createServiceRequest(
        Interment $requestable,
        Plot $relatedPlot,
        IntermentDto|MoveIntermentDto|CloseIntermentDto $dto,
        CemeteryServiceRequestType $requestType,
        ?PlotLease $consentTargetLease,
        array $properties,
    ): CemeteryServiceRequest {
        $this->validateRequester($dto, $consentTargetLease);

        $consentMethod = $this->resolveConsentMethod($dto, $consentTargetLease);

        $serviceRequest = $requestable->serviceRequests()->create([
            'id' => $this->idGenerator->generate(),
            'municipal_id' => $dto->municipalId,
            'request_type' => $requestType,
            'requesting_party_name' => $dto->requestingPartyName,
            'requesting_party_contact' => $dto->requestingPartyContact,
            'requesting_party_address' => $dto->requestingPartyAddress,
            'requesting_party_relationship' => $dto->requestingPartyRelationship,
            'requester_is_leaseholder' => $consentTargetLease !== null && $dto->requesterIsLeaseholder,
            'leaseholder_name_snapshot' => $consentTargetLease?->leaseholder_name,
            'leaseholder_contact_snapshot' => $consentTargetLease?->leaseholder_contact,
            'leaseholder_consent_confirmed' => $this->resolveConsentConfirmed($dto, $consentTargetLease),
            'leaseholder_consent_method' => $consentMethod,
            'leaseholder_consent_reference' => $this->resolveConsentReference($dto, $consentTargetLease),
            'notes' => $dto->serviceRequestNotes,
            'created_by' => auth()->id(),
        ]);

        if ($dto->authorizationEvidence instanceof UploadedFile) {
            $serviceRequest->addMedia($dto->authorizationEvidence)
                ->usingFileName($this->evidenceFileName($serviceRequest, $dto->authorizationEvidence))
                ->toMediaCollection('authorization_evidence', 'local');
        }

        activity('cemetery_service_request')
            ->performedOn($serviceRequest)
            ->causedBy(auth()->user())
            ->withProperties($properties + [
                'request_type' => $requestType->value,
                'requestable_id' => $requestable->id,
                'plot_id' => $relatedPlot->id,
                'requesting_party_name' => $dto->requestingPartyName,
                'requester_is_leaseholder' => $consentTargetLease !== null && $dto->requesterIsLeaseholder,
                'leaseholder_consent_method' => $consentMethod,
            ])
            ->event('service_request_recorded')
            ->log('Cemetery service request recorded.');

        return $serviceRequest;
    }

    private function lockActiveLeaseForPlot(string $municipalId, string $plotId): ?PlotLease
    {
        return PlotLease::query()
            ->where('municipal_id', $municipalId)
            ->where('plot_id', $plotId)
            ->where('status', PlotLeaseStatus::ACTIVE->value)
            ->lockForUpdate()
            ->latest('created_at')
            ->first();
    }

    private function validateRequester(IntermentDto|MoveIntermentDto|CloseIntermentDto $dto, ?PlotLease $activeLease): void
    {
        $messages = [];

        if ($dto->requestingPartyName === null) {
            $messages['requesting_party_name'] = 'Enter the name of the person requesting this cemetery action.';
        }

        if ($dto->requestingPartyRelationship === null) {
            $messages['requesting_party_relationship'] = 'Enter the requester relationship or role.';
        }

        if ($activeLease !== null && ! $dto->requesterIsLeaseholder) {
            if (! $dto->leaseholderConsentConfirmed) {
                $messages['leaseholder_consent_confirmed'] = 'Confirm that the active leaseholder authorized this cemetery action.';
            }

            if (
                $dto->leaseholderConsentMethod === null
                || $dto->leaseholderConsentMethod === CemeteryServiceRequestConsentMethod::NOT_APPLICABLE->value
            ) {
                $messages['leaseholder_consent_method'] = 'Select how the active leaseholder authorization was confirmed.';
            }

            if ($dto->leaseholderConsentReference === null) {
                $messages['leaseholder_consent_reference'] = 'Enter the authorization reference or proof note.';
            }
        }

        if ($messages !== []) {
            throw ValidationException::withMessages($messages);
        }
    }

    private function resolveConsentMethod(IntermentDto|MoveIntermentDto|CloseIntermentDto $dto, ?PlotLease $activeLease): string
    {
        if ($activeLease === null) {
            return CemeteryServiceRequestConsentMethod::NOT_APPLICABLE->value;
        }

        if ($dto->requesterIsLeaseholder) {
            return CemeteryServiceRequestConsentMethod::LEASEHOLDER_PRESENT->value;
        }

        return $dto->leaseholderConsentMethod ?? CemeteryServiceRequestConsentMethod::VERBAL_AUTHORIZATION->value;
    }

    private function resolveConsentConfirmed(IntermentDto|MoveIntermentDto|CloseIntermentDto $dto, ?PlotLease $activeLease): bool
    {
        if ($activeLease === null) {
            return false;
        }

        return $dto->requesterIsLeaseholder || $dto->leaseholderConsentConfirmed;
    }

    private function resolveConsentReference(IntermentDto|MoveIntermentDto|CloseIntermentDto $dto, ?PlotLease $activeLease): ?string
    {
        if ($activeLease === null || $dto->requesterIsLeaseholder) {
            return null;
        }

        return $dto->leaseholderConsentReference;
    }

    private function evidenceFileName(CemeteryServiceRequest $serviceRequest, UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'bin');

        return 'authorization-evidence-'.$serviceRequest->id.'.'.$extension;
    }
}
