<?php

namespace App\Core\Announcement\Actions;

use App\Core\Announcement\Dto\StoreAnnouncementDto;
use App\Core\Announcement\Models\Announcement;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class StoreAnnouncementAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(StoreAnnouncementDto $dto): Announcement
    {
        return DB::transaction(function () use ($dto) {
            $announcement = Announcement::create([
                'id'           => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'user_id'      => $dto->userId,
                'title'        => $dto->title,
                'content'      => $dto->content,
                'type'         => $dto->type,
                'is_published' => $dto->isPublished,
            ]);

            foreach ($dto->images as $file) {
                if (! $file instanceof UploadedFile) {
                    continue;
                }

                $announcement
                    ->addMedia($file)
                    ->usingFileName($file->getClientOriginalName())
                    ->toMediaCollection('announcement_images');
            }

            return $announcement->fresh(['media']);
        }, attempts: 3);
    }
}
