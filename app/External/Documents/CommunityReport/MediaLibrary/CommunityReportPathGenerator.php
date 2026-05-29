<?php

namespace App\External\Documents\CommunityReport\MediaLibrary;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

class CommunityReportPathGenerator extends DefaultPathGenerator
{
    protected function getBasePath(Media $media): string
    {
        $submission = $media->model;

        return sprintf(
            '%s/community-report/submissions/%s/%s/%s',
            $submission->municipal_id,
            $submission->id,
            $media->collection_name,
            $media->id,
        );
    }
}
