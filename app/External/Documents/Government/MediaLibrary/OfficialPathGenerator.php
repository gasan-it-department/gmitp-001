<?php

namespace App\External\Documents\Government\MediaLibrary;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

/**
 * Tenant-isolated storage path for Government Official media.
 *
 * Final shape:
 *   {municipal_id}/government/officials/{official_id}/{collection}/{media_id}/{filename}
 */
class OfficialPathGenerator extends DefaultPathGenerator
{
    protected function getBasePath(Media $media): string
    {
        $official = $media->model;

        return sprintf(
            '%s/government/officials/%s/%s/%s',
            $official->municipal_id,
            $official->id,
            $media->collection_name,
            $media->id,
        );
    }
}
