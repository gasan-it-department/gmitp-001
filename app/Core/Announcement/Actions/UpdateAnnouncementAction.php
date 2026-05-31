<?php

namespace App\Core\Announcement\Actions;

use App\Core\Announcement\Dto\UpdateAnnouncementDto;
use App\Core\Announcement\Models\Announcement;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class UpdateAnnouncementAction
{
    public function execute(string $id, UpdateAnnouncementDto $dto): Announcement
    {
        return DB::transaction(function () use ($id, $dto) {
            $announcement = Announcement::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($id)
                ->firstOrFail();

            $payload = array_filter([
                'title'        => $dto->title,
                'content'      => $dto->content,
                'type'         => $dto->type,
                'is_published' => $dto->isPublished,
            ], fn ($v) => ! is_null($v));

            if (! empty($payload)) {
                $announcement->update($payload);
            }

            if (! empty($dto->images)) {
                $announcement->clearMediaCollection('announcement_images');

                foreach ($dto->images as $file) {
                    if (! $file instanceof UploadedFile) {
                        continue;
                    }

                    $announcement
                        ->addMedia($file)
                        ->usingFileName($file->getClientOriginalName())
                        ->toMediaCollection('announcement_images');
                }
            }

            return $announcement->fresh(['media']);
        }, attempts: 3);
    }
}
