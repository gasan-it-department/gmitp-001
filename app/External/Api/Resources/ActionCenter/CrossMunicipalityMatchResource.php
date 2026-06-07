<?php

namespace App\External\Api\Resources\ActionCenter;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The disclosure cap for a cross-municipality double-dip match.
 *
 * Surfaces ONLY where the same person also appears (municipality name + code)
 * and a public hotline to coordinate — deliberately NOT the other LGU's
 * beneficiary record, amounts, or assistance history, which stay inside that
 * tenant. Even if {@see \App\Core\ActionCenter\UseCase\Beneficiary\FindCrossMunicipalityMatchesAction}
 * is later changed to carry more, this resource is the single serialization
 * point and emits only these three fields.
 *
 * Fed an associative array (see the detector), so it reads via array access.
 */
class CrossMunicipalityMatchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'municipality_name' => $this->resource['municipality_name'] ?? null,
            'municipal_code' => $this->resource['municipal_code'] ?? null,
            'contact' => $this->resource['contact'] ?? null,
        ];
    }
}
