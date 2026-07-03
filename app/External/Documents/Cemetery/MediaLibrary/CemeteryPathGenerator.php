<?php

namespace App\External\Documents\Cemetery\MediaLibrary;

use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\DecedentDocument;
use BackedEnum;
use Illuminate\Database\Eloquent\Relations\Relation;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

class CemeteryPathGenerator extends DefaultPathGenerator
{
    protected function getBasePath(Media $media): string
    {
        $model = $this->resolveModel($media);

        if ($model instanceof DecedentDocument) {
            $documentType = $model->type instanceof BackedEnum ? $model->type->value : (string) $model->type;

            return sprintf(
                '%s/cemetery/decedents/%s/documents/%s/%s/%s/%s',
                $model->municipal_id,
                $model->decedent_id,
                $documentType,
                $model->id,
                $media->collection_name,
                $media->id,
            );
        }

        if ($model instanceof Decedent) {
            return sprintf(
                '%s/cemetery/decedents/%s/%s/%s',
                $model->municipal_id,
                $model->id,
                $media->collection_name,
                $media->id,
            );
        }

        return parent::getBasePath($media);
    }

    private function resolveModel(Media $media): mixed
    {
        if ($media->model) {
            return $media->model;
        }

        $modelClass = Relation::getMorphedModel($media->model_type) ?? $media->model_type;

        if (is_a($modelClass, DecedentDocument::class, true)) {
            return DecedentDocument::withTrashed()->find($media->model_id);
        }

        if (is_a($modelClass, Decedent::class, true)) {
            return Decedent::withTrashed()->find($media->model_id);
        }

        return null;
    }
}
