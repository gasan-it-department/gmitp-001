<?php

namespace App\External\Api\Resources\Department;

use Illuminate\Http\Request;

class DepartmentListResource extends DepartmentBaseResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'code' => $this->code,
        ]);
    }
}
