<?php

namespace App\External\Documents\Announcement\MediaLibrary;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

/**
 * Tenant-isolated storage path for Announcement media on the s3 disk.
 *
 * Final shape:
 *   {municipal_id}/announcements/{announcement_id}/{collection}/{media_id}/{filename}
 */
class AnnouncementPathGenerator extends DefaultPathGenerator
{
    protected function getBasePath(Media $media): string
    {
        $announcement = $media->model;

        return sprintf(
            '%s/announcements/%s/%s/%s',
            $announcement->municipal_id,
            $announcement->id,
            $media->collection_name,
            $media->id,
        );
    }
}
