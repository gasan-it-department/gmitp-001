<?php

namespace App\Core\BulletinBoard\Announcement\Repository;

use App\Core\BulletinBoard\Announcement\Dto\CreateAnnouncementDto;
use App\Core\BulletinBoard\Announcement\Interfaces\AnnouncementRepositoryInterface;
use App\Core\BulletinBoard\Announcement\Models\Announcement;
use App\Core\BulletinBoard\Announcement\Dto\AnnouncementFilterDto;
use Illuminate\Database\Eloquent\Collection;

class AnnouncementRepository implements AnnouncementRepositoryInterface
{
    public function save(CreateAnnouncementDto $dto, string $announcementId, string $municipalId): Announcement
    {
        $announcement = Announcement::create([
            'id' => $announcementId,
            'title' => $dto->title,
            'message' => $dto->message,
            'user_id' => $dto->userId,
            'municipal_id' => $municipalId,
        ]);

        return $announcement;
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

    public function getAll(string $municipalId): Collection
    {
        $announcements = Announcement::where('municipal_id', $municipalId)->get();

        return $announcements;
    }

    public function getFiltered(AnnouncementFilterDto $dto): Announcement
    {
        $query = Announcement::query();

        if (!is_null($dto->isPublished)) {
            $query->where('is_published', $dto->isPublished);
        }

        if ($dto->fromDate) {
            $query->whereDate('created_at', '>=', $dto->fromDate);
        }

        if ($dto->toDate) {
            $query->whereDate('created_at', '<=', $dto->toDate);
        }

        return $query
            ->orderyBy('created_at', $dto->sort)
            ->paginate($dto->perPage);
    }
}