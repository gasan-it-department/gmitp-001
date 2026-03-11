<?php

namespace App\External\Api\Controllers\Government\OfficialTerms;

use App\Core\Government\Dto\ConcludeOfficialDto;
use App\Core\Government\UseCase\ConcludeOfficialUseCase;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\Request;

class ConcludeOfficialTermController extends Controller
{

    public function __construct(
        private ConcludeOfficialUseCase $concludeOfficial,
    ) {
    }
    public function __invoke(Request $request, string $id)
    {
        $validated = $request->validate([
            'actual_end_date' => ['required', 'date', 'before_or_equal:today'],

            'status' => ['required', 'string', 'in:resigned,promoted,deceased,removed,others'],
        ]);

        $dto = ConcludeOfficialDto::fromRequest($validated);

        try {

            $this->concludeOfficial->execute($id, app('municipal_id'), $dto);

            return redirect()->back()->with('success', 'Official service successfully concluded. The position is now vacant.');

        } catch (DomainException $e) {

            return redirect()->back()->with('error', $e->getMessage());

        }
    }

}