<?php

namespace App\External\Api\Resources\Department;

use Illuminate\Http\Request;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class DepartmentDetailsResource extends DepartmentBaseResource
{
    public function toArray(Request $request): array
    {
        /** @var Media|null $logo */
        $logo = $this->getFirstMedia('department_logo');

        return array_merge(parent::toArray($request), [
            'code' => $this->code,
            'description' => $this->description,
            'logo_url' => $logo
                ? ($logo->disk === 's3'
                    ? $logo->getTemporaryUrl(now()->addMinutes(15))
                    : $logo->getUrl())
                : null,
            'created_at' => $this->created_at?->format('M d, Y'),
        ]);
    }
}
