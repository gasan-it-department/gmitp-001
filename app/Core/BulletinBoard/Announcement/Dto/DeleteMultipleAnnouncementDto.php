<?php

namespace App\Core\BulletinBoard\Announcement\Dto;

class DeleteMultipleAnnouncementDto
{

    public function __construct(
        public readonly array $ids,
    ) {
    }

}