<?php

namespace App\External\Api\Resources\Municipality;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Core\Users\Services\UserRoleCheckerService;
class MunicipalityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = request()->user();

        $roleChecker = app(UserRoleCheckerService::class);

        $logo = $this->getFirstMedia('logo');
        $logoUrl = $logo
            ? ($logo->disk === 's3'
                ? $logo->getTemporaryUrl(now()->addMinutes(15), 'optimized_logo')
                : $logo->getUrl('optimized_logo'))
            : null;

        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'psgc_municipal_id' => $this->psgc_municipal_id,
            'zip_code' => $this->zip_code,
            'municipal_code' => $this->municipal_code,
            'settings' => [
                'logo_url' => $logoUrl,
            ],
        ];

        if ($user && $roleChecker->isSuperAdmin($user)) {
            $data['is_active'] = $this->is_active;
        }

        return $data;
    }
}
