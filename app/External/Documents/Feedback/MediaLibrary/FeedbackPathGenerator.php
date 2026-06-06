<?php

namespace App\External\Documents\Feedback\MediaLibrary;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

/**
 * Tenant-isolated storage path for FeedbackSubmission media on the s3 disk.
 *
 * Final shape:
 *   {municipal_id}/feedback/submissions/{submission_id}/{collection}/{media_id}/{filename}
 */
class FeedbackPathGenerator extends DefaultPathGenerator
{
    protected function getBasePath(Media $media): string
    {
        $submission = $media->model;

        return sprintf(
            '%s/feedback/submissions/%s/%s/%s',
            $submission->municipal_id,
            $submission->id,
            $media->collection_name,
            $media->id,
        );
    }
}
