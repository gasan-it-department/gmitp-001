<?php

namespace App\External\Documents\Department\MediaLibrary;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

/**
 * Tenant-isolated storage path for Department media on the s3 disk.
 *
 * Final shape:
 *   {municipal_id}/departments/{department_id}/{collection}/{media_id}/{filename}
 */
class DepartmentPathGenerator extends DefaultPathGenerator
{
    protected function getBasePath(Media $media): string
    {
        $department = $media->model;

        return sprintf(
            '%s/departments/%s/%s/%s',
            $department->municipal_id,
            $department->id,
            $media->collection_name,
            $media->id,
        );
    }
}
