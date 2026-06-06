<?php

namespace App\External\Documents\Event\MediaLibrary;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

/**
 * Tenant-isolated storage path for Event media on the s3 disk.
 *
 * Final shape:
 *   {municipal_id}/events/{event_id}/{collection}/{media_id}/{filename}
 */
class EventPathGenerator extends DefaultPathGenerator
{
    protected function getBasePath(Media $media): string
    {
        $event = $media->model;

        return sprintf(
            '%s/events/%s/%s/%s',
            $event->municipal_id,
            $event->id,
            $media->collection_name,
            $media->id,
        );
    }
}
