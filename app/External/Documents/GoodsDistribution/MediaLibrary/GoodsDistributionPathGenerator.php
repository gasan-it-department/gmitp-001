<?php

namespace App\External\Documents\GoodsDistribution\MediaLibrary;

use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

class GoodsDistributionPathGenerator extends DefaultPathGenerator
{
    public const VERSION_PROPERTY = 'goods_distribution_path_version';

    public const VERSION = 1;

    protected function getBasePath(Media $media): string
    {
        // Existing uploads retain Spatie's original path, including its configured prefix.
        if ($media->getCustomProperty(self::VERSION_PROPERTY) !== self::VERSION) {
            return parent::getBasePath($media);
        }

        $record = $media->model;
        $directory = match (true) {
            $record instanceof DistributionRequest => 'requests',
            $record instanceof BulkDispatch => 'bulk-dispatches',
            default => throw new \LogicException('Goods media must belong to a distribution request or bulk dispatch.'),
        };

        return sprintf('%s/goods-distribution/%s/%s/%s/%s',
            $record->municipal_id, $directory, $record->id, $media->collection_name, $media->id);
    }
}
