<?php

namespace App\External\Api\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        return [

            'id' => $this->id,

            'first_name' => $this->first_name,

            'last_name' => $this->last_name,

            'middle_name' => $this->middle_name,

            'phone' => $this->phone,

            'email' => $this->phone,

            'user_name' => $this->user_name,

            'roles' => $this->getRoleNames(),

            'direct_permissions' => $this->permissions->pluck('name'),

            'all_permission' => $this->getAllPermissions()->pluck('name'),

        ];

    }
}
