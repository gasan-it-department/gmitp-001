<?php

namespace App\Core\BulletinBoard\Announcement\Repository;

use App\Core\BulletinBoard\Announcement\Dto\AnnouncementQueryDto;
use App\Core\BulletinBoard\Announcement\Dto\UpdateAnnouncementDto;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Core\BulletinBoard\Announcement\Models\Announcement;
use App\Core\BulletinBoard\Announcement\Dto\AnnouncementFilterDto;
use App\Core\BulletinBoard\Announcement\Dto\CreateAnnouncementDto;

class AnnouncementRepository
{
    public function save(CreateAnnouncementDto $dto, string $announcementId, string $municipalId): Announcement
    {

        $announcement = Announcement::create([
            'id' => $announcementId,
            'title' => $dto->title,
            'message' => $dto->message,
            'user_id' => $dto->userId,
            'municipal_id' => $municipalId,
            'is_published' => $dto->isPublish,
        ]);

        return $announcement;

    }

    public function update(UpdateAnnouncementDto $dto, string $id)
    {
        $announcement = Announcement::findOrFail($id);

        $updates = [];

        if (!is_null($dto->title)) {
            $updates['title'] = $dto->title;
        }

        if (!is_null($dto->message)) {
            $updates['message'] = $dto->message;
        }

        if (!empty($updates)) {

            $announcement->update($updates);

        }

        return $announcement;
    }

    public function delete(string $id)
    {
        $announcement = Announcement::findOrFail($id);

        $announcement->delete();
    }

    public function multipleDelete(array $ids)
    {

        return Announcement::whereIn('id', $ids)
            ->delete();

    }

    public function findById($id): Announcement
    {

        return Announcement::findOrFail($id);

    }

    public function updateStatus($id, bool $isPublish): void
    {

        Announcement::where('id', $id)->update([
            'is_published' => $isPublish
        ]);

    }

    //for admin usage
    public function fetchByMunicipalId(string $municipalId, AnnouncementQueryDto $dto): LengthAwarePaginator
    {

        $query = Announcement::where('municipal_id', $municipalId)
            ->where('is_published', $dto->isPublished)
            ->with('user');

        if (!empty($dto->search)) {

            $searchTerm = '%' . $dto->search . '%';

            $query->where(function ($q) use ($searchTerm) {

                $q->where('title', 'like', $searchTerm)
                    ->orWhere('message', 'like', $searchTerm)
                    ->orWhereHas('user', function ($userQ) use ($searchTerm) {
                        $userQ->where('user_name', 'like', $searchTerm);
                    });

            });

        }


        return $query->orderBy($dto->orderBy, $dto->direction)
            ->paginate($dto->perPage);

    }

    //use for the public view filtered by municipal
    public function getPublished(string $municipalId, bool $isPublish, AnnouncementQueryDto $dto): LengthAwarePaginator
    {

        $query = Announcement::where('municipal_id', $municipalId)
            ->where('is_published', $isPublish);

        if (!empty($dto->search)) {

            $searchTerm = '%' . $dto->search . '%';

            $query->where(function ($q) use ($searchTerm) {

                $q->where('title', 'like', $searchTerm)
                    ->orWhere('description', 'like', $searchTerm)
                    ->orWhereHas('user', function ($userQ) use ($searchTerm) {
                        $userQ->where('name', 'like', $searchTerm);
                    });

            });

        }

        return $query->orderBy($dto->orderBy, $dto->direction)
            ->paginate($dto->perPage);

    }
}