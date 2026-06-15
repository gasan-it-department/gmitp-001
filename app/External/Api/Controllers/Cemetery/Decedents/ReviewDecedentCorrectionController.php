<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\ReviewDecedentCorrectionAction;
use App\External\Api\Request\Cemetery\Decedents\ReviewCorrectionRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class ReviewDecedentCorrectionController extends Controller
{
    public function __construct(private ReviewDecedentCorrectionAction $reviewCorrection) {}

    public function __invoke(ReviewCorrectionRequest $request, string $decedentId, string $correctionId): RedirectResponse
    {
        $data = $request->validated();
        $this->reviewCorrection->execute(
            $correctionId,
            $decedentId,
            app('municipal_id'),
            $data['approved'],
            $data['review_notes'] ?? null,
        );

        return back()->with('success', 'Correction review recorded.');
    }
}
