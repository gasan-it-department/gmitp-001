<?php

namespace App\External\Api\Controllers\Procurement;

use App\Core\Procurement\Dto\OpenBiddingDto;
use App\Core\Procurement\UseCases\OpenBiddingUseCase;
use App\External\Api\Request\Procurement\OpenBiddingRequest;

class OpenProcurementController
{
    public function __construct(
        private OpenBiddingUseCase $openBidding,
    ) {}

    public function __invoke(OpenBiddingRequest $request, string $procurementId)
    {
        $dto = OpenBiddingDto::fromRequest($request, $procurementId, app('municipal_id'));

        $procurement = $this->openBidding->execute(app('municipal_id'), $procurementId, $dto);

        return redirect()->back()->with([
            'success' => 'Procurement moved to Open Bidding and remains private until you publish it.',
            'data' => $procurement,
        ]);
    }
}
