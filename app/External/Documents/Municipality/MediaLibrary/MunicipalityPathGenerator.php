<?php

namespace App\External\Documents\Municipality\MediaLibrary;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

/**
 * Tenant-isolated storage path for Municipality media on the s3 disk.
 *
 * Final shape:
 *   {municipal_id}/municipality/{collection}/{media_id}/{filename}
 */
class MunicipalityPathGenerator extends DefaultPathGenerator
{
    protected function getBasePath(Media $media): string
    {
        $municipality = $media->model;

        return sprintf(
            '%s/municipality/%s/%s',
            $municipality->id,
            $media->collection_name,
            $media->id,
        );
    }
}
