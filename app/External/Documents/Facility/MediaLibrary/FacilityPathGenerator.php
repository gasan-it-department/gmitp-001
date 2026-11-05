<?php

namespace App\External\Documents\Facility\MediaLibrary;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

class FacilityPathGenerator extends DefaultPathGenerator
{
    protected function getBasePath(Media $media): string
    {
        return sprintf('%s/facilities/%s/%s/%s', $media->model->municipal_id, $media->model_id, $media->collection_name, $media->id);
    }
}
