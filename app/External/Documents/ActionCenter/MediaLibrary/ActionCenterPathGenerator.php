<?php

namespace App\External\Documents\ActionCenter\MediaLibrary;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

/**
 * Custom storage path for ActionCenter media.
 *
 * Final shape:
 *   action-center/{municipal_id}/assistance-requests/{request_id}/{collection}/{media_id}/{filename}
 *
 * Spatie's DefaultPathGenerator already implements getPath / getPathFor-
 * Conversions / getPathForResponsiveImages on top of getBasePath() — they
 * just append '/', '/conversions/', '/responsive-images/'. We only need to
 * override getBasePath() to change the folder layout.
 */
class ActionCenterPathGenerator extends DefaultPathGenerator
{
    protected function getBasePath(Media $media): string
    {
        $request = $media->model;

        return sprintf(
            '%s/action-center/assistance-requests/%s/%s/%s',
            $request->municipal_id,
            $request->id,
            $media->collection_name,
            $media->id,
        );

    }
}