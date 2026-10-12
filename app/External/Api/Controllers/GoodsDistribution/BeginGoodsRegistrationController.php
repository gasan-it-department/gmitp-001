<?php

namespace App\External\Api\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\ReviewGoodsRegistrationAction;
use App\External\Api\Request\GoodsDistribution\BeginGoodsRegistrationRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

final class BeginGoodsRegistrationController extends Controller
{
    public function __invoke(BeginGoodsRegistrationRequest $request, ReviewGoodsRegistrationAction $review): RedirectResponse
    {
        try {
            $data = $request->validated();
            $review->execute($data, app('municipal_id'), $request->user()->id);
        } catch (\DomainException $exception) {
            return back()->withErrors(['registration_check' => $exception->getMessage()]);
        }

        $key = (string) Str::ulid();
        $drafts = array_filter($request->session()->get('goods_registration', []), fn ($draft) => $draft['created_at'] >= now()->subMinutes(30)->timestamp);
        $drafts[$key] = [
            'municipal_id' => app('municipal_id'),
            'actor_id' => $request->user()->id,
            'household_id' => $data['household_id'] ?? null,
            'created_at' => now()->timestamp,
            'registration' => [
                'identity' => [
                    'first_name' => $data['first_name'],
                    'middle_name' => $data['middle_name'] ?? '',
                    'last_name' => $data['last_name'],
                    'suffix' => $data['suffix'] ?? '',
                    'birth_date' => $data['birth_date'],
                ],
                'context' => $data['identity_check_context'],
                'reason' => $data['different_person_reason'] ?? null,
            ],
        ];
        $request->session()->put('goods_registration', array_slice($drafts, -10, preserve_keys: true));

        return redirect()->route(isset($data['household_id']) ? 'goodsDistribution.member.create' : 'goodsDistribution.head.create', [
            'municipality' => app('current_municipality')->slug,
            ...isset($data['household_id']) ? ['householdId' => $data['household_id']] : [],
            'draft' => $key,
        ]);
    }
}
