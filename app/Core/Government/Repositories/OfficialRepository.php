<?php

namespace App\Core\Government\Repositories;

use App\Core\Government\Dto\OfficialDto;
use App\Core\Government\Dto\OfficialQueryDto;
use App\Core\Government\Models\Official;

class OfficialRepository
{

    public function addOfficial(OfficialDto $dto, string $officialId, ?string $profileUrl, ?string $imgPublicId)
    {

        return Official::create([
            'id' => $officialId,
            'first_name' => $dto->firstName,
            'last_name' => $dto->lastName,
            'middle_name' => $dto->middleName,
            'suffix' => $dto->suffix,
            'gender' => $dto->gender,
            'municipal_id' => $dto->municipalId,
            'biography' => $dto->biography,
            'profile_url' => $profileUrl,
            'profile_public_id' => $imgPublicId,
        ]);

    }

    public function update(array $data, string $municipalId, string $officialId)
    {

        $official = $this->findOfficialById($municipalId, $officialId);

        $official->update($data);

        return $official;

    }

    public function getPaginatedList(string $municipalId, OfficialQueryDto $filters)
    {

        return Official::query()
            ->where('municipal_id', $municipalId)
            ->withCount(['appointments'])
            ->withExists('activeAppointments')

            ->when($filters->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
                });

            })
            ->when($filters->isCurrentlyServing !== null, function ($query) use ($filters) {
                if ($filters->isCurrentlyServing) {
                    $query->whereHas('activeAppointments');
                } else {
                    $query->whereDoesntHave('activeAppointments');
                }
            })
            ->orderBy($filters->sortBy, $filters->sortDirection)
            ->paginate($filters->perPage)
            ->withQueryString();
    }

    public function search(string $query, string $municipalId)
    {
        $terms = array_filter(explode(' ', trim($query)));

        return Official::query()
            ->where('municipal_id', $municipalId) // Don't forget the tenant isolation!
            ->where(function ($q) use ($terms) {
                foreach ($terms as $term) {
                    $q->where(function ($sub) use ($term) {
                        $sub->where('first_name', 'like', "%{$term}%")
                            ->orWhere('last_name', 'like', "%{$term}%")
                            ->orWhere('middle_name', 'like', "%{$term}%");
                    });
                }
            })
            ->orderBy('last_name', 'asc')
            ->limit(10)
            ->get();
    }

    public function findWithProfileById(string $officialId, string $municipalId)
    {

        return Official::query()
            ->where('municipal_id', $municipalId)
            ->withCount('appointments')
            ->withExists('activeAppointments')
            ->with([
                'appointments.position',
                'appointments.term'
            ])
            ->findOrFail($officialId);
    }

    public function findOfficialById(string $municipalId, string $officialId)
    {

        return Official::where('municipal_id', $municipalId)
            ->findOrFail($officialId);

    }
}