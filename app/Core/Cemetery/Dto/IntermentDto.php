<?php

namespace App\Core\Cemetery\Dto;

use App\External\Api\Request\Cemetery\CreateIntermentRequest;

/**
 * Immutable transport for "assign decedent to plot" payloads.
 */
final readonly class IntermentDto
{
    public function __construct(
        public string  $municipalId,
        public string  $decedentId,
        public string  $plotId,
        public string  $intermentDate,
        public string  $status,
    ) {
    }

    public static function fromCreateRequest(CreateIntermentRequest $request): self
    {
        $data = $request->validated();

        return new self(
            municipalId: app('municipal_id'),
            decedentId: $data['decedent_id'],
            plotId: $data['plot_id'],
            intermentDate: $data['interment_date'],
            // Default is "interred" because the LGU admin only confirms an
            // assignment once the burial is happening; "pending" is reserved
            // for future scheduling flows.
            status: $data['status'] ?? 'interred',
        );
    }
}
